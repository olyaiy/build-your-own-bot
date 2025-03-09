import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe/stripe';



export async function POST(request: Request) {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')
    
    // Get the price ID from the form data
    const formData = await request.formData()
    const priceId = formData.get('priceId') as string || 'price_1R0II9Pikexl2RtDVzeHL5pL' // Default to $5 if not specified
    const customerId = formData.get('customerId') as string

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Use the price ID from the form data
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/profile/credits?canceled=true`,
      customer: customerId || undefined, // Include the customer ID if provided
    });
    return NextResponse.redirect(session.url as string, 303)
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    )
  }
}