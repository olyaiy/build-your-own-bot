import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_WEBHOOK_SECRET || '', {
  apiVersion: '2025-02-24.acacia', // Using a supported API version
});

// Stripe webhook secret for verifying webhook events
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

// Logger function for webhook events (easy to remove later)
const logWebhook = (message: string, data?: any) => {
  console.log(`🔔 WEBHOOK: ${message}`, data ? data : '');
};

export async function POST(request: NextRequest) {
  logWebhook('📩 Incoming webhook request received');
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') as string;
  
  logWebhook('🔑 Webhook signature', signature ? 'Present' : 'Missing');

  let event: Stripe.Event;

  try {
    logWebhook('🧩 Attempting to construct Stripe event');
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    logWebhook('✅ Event constructed successfully', { type: event.type, id: event.id });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    logWebhook('❌ Webhook Error', errorMessage);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // Handle the event
  logWebhook('🔄 Processing event', { type: event.type });
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object as Stripe.PaymentIntent;
      // Then define and call a function to handle the event payment_intent.succeeded
      logWebhook('💰 Payment intent succeeded', { 
        id: paymentIntentSucceeded.id, 
        amount: paymentIntentSucceeded.amount,
        currency: paymentIntentSucceeded.currency
      });
      break;
    // ... handle other event types
    default:
      logWebhook('⚠️ Unhandled event type', event.type);
  }

  // Return a 200 response to acknowledge receipt of the event
  logWebhook('👍 Webhook processed successfully');
  return NextResponse.json({ received: true });
}