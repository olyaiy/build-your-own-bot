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

  // Format credit balance as dollars with '$' symbol
  const dollarCredits = user.credit_balance 
    ? `$${parseFloat(user.credit_balance.toString()).toFixed(2)}`
    : '$0.00';

  return (
    <>
      <MainHeader />
      <div className="container max-w-3xl mx-auto p-4">
        <Link 
          href="/profile" 
          className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to Profile
        </Link>
        
        {canceled === 'true' && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Payment Canceled
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>
                    Your checkout session was canceled. You have not been charged.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Current Balance Card */}
        <Card className="shadow-sm mb-8 border-muted/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center p-2">
              <div className="w-12 h-12 flex items-center justify-center bg-primary/20 rounded-full mr-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Available Credits (USD)</p>
                <p className="text-3xl font-bold">{dollarCredits}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Credits Card */}
        <Card className="shadow-sm border-muted/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-bold">Purchase Credits</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Choose a credit package to add to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action="/api/checkout_sessions" method="POST" className="space-y-8">
              <RadioGroup defaultValue="price_1R0II9Pikexl2RtDVzeHL5pL" name="priceId" className="space-y-6">
                {/* $5 Credit Package */}
                <Label 
                  htmlFor="price-5"
                  className="cursor-pointer block"
                >
                  <div className="flex items-start space-x-3 p-5 border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group has-[:checked]:border-primary has-[:checked]:bg-primary/10 relative">
                    <RadioGroupItem 
                      value="price_1R0II9Pikexl2RtDVzeHL5pL" 
                      id="price-5" 
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between w-full text-base font-medium">
                        <div className="flex items-center">
                          <div className="w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full mr-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <span>Basic Credit Package</span>
                        </div>
                        <span className="font-bold">$5.00</span>
                      </div>
                      <div className="mt-2 ml-10">
                        <p className="text-sm text-muted-foreground">
                          Purchase $5 worth of credits for your account. Perfect for trying out our premium features.
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary/80 hidden group-hover:block group-has-[:checked]:block"></div>
                  </div>
                </Label>

                {/* $10 Credit Package */}
                <Label 
                  htmlFor="price-10"
                  className="cursor-pointer block"
                >
                  <div className="flex items-start space-x-3 p-5 border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group has-[:checked]:border-primary has-[:checked]:bg-primary/10 relative">
                    <RadioGroupItem 
                      value="price_1R0IIvPikexl2RtD3pYbOXbb" 
                      id="price-10" 
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between w-full text-base font-medium">
                        <div className="flex items-center">
                          <div className="w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full mr-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <span>Standard Credit Package</span>
                        </div>
                        <span className="font-bold">$10.00</span>
                      </div>
                      <div className="mt-2 ml-10">
                        <p className="text-sm text-muted-foreground">
                          Purchase $10 worth of credits for your account. Best value for regular users.
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary/80 hidden group-hover:block group-has-[:checked]:block"></div>
                  </div>
                </Label>
                
                {/* $15 Credit Package */}
                <Label 
                  htmlFor="price-15"
                  className="cursor-pointer block"
                >
                  <div className="flex items-start space-x-3 p-5 border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group has-[:checked]:border-primary has-[:checked]:bg-primary/10 relative">
                    <RadioGroupItem 
                      value="price_1R0IJLPikexl2RtDK5ggIlxS" 
                      id="price-15" 
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between w-full text-base font-medium">
                        <div className="flex items-center">
                          <div className="w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full mr-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <span>Plus Credit Package</span>
                        </div>
                        <span className="font-bold">$15.00</span>
                      </div>
                      <div className="mt-2 ml-10">
                        <p className="text-sm text-muted-foreground">
                          Purchase $15 worth of credits for your account. Great for active users.
                        </p>
                        <div className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-md">
                          Popular Choice
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary/80 hidden group-hover:block group-has-[:checked]:block"></div>
                  </div>
                </Label>
                
                {/* $20 Credit Package */}
                <Label 
                  htmlFor="price-20"
                  className="cursor-pointer block"
                >
                  <div className="flex items-start space-x-3 p-5 border rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 group has-[:checked]:border-primary has-[:checked]:bg-primary/10 relative">
                    <RadioGroupItem 
                      value="price_1R0IKvPikexl2RtD7sr7rLM3" 
                      id="price-20" 
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between w-full text-base font-medium">
                        <div className="flex items-center">
                          <div className="w-8 h-8 flex items-center justify-center bg-primary/20 rounded-full mr-2">
                            <CreditCard className="h-4 w-4 text-primary" />
                          </div>
                          <span>Premium Credit Package</span>
                        </div>
                        <span className="font-bold">$20.00</span>
                      </div>
                      <div className="mt-2 ml-10">
                        <p className="text-sm text-muted-foreground">
                          Purchase $20 worth of credits for your account. Best value for power users.
                        </p>
                        <div className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-md">
                          Best Value
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-primary/80 hidden group-hover:block group-has-[:checked]:block"></div>
                  </div>
                </Label>
              </RadioGroup>

              <div className="bg-muted/30 p-5 rounded-xl border border-muted/40">
                <h3 className="font-medium mb-3 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-primary" />
                  What you'll get:
                </h3>
                <ul className="text-sm space-y-3">
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full mr-2 text-xs">✓</span> 
                    Credits added to your account balance immediately
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full mr-2 text-xs">✓</span> 
                    Use for premium agent interactions
                  </li>
                  <li className="flex items-start">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full mr-2 text-xs">✓</span> 
                    Access to all premium features
                  </li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
              >
                <CreditCard className="mr-2 h-5 w-5" /> 
                Proceed to Checkout
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
