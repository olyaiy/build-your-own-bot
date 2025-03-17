import { redirect } from 'next/navigation';
import Link from 'next/link';
import { stripe } from '@/lib/stripe/stripe';


interface SuccessPageProps {
  searchParams: Promise<{ session_id?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedParams = await searchParams;
  const { session_id } = resolvedParams;

  if (!session_id) {
    throw new Error('Please provide a valid session_id (`cs_test_...`)');
  }

  const checkoutSession = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent']
  });

  const {
    status,
    customer_details
  } = checkoutSession;

  const customerEmail = customer_details?.email;
  
  // Extract the price ID from the line items
  const lineItems = checkoutSession.line_items?.data || [];
  const priceId = lineItems[0]?.price?.id;
  
  // Define credit packages using environment variables (matching credits page)
  const creditPackages = [
    { id: process.env.STRIPE_PRICE_ID_5_CREDITS || '', credits: 5, price: "$5" },
    { id: process.env.STRIPE_PRICE_ID_10_CREDITS || '', credits: 10, price: "$10" },
    { id: process.env.STRIPE_PRICE_ID_20_CREDITS || '', credits: 20, price: "$20" }
  ];
  
  // Find the matching credit package
  const purchasedPackage = creditPackages.find(pkg => pkg.id === priceId);

  if (status === 'open') {
    return redirect('/');
  }

  if (status === 'complete') {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[70vh]">
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8 max-w-md w-full text-center">
          <div className="mb-4 flex justify-center">
            <div className="size-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="size-8 text-green-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7" 
                />
              </svg>
            </div>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h1>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>
          
          {customerEmail && (
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We appreciate your business! A confirmation email will be sent to{' '}
              <span className="font-medium">{customerEmail}</span>.
            </p>
          )}
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            If you have any questions, please email{' '}
            <a 
              href="mailto:support@yourdomain.com" 
              className="text-blue-600 hover:underline"
            >
              support@yourdomain.com
            </a>.
          </p>
          
          <Link 
            href="/"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 w-full mb-3"
          >
            Return to Home
          </Link>
          
          <Link 
            href="/profile"
            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary/90 w-full"
          >
            View Profile
          </Link>
        </div>
      </div>
    );
  }
  
  // Handle unexpected status
  return redirect('/');
} 