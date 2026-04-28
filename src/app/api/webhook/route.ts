import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await handleCheckoutSessionCompleted(session);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(session: any) {
  const { metadata, customer_details, payment_intent, amount_total } = session;
  
  const order = await prisma.order.create({
    data: {
      sessionId: metadata.sessionId,
      customerEmail: customer_details.email,
      customerName: customer_details.name,
      total: amount_total / 100,
      status: 'completed',
      stripePaymentId: payment_intent as string,
    },
  });

  const cartItems = await prisma.cartItem.findMany({
    where: { sessionId: metadata.sessionId },
    include: { product: true },
  });

  for (const item of cartItems) {
    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.product.price,
      },
    });

    await prisma.product.update({
      where: { id: item.productId },
      data: { stock: { decrement: item.quantity } },
    });
  }

  await prisma.cartItem.deleteMany({
    where: { sessionId: metadata.sessionId },
  });
}