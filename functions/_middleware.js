export async function onRequest(context) {
  const { env, next, request } = context;

  if (request.url.includes('/api/')) {
    try {
      const url = new URL(request.url);
      const path = url.pathname.replace('/api/', '');
      const method = request.method;

      if (path === 'products' && method === 'GET') {
        const products = await env.DB.prepare('SELECT * FROM Product').all();
        return new Response(JSON.stringify(products.results), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (path === 'cart' && method === 'GET') {
        const sessionId = url.searchParams.get('sessionId');
        const cartItems = await env.DB.prepare(`
          SELECT ci.*, p.name, p.price, p.imageUrl, p.id as productId
          FROM CartItem ci
          JOIN Product p ON ci.productId = p.id
          WHERE ci.sessionId = ?
        `).bind(sessionId).all();

        const formattedItems = cartItems.results.map(item => ({
          id: item.id,
          sessionId: item.sessionId,
          productId: item.productId,
          quantity: item.quantity,
          createdAt: item.createdAt,
          product: {
            id: item.productId,
            name: item.name,
            price: item.price,
            imageUrl: item.imageUrl
          }
        }));

        return new Response(JSON.stringify(formattedItems), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (path === 'cart' && method === 'POST') {
        const data = await request.json();
        const { sessionId, productId, quantity } = data;
        
        await env.DB.prepare(`
          INSERT INTO CartItem (id, sessionId, productId, quantity, createdAt)
          VALUES (?, ?, ?, ?, datetime('now'))
          ON CONFLICT(sessionId, productId) DO UPDATE SET quantity = quantity + ?
        `).bind(crypto.randomUUID(), sessionId, productId, quantity, quantity).run();
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (path === 'cart' && method === 'DELETE') {
        const sessionId = url.searchParams.get('sessionId');
        const productId = url.searchParams.get('productId');
        
        await env.DB.prepare(`
          DELETE FROM CartItem WHERE sessionId = ? AND productId = ?
        `).bind(sessionId, productId).run();
        
        return new Response(JSON.stringify({ success: true }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (path === 'checkout' && method === 'POST') {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(env.STRIPE_SECRET_KEY);
        const data = await request.json();
        const { sessionId, items } = data;

        const lineItems = items.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              images: [item.imageUrl],
              description: item.description,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: lineItems,
          mode: 'payment',
          success_url: `${env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${env.NEXT_PUBLIC_APP_URL}/cart`,
          metadata: { sessionId },
        });

        return new Response(JSON.stringify({ url: session.url }), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (path === 'webhook' && method === 'POST') {
        const Stripe = (await import('stripe')).default;
        const stripe = new Stripe(env.STRIPE_SECRET_KEY);
        const body = await request.text();
        const signature = request.headers.get('stripe-signature');

        try {
          const event = stripe.webhooks.constructEvent(
            body,
            signature,
            env.STRIPE_WEBHOOK_SECRET
          );

          if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const { metadata, customer_details, payment_intent, amount_total } = session;

            const orderId = crypto.randomUUID();
            
            await env.DB.prepare(`
              INSERT INTO "Order" (id, sessionId, customerEmail, customerName, total, status, stripePaymentId, createdAt)
              VALUES (?, ?, ?, ?, ?, 'completed', ?, datetime('now'))
            `).bind(orderId, metadata.sessionId, customer_details.email, customer_details.name, amount_total / 100, payment_intent).run();

            const cartItems = await env.DB.prepare(`
              SELECT * FROM CartItem WHERE sessionId = ?
            `).bind(metadata.sessionId).all();

            for (const item of cartItems.results) {
              await env.DB.prepare(`
                INSERT INTO OrderItem (id, orderId, productId, quantity, price)
                VALUES (?, ?, ?, ?, ?)
              `).bind(crypto.randomUUID(), orderId, item.productId, item.quantity, item.price).run();

              await env.DB.prepare(`
                UPDATE Product SET stock = stock - ? WHERE id = ?
              `).bind(item.quantity, item.productId).run();
            }

            await env.DB.prepare(`
              DELETE FROM CartItem WHERE sessionId = ?
            `).bind(metadata.sessionId).run();
          }

          return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      if (path.startsWith('admin/orders') && method === 'GET') {
        const orders = await env.DB.prepare(`
          SELECT * FROM "Order" ORDER BY createdAt DESC
        `).all();
        
        for (const order of orders.results) {
          const items = await env.DB.prepare(`
            SELECT * FROM OrderItem WHERE orderId = ?
          `).bind(order.id).all();
          order.items = items.results;
        }
        
        return new Response(JSON.stringify(orders.results), {
          headers: { 'Content-Type': 'application/json' }
        });
      }

    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return next();
}