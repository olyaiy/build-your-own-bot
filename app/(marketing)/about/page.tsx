import Image from "next/image";
import Link from "next/link";
import { 
  Zap, 
  Users, 
  CreditCard, 
  TrendingUp, 
  Check, 
  Shield,
  Sparkles,
  BrainCircuit,
  BarChart4,
  HandCoins
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: 'About Agent Vendor - AI Agent Marketplace',
  description: 'Learn about Agent Vendor - the marketplace where AI creators build specialized agents and earn passive income while users discover AI solutions to their unique problems.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 size-80 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute top-60 -left-20 size-60 rounded-full bg-primary/10 blur-3xl"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-blue-500/10 blur-2xl"></div>
          <div className="absolute bottom-1/4 right-1/3 w-16 h-16 rounded-full bg-purple-500/10 blur-xl"></div>
        </div>
        
        <div className="container relative z-10 max-w-4xl text-center mx-auto">
          <div className="inline-block px-3 py-1 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary">
            The Agent Vendor Story
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Connecting{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              AI Creators{" "}
            </span>
            with Users Who Need Solutions
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Agent Vendor is where AI expertise becomes income for creators and where users discover 
            specialized AI solutions to their unique challenges — all without writing a single line of code.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105" asChild>
              <Link href="/sign-up">
                Start Creating
                <Zap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/15 border border-white/10" asChild>
              <Link href="/#agent-list">
                Explore Agents
                <BrainCircuit className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Statement Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg text-muted-foreground mb-6">
                Agent Vendor exists to democratize AI by connecting those who understand specific domains with those who need intelligent solutions.
              </p>
              <p className="text-lg text-muted-foreground mb-6">
                We believe that AI should be accessible, useful, and rewarding — both for those who create it and those who use it.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mt-1 mr-3 flex-shrink-0 h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <p className="text-muted-foreground">Empowering domain experts to monetize their knowledge</p>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 mr-3 flex-shrink-0 h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <p className="text-muted-foreground">Connecting users with specialized AI solutions</p>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 mr-3 flex-shrink-0 h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                  <p className="text-muted-foreground">Creating a sustainable ecosystem that rewards quality</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-10 -right-10 size-40 rounded-full bg-primary/5 blur-2xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-primary/5 blur-2xl -z-10"></div>
              <div className="bg-card rounded-xl border border-border p-6 shadow-lg">
                <div className="text-center mb-6">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">The Future of AI</h3>
                  <p className="text-sm text-muted-foreground">
                    We envision a world where specialized AI agents handle specific tasks with expertise, freeing humans to focus on what matters most.
                  </p>
                </div>
                <div className="h-px w-full bg-border my-6"></div>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <BrainCircuit className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Specialized Knowledge</p>
                      <p className="text-sm text-muted-foreground">Domain-specific AI agents</p>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <HandCoins className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Democratized Value</p>
                      <p className="text-sm text-muted-foreground">Fair compensation for creators</p>
                    </div>
                  </li>
                  <li className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Responsible AI</p>
                      <p className="text-sm text-muted-foreground">Privacy and security focused</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Creators Section */}
      <section className="py-16 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -bottom-40 -left-40 size-80 rounded-full bg-blue-500/5 blur-3xl"></div>
          <div className="absolute top-20 -right-20 size-60 rounded-full bg-purple-500/10 blur-3xl"></div>
        </div>
        
        <div className="container max-w-6xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">For Creators</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Turn your AI expertise into a passive income stream by creating specialized agents that solve real problems.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:translate-y-[-5px]">
              <div className="mb-4 p-3 inline-flex rounded-full bg-blue-500/10">
                <Zap size={24} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Design Your AI Agent</h3>
              <p className="text-muted-foreground text-sm">
                Create powerful AI agents that solve specific problems. Define personality, knowledge, and capabilities without writing code.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:translate-y-[-5px]">
              <div className="mb-4 p-3 inline-flex rounded-full bg-purple-500/10">
                <Users size={24} className="text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Join the Marketplace</h3>
              <p className="text-muted-foreground text-sm">
                List your agent alongside the best AI solutions. Reach thousands of users searching for specialized help.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:translate-y-[-5px]">
              <div className="mb-4 p-3 inline-flex rounded-full bg-green-500/10">
                <CreditCard size={24} className="text-green-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Generate Income</h3>
              <p className="text-muted-foreground text-sm">
                Earn 10% of token usage whenever someone interacts with your agent. Scale your earnings as your agent gains popularity.
              </p>
            </div>
            
            <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:translate-y-[-5px]">
              <div className="mb-4 p-3 inline-flex rounded-full bg-amber-500/10">
                <TrendingUp size={24} className="text-amber-500" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Scale Your Business</h3>
              <p className="text-muted-foreground text-sm">
                Gather user feedback, refine your agent, and build a portfolio of specialized AI solutions that generate revenue 24/7.
              </p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600" asChild>
              <Link href="/sign-up">
                Start Creating Today
                <Zap className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* For Users Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">For Users</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover highly specialized AI agents built by experts to solve your specific problems.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Access Specialized Expertise</h3>
                <p className="text-muted-foreground mb-6">
                  Find AI agents tailored to specific domains and tasks, created by experts who understand the nuances of your challenges.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <div className="mt-1 mr-3 flex-shrink-0 h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground">Domain-specific knowledge built in</p>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 mr-3 flex-shrink-0 h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground">Curated marketplace of quality agents</p>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 mr-3 flex-shrink-0 h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground">Ratings and reviews from real users</p>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Transparent & Fair Pricing</h3>
                <p className="text-muted-foreground mb-6">
                  Our pay-as-you-go token system ensures you only pay for what you use, with clear pricing before you start.
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start">
                    <div className="mt-1 mr-3 flex-shrink-0 h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground">No subscriptions or hidden fees</p>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 mr-3 flex-shrink-0 h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground">Free tokens for new users to try the platform</p>
                  </li>
                  <li className="flex items-start">
                    <div className="mt-1 mr-3 flex-shrink-0 h-5 w-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <p className="text-sm text-muted-foreground">Only pay for successful interactions</p>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600" asChild>
              <Link href="/#agent-list">
                Find Your AI Agent
                <BrainCircuit className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How the Ecosystem Works */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Our Ecosystem Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A transparent model that fairly rewards creators while keeping costs reasonable for users.
            </p>
          </div>
          
          <div className="relative bg-card border border-border rounded-xl p-8 overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 size-40 rounded-full bg-primary/5 blur-2xl -z-0"></div>
            <div className="absolute -bottom-10 -left-10 size-40 rounded-full bg-primary/5 blur-2xl -z-0"></div>
            
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-500/10 mb-4">
                  <Users className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Users Access AI</h3>
                <p className="text-sm text-muted-foreground">
                  Users purchase tokens and engage with specialized AI agents, paying only for what they use.
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/10 mb-4">
                  <BarChart4 className="h-7 w-7 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Token Economics</h3>
                <p className="text-sm text-muted-foreground">
                  Token costs include the AI provider fee, plus an 18% premium (10% to creators, 8% to platform) and a $0.30 transaction fee.
                </p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 mb-4">
                  <HandCoins className="h-7 w-7 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Creator Rewards</h3>
                <p className="text-sm text-muted-foreground">
                  Creators automatically receive 10% of all token usage from their agents, paid monthly with transparent analytics.
                </p>
              </div>
            </div>
            
            <div className="mt-10 pt-10 border-t border-border">
              <div className="bg-muted/50 rounded-lg p-5">
                <h4 className="font-semibold mb-3">Example Transaction</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  If a user spends $10 worth of tokens with an agent:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-white/5 rounded-lg text-center">
                    <p className="text-muted-foreground text-xs mb-1">Base Cost</p>
                    <p className="font-semibold">$10.00</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg text-center">
                    <p className="text-muted-foreground text-xs mb-1">Premium (18%)</p>
                    <p className="font-semibold">$1.80</p>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg text-center">
                    <p className="text-muted-foreground text-xs mb-1">Transaction Fee</p>
                    <p className="font-semibold">$0.30</p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-3 bg-primary/5 rounded-lg text-center">
                    <p className="text-primary text-xs mb-1">User Pays</p>
                    <p className="font-semibold">$12.10</p>
                  </div>
                  <div className="p-3 bg-green-500/5 rounded-lg text-center">
                    <p className="text-green-500 text-xs mb-1">Creator Receives</p>
                    <p className="font-semibold">$1.00</p>
                  </div>
                  <div className="p-3 bg-blue-500/5 rounded-lg text-center">
                    <p className="text-blue-500 text-xs mb-1">Platform Fee</p>
                    <p className="font-semibold">$1.10</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white relative overflow-hidden">
        {/* Top border gradient */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500" />
        
        {/* Decorative elements */}
        <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 w-24 h-24 rounded-full bg-pink-500/10 blur-2xl" />
        <div className="absolute bottom-1/4 right-1/3 w-16 h-16 rounded-full bg-blue-500/10 blur-xl" />
        
        <div className="container max-w-4xl mx-auto px-4 relative z-10">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
              Ready to Join the AI Agent Economy?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Whether you're creating AI agents or using them to solve problems, Agent Vendor connects experts with those who need their knowledge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105" asChild>
                <Link href="/sign-up">
                  Get Started Today
                  <Zap className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 hover:bg-white/15 border border-white/10" asChild>
                <Link href="/faq">
                  Explore FAQ
                  <BrainCircuit className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
