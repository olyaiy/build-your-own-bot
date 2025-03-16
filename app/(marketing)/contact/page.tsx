import { Twitter, Mail, MessageSquare, ArrowRight, ChevronDown } from "lucide-react";
import ContactForm from "@/components/contact/contact-form";
import ContactOptions from "@/components/contact/contact-options";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: 'Contact - Build Your Own Bot',
  description: 'Get in touch with our support team',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with improved visual design */}
      <section className="relative pt-24 pb-16 overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl"></div>
          <div className="absolute top-60 -left-20 w-60 h-60 rounded-full bg-primary/10 blur-3xl"></div>
        </div>
        
        <div className="container relative z-10 max-w-4xl text-center mx-auto">
          <div className="inline-block px-3 py-1 mb-6 text-sm font-medium rounded-full bg-primary/10 text-primary">
            We'd love to hear from you
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
            Need to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
               Contact {" "}
            </span>
            me?
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            I'd love to chat anytime.
          </p>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-8">
            Feel free to checkout our <a href="/faq" className="text-primary hover:underline">FAQ</a> or contact me using one of the three ways below
          </p>
        </div>
      </section>
      
      <div className="bg-none">
      <ContactOptions />
      </div>
      
      {/* Contact Form Section with improved visual design */}
      <section id="contact-form" className="py-16 bg-muted/30 scroll-mt-16">
        <div className="container max-w-6xl px-4 mx-auto">
          <div className="relative">
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl -z-10"></div>
            
            {/* Content with two columns on desktop */}
            <div className="bg-card rounded-2xl shadow-lg border border-border overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-5">
                {/* Form Column */}
                <div className="p-8 md:p-12 col-span-3">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <MessageSquare size={20} />
                    </div>
                    <h2 className="text-2xl font-semibold">Send us a message</h2>
                  </div>
                  
                  <ContactForm />
                </div>
                
                {/* Info Column */}
                <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 md:p-12 col-span-2 flex flex-col">
                  <div className="mb-8">
                    <h3 className="text-lg font-medium mb-2">Contact Information</h3>
                    <p className="text-muted-foreground mb-6">
                      We're here to help and answer any questions you might have. We look forward to hearing from you.
                    </p>
                  </div>
                  
                  <div className="space-y-6 mb-auto">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Mail size={18} />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">Email</h4>
                        <a href="mailto:emailalexan@protonmail.com" className="text-muted-foreground hover:text-primary transition-colors">
                        emailalexan@protonmail.com
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Twitter size={18} />
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">X / Twitter</h4>
                        <a href="https://x.com/alexfromvan" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                          @alexfromvan
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-border/50">
                    <h4 className="font-medium mb-3">Common questions?</h4>
                    <Button variant="outline" className="w-full justify-between group" asChild>
                      <a href="/faq">
                        Visit our FAQ Page
                        <ArrowRight size={14} className="ml-2 transition-transform group-hover:translate-x-1" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 