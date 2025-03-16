import { Twitter, Mail, MessageSquare } from "lucide-react";
import ContactForm from "@/components/contact/contact-form";

export const metadata = {
  title: 'Contact - Build Your Own Bot',
  description: 'Get in touch with our support team',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/80">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/5 to-background pt-20 pb-12">
        <div className="container max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions or want to learn more about Build Your Own Bot? Choose how you'd like to reach out.
          </p>
        </div>
      </div>
      
      <div className="container max-w-5xl py-12 px-4">
        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Option 1: X/Twitter */}
          <a 
            href="https://x.com/alexfromvan" 
            target="_blank" 
            rel="noopener noreferrer"
            className="block bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all hover:border-primary/20 group hover:bg-card/90 cursor-pointer"
          >
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-colors">
                <img 
                  src="https://unavatar.io/x/alexfromvan" 
                  alt="Alex on X" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Message on X</h3>
            <p className="text-muted-foreground text-center mb-4">
              Reach out directly to our founder Alex on X for quick responses.
            </p>
            <div className="flex justify-center">
              <span 
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-black text-white group-hover:bg-black/90 transition-colors"
              >
                <Twitter size={18} />
                <span>Message @alexfromvan</span>
              </span>
            </div>
          </a>
          
          {/* Option 2: Contact Form */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all hover:border-primary/20 group">
            <div className="mb-4 flex justify-center text-primary/80 group-hover:text-primary transition-colors">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <MessageSquare size={32} />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Leave a Message</h3>
            <p className="text-muted-foreground text-center mb-4">
              Fill out our contact form and we'll get back to you as soon as possible.
            </p>
            <div className="flex justify-center">
              <a 
                href="#contact-form" 
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <span>Go to Form</span>
              </a>
            </div>
          </div>
          
          {/* Option 3: Email */}
          <div className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all hover:border-primary/20 group">
            <div className="mb-4 flex justify-center text-primary/80 group-hover:text-primary transition-colors">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail size={32} />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Send an Email</h3>
            <p className="text-muted-foreground text-center mb-4">
              Email our founder directly for business inquiries or partnerships.
            </p>
            <div className="flex justify-center">
              <a 
                href="mailto:alex@buildyourownbot.com" 
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Mail size={18} />
                <span>alex@buildyourownbot.com</span>
              </a>
            </div>
          </div>
        </div>
        
        {/* Contact Form Section */}
        <div id="contact-form" className="scroll-mt-20">
          <div className="max-w-3xl mx-auto bg-card rounded-xl p-8 shadow-sm border border-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MessageSquare size={20} />
              </div>
              <h2 className="text-2xl font-semibold">Send us a message</h2>
            </div>
            
            <ContactForm />
          </div>
        </div>
        
        {/* FAQ Redirect */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-muted/30 rounded-xl p-6">
            <p className="text-muted-foreground mb-3">
              Looking for quick answers to common questions?
            </p>
            <a 
              href="/faq" 
              className="inline-flex items-center justify-center px-6 py-2.5 font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors"
            >
              Visit our FAQ Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 