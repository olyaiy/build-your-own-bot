import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { addCreditsToUser } from '@/lib/stripe/actions';

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
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
    
    case 'checkout.session.completed':
      try {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Retrieve the session with line items
        const retrievedSession = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items']
        });
        
        // Get the price ID from line items
        const lineItems = retrievedSession.line_items?.data || [];
        const priceId = lineItems[0]?.price?.id;
        
        // Define credit packages (should match those in the credits page)
        const creditPackages = [
          { id: "price_1R0II9Pikexl2RtDVzeHL5pL", credits: 5, price: "$5"},
          { id: "price_1R0IIvPikexl2RtD3pYbOXbb", credits: 10, price: "$10"},
          { id: "price_1R0IJLPikexl2RtDK5ggIlxS", credits: 15, price: "$15"},
          { id: "price_1R0IKvPikexl2RtD7sr7rLM3", credits: 20, price: "$20"}
        ];
        
        // Find the matching credit package
        const purchasedPackage = creditPackages.find(pkg => pkg.id === priceId);
        
        if (purchasedPackage) {
          logWebhook('💵 Credits purchased', {
            customerId: session.customer,
            packageId: priceId,
            credits: purchasedPackage.credits,
            price: purchasedPackage.price
          });
          
          // Add the credits to the user's account
          if (session.customer) {
            const stripeCustomerId = session.customer as string;
            const result = await addCreditsToUser(stripeCustomerId, purchasedPackage.credits);
            
            if (result) {
              logWebhook('✅ Credits added to user account', {
                stripeCustomerId,
                credits: purchasedPackage.credits
              });
            } else {
              logWebhook('❌ Failed to add credits to user account', {
                stripeCustomerId,
                credits: purchasedPackage.credits
              });
            }
          } else {
            logWebhook('❌ No customer ID in session', { sessionId: session.id });
          }
        } else {
          logWebhook('⚠️ Unknown package purchased', { priceId });
        }
      } catch (error) {
        logWebhook('❌ Error processing checkout session', error);
      }
      break;
      
    // ... handle other event types
    default:
      logWebhook('⚠️ Unhandled event type', event.type);
  }

  // Return a 200 response to acknowledge receipt of the event
  logWebhook('👍 Webhook processed successfully');
  return NextResponse.json({ received: true });
}