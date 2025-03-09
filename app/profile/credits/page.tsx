import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserById } from "../actions";
import { auth } from "@/app/(auth)/auth";
import { MainHeader } from "@/components/layout/main-header";
import { DollarSign, CreditCard, ArrowLeft, ShieldCheck, Zap } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { createOrRetrieveCustomer } from "@/lib/stripe/actions";

export const metadata: Metadata = {
  title: "Buy Credits",
  description: "Purchase additional credits for your account",
};

export default async function BuyCreditsPage({ searchParams }: { searchParams: { canceled?: string } }) {
  // Check for canceled payment
  const { canceled } = await searchParams;

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

  // Credit package options
  const creditPackages = [
    { id: "price_1R0II9Pikexl2RtDVzeHL5pL", credits: 5, price: "$5", popular: false },
    { id: "price_1R0IIvPikexl2RtD3pYbOXbb", credits: 10, price: "$10", popular: true },
    { id: "price_1R0IJLPikexl2RtDK5ggIlxS", credits: 15, price: "$15", popular: false },
    { id: "price_1R0IKvPikexl2RtD7sr7rLM3", credits: 20, price: "$20", popular: false }
  ];

  return (
    <>
      <MainHeader />
      <div className="container max-w-6xl py-4 px-4 sm:px-6">
        <div className="mb-2">
          <Link href="/profile" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Profile
          </Link>
        </div>
        
        <div className="space-y-3 mb-10">
          <h1 className="text-3xl font-bold tracking-tight">Buy Credits</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Purchase additional credits to power your AI experience
          </p>
        </div>

        {canceled && (
          <div className="mb-8 p-4 border border-yellow-500/20 bg-yellow-50/50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-lg flex items-center gap-3">
            <div className="shrink-0 bg-yellow-100 dark:bg-yellow-800/50 p-2 rounded-full">
              <CreditCard className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <p>Your payment was canceled. You can try again by selecting a credit package below.</p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-1 shadow-sm border-primary/10 bg-gradient-to-b from-primary/5 to-background">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Your Balance</CardTitle>
              <CardDescription>
                Current available credits
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-4 py-4">
                <div className="bg-primary/10 p-4 rounded-full ring-4 ring-primary/5">
                  <DollarSign className="h-12 w-12 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-4xl font-bold text-primary">{dollarCredits}</p>
                  <p className="text-sm text-muted-foreground mt-1">Available in your account</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/40 px-6 py-4 text-center text-sm text-muted-foreground border-t">
              Credits are used each time you interact with our AI
            </CardFooter>
          </Card>

          <Card className="md:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Purchase Credits</CardTitle>
              <CardDescription>
                Select a credit package to add to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action="/api/checkout_sessions" method="POST">
                <input type="hidden" name="customerId" value={customer.stripe_customer_id || ''} />
                
                <RadioGroup defaultValue={creditPackages[0].id} name="priceId" className="space-y-4">
                  {creditPackages.map((pkg) => (
                    <div key={pkg.id} className={`relative flex items-center space-x-2 border rounded-lg p-5 transition-all hover:border-primary/50 hover:bg-primary/5 ${pkg.popular ? 'border-primary/30 bg-primary/5 ring-1 ring-primary/20' : ''}`}>
                      {pkg.popular && (
                        <div className="absolute -top-3 right-4 bg-primary text-primary-foreground text-xs font-medium py-1 px-3 rounded-full flex items-center">
                          <Zap className="h-3 w-3 mr-1" /> Most Popular
                        </div>
                      )}
                      <RadioGroupItem value={pkg.id} id={pkg.id} />
                      <Label htmlFor={pkg.id} className="flex-1 cursor-pointer">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{pkg.credits} Credits</span>
                          </div>
                          <span className="font-bold text-lg">{pkg.price}</span>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                <Button type="submit" className="w-full mt-8" size="lg">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Checkout with Stripe
                </Button>
              </form>
            </CardContent>
            <CardFooter className="bg-muted/40 border-t flex items-center justify-center gap-2 py-4">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Secure payment processing by Stripe</span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </>
  );
}
