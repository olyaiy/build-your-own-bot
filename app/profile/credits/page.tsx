import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserById } from "../actions";
import { auth } from "@/app/(auth)/auth";
import { DollarSign, CreditCard, ArrowLeft, ShieldCheck, Zap, LockIcon, BadgeCheck, ShieldAlert } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { createOrRetrieveCustomer } from "@/lib/stripe/actions";
import { Separator } from "@/components/ui/separator";

export const creditPackages = [
    { 
      id: process.env.STRIPE_PRICE_ID_5_CREDITS || '', 
      credits: 5, 
      price: "$5",
      perCredit: "$1.00", 
      popular: false 
    },
    { 
      id: process.env.STRIPE_PRICE_ID_10_CREDITS || '', 
      credits: 10, 
      price: "$10",
      perCredit: "$1.00", 
      popular: true 
    },
    { 
      id: process.env.STRIPE_PRICE_ID_20_CREDITS || '', 
      credits: 20, 
      price: "$20",
      perCredit: "$1.00", 
      popular: false 
    }
  ];

export const metadata: Metadata = {
  title: "Buy Credits",
  description: "Purchase additional credits for your account",
};

export default async function BuyCreditsPage({ 
  searchParams: searchParamsPromise 
}: { 
  searchParams: Promise<{ canceled?: string }> 
}) {
  // Await the searchParams promise
  const searchParams = await searchParamsPromise;
  // Extract the canceled parameter
  const canceled = searchParams.canceled;

  // Get the authenticated user
  const session = await auth();
  
  if (!session?.user?.id) {
    return redirect("/login");
  }
  
  const userId = session.user.id;
  const user = await getUserById(userId);
  
  if (!user) {
    return redirect("/login");
  }

  // Create or retrieve the Stripe customer
  const customer = await createOrRetrieveCustomer(userId);

  // Format credit balance as dollars with '$' symbol
  const dollarCredits = user.credit_balance 
    ? `$${parseFloat(user.credit_balance.toString()).toFixed(2)}`
    : '$0.00';

  return (
    <div className="bg-gradient-to-b from-background to-muted/30 min-h-screen pb-12">
      <div className="container max-w-6xl p-4 sm:px-6 mx-auto">
        <div className="mb-4">
          <Link href="/profile" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-2 size-4" />
            Back to Profile
          </Link>
        </div>
        
        <div className="space-y-3 mb-10 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tight">Buy Credits</h1>
          <p className="text-muted-foreground text-lg">
            Power your AI experience with credits that unlock premium features
          </p>
        </div>

        {canceled && (
          <div className="mb-8 p-4 border border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-lg flex items-center gap-3 max-w-3xl mx-auto">
            <div className="shrink-0 bg-yellow-100 dark:bg-yellow-800/50 p-2 rounded-full">
              <ShieldAlert className="size-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p>Your payment was canceled. You can try again by selecting a credit package below.</p>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          <div className="lg:col-span-4 space-y-6">
            <Card className="shadow-sm border-primary/10 bg-gradient-to-b from-primary/5 to-background overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-semibold">Current Balance</CardTitle>
                <CardDescription>
                  Available credits in your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4 py-4">
                  <div className="bg-primary/10 p-5 rounded-full ring-4 ring-primary/5">
                    <DollarSign className="size-12 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="text-5xl font-bold text-primary">{dollarCredits}</p>
                    <p className="text-sm text-muted-foreground mt-2">Available for AI interactions</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/40 px-6 py-4 text-center border-t">
                <div className="space-y-4 w-full">
                  <p className="text-sm text-muted-foreground">Credits are consumed each time you interact with our AI chatbots</p>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col items-center">
                      <p className="font-medium">Standard Chat</p>
                      <p className="text-muted-foreground">$0.10 / message</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="font-medium">Premium Chat</p>
                      <p className="text-muted-foreground">$0.25 / message</p>
                    </div>
                  </div>
                </div>
              </CardFooter>
            </Card>

            <Card className="shadow-sm border-muted bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Why Buy Credits?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-2">
                <div className="flex items-start space-x-3">
                  <div className="shrink-0 bg-primary/10 p-1.5 rounded-full">
                    <Zap className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Premium AI Chatbots</p>
                    <p className="text-xs text-muted-foreground">Access to advanced AI capabilities</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="shrink-0 bg-primary/10 p-1.5 rounded-full">
                    <BadgeCheck className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Unlimited Creativity</p>
                    <p className="text-xs text-muted-foreground">No daily limits on AI interactions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="shrink-0 bg-primary/10 p-1.5 rounded-full">
                    <ShieldCheck className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Priority Support</p>
                    <p className="text-xs text-muted-foreground">Get help faster with your questions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="lg:col-span-8 shadow-sm">
            <CardHeader className="pb-3 border-b">
              <CardTitle className="text-xl font-semibold">Select a Credit Package</CardTitle>
              <CardDescription>
                Choose the amount of credits you'd like to purchase
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form action="/api/checkout_sessions" method="POST">
                <input type="hidden" name="customerId" value={customer.stripe_customer_id || ''} />
                
                <RadioGroup defaultValue={creditPackages[1].id} name="priceId" className="space-y-5">
                  {creditPackages.map((pkg) => (
                    <div key={pkg.id} className={`relative flex items-center border rounded-lg transition-all ${pkg.popular ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' : 'hover:border-primary/30 hover:bg-primary/5'}`}>
                      {pkg.popular && (
                        <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs font-medium py-1 px-3 rounded-full flex items-center">
                          <Zap className="size-3 mr-1" /> Most Popular
                        </div>
                      )}
                      <div className="p-4 md:p-5 flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <RadioGroupItem value={pkg.id} id={pkg.id} className="mr-4" />
                          <Label htmlFor={pkg.id} className="cursor-pointer">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                              <span className="font-medium text-lg">{pkg.credits} Credits</span>
                              <span className="text-sm text-muted-foreground hidden sm:inline">|</span>
                              <span className="text-sm text-muted-foreground">{pkg.perCredit} per credit</span>
                            </div>
                          </Label>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-xl">{pkg.price}</span>
                          {pkg.popular && <span className="text-xs text-primary">Best value</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                
                <div className="mt-8 space-y-6">
                  <div className="bg-muted/30 rounded-lg p-4 border">
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 bg-primary/10 p-1.5 rounded-full">
                        <LockIcon className="size-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">100% Secure Checkout</p>
                        <p className="text-xs text-muted-foreground">Your payment information is processed securely. We do not store credit card details.</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" size="lg">
                    <CreditCard className="mr-2 size-4" />
                    Proceed to Secure Checkout
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t py-5 flex flex-col md:flex-row items-center gap-4 justify-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                <span className="text-sm">Secure payment</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-border"></div>
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-primary" />
                <span className="text-sm">Instant credit delivery</span>
              </div>
              <div className="hidden md:block h-4 w-px bg-border"></div>
              <div className="flex items-center gap-2">
                <img src="https://www.stripe.com/favicon.ico" alt="Stripe" className="size-4" />
                <span className="text-sm">Powered by Stripe</span>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
