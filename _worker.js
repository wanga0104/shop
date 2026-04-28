export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, url);
    }
    
    return env.ASSETS.fetch(request);
  }
};

async function handleApiRequest(request, env, url) {
  const path = url.pathname.replace('/api/', '');
  const method = request.method;
  
  try {
    if (path === 'products' && method === 'GET') {
      return getProducts(env);
    }
    
    if (path === 'cart' && method === 'POST') {
      const data = await request.json();
      return addToCart(env, data);
    }
    
    if (path.startsWith('cart/') && method === 'GET') {
      const sessionId = path.split('/')[1];
      return getCart(env, sessionId);
    }
    
    if (path === 'checkout' && method === 'POST') {
      const data = await request.json();
      return createCheckoutSession(env, data);
    }
    
    if (path === 'webhook' && method === 'POST') {
      return handleWebhook(env, request);
    }
    
    return new Response('Not Found', { status: 404 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function getProducts(env) {
  const products = await env.DB.prepare('SELECT * FROM Product').all();
  return new Response(JSON.stringify(products.results), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function addToCart(env, data) {
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

async function getCart(env, sessionId) {
  const cartItems = await env.DB.prepare(`
    SELECT ci.*, p.name, p.price, p.imageUrl
    FROM CartItem ci
    JOIN Product p ON ci.productId = p.id
    WHERE ci.sessionId = ?
  `).bind(sessionId).all();
  
  return new Response(JSON.stringify(cartItems.results), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function createCheckoutSession(env, data) {
  const stripe = require('stripe')(env.STRIPE_SECRET_KEY);
  
  const { sessionId, items } = data;
  const lineItems = items.map(item => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.name,
        images: [item.imageUrl]
      },
      unit_amount: Math.round(item.price * 100)
    },
    quantity: item.quantity
  }));
  
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/cart`,
    metadata: {
      sessionId: sessionId
    }
  });
  
  return new Response(JSON.stringify({ url: session.url }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

async function handleWebhook(env, request) {
  const stripe = require('stripe')(env.STRIPE_SECRET_KEY);
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
      await processOrder(env, session);
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

async function processOrder(env, session) {
  const { sessionId, customer_details, payment_intent, amount_total } = session;
  
  await env.DB.prepare(`
    INSERT INTO Order (id, sessionId, customerEmail, customerName, total, status, stripePaymentId, createdAt)
    VALUES (?, ?, ?, ?, ?, 'completed', ?, datetime('now'))
  `).bind(
    crypto.randomUUID(),
    sessionId,
    customer_details.email,
    customer_details.name,
    amount_total / 100,
    payment_intent
  ).run();
}