import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserById } from "../actions";
import { auth } from "@/app/(auth)/auth";
import { MainHeader } from "@/components/layout/main-header";
import { DollarSign, CreditCard, ArrowLeft } from "lucide-react";
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
    { id: "price_1R0II9Pikexl2RtDVzeHL5pL", credits: 5, price: "$5" },
    { id: "price_1R0IIAPikexl2RtD5yd9S8GW", credits: 10, price: "$10" },
    { id: "price_1R0IIAPikexl2RtDJOADwSqA", credits: 20, price: "$20" }
  ];

  return (
    <>
          <MainHeader />
    <div className="container max-w-6xl py-8">
      <div className="mb-8">
        <Link href="/profile" className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Profile
        </Link>
      </div>
      

      
      <h1 className="text-2xl font-bold mb-2">Buy Credits</h1>
      <p className="text-muted-foreground mb-6">Purchase additional credits to use with the AI</p>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Your Credit Balance</CardTitle>
            <CardDescription>
              Current available credits in your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <DollarSign className="h-10 w-10 text-primary" />
              </div>
              <div>
                <p className="text-3xl font-bold">{dollarCredits}</p>
                <p className="text-sm text-muted-foreground">Available credits</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase Credits</CardTitle>
            <CardDescription>
              Select a credit package to add to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/checkout_sessions" method="POST">
              <input type="hidden" name="customerId" value={customer.stripe_customer_id || ''} />
              
              <RadioGroup defaultValue={creditPackages[0].id} name="priceId" className="space-y-4">
                {creditPackages.map((pkg) => (
                  <div key={pkg.id} className="flex items-center space-x-2 border rounded-lg p-4">
                    <RadioGroupItem value={pkg.id} id={pkg.id} />
                    <Label htmlFor={pkg.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <span>{pkg.credits} Credits</span>
                        <span className="font-semibold">{pkg.price}</span>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
              
              <Button type="submit" className="w-full mt-6" size="lg">
                <CreditCard className="mr-2 h-4 w-4" />
                Checkout with Stripe
              </Button>
            </form>
          </CardContent>
          <CardFooter className="text-xs text-muted-foreground">
            Secure payment processing provided by Stripe
          </CardFooter>
        </Card>
      </div>
      
      {canceled && (
        <div className="mt-6 p-4 border border-yellow-500 bg-yellow-50 text-yellow-700 rounded-md">
          Your payment was canceled. You can try again by selecting a credit package above.
        </div>
      )}
    </div>
    </>
  );
}
