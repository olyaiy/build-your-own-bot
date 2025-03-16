import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for our AI assistant platform",
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Terms of Service</h1>
      
      <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">1. Acceptance of Terms</h2>
          <p className="text-foreground">
            By accessing or using our AI assistant platform, you agree to be bound by these Terms of Service. 
            If you do not agree to these terms, please do not use our service.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">2. Description of Service</h2>
          <p className="text-foreground">
            Our platform provides access to AI assistants and tools that help you create, customize, and interact with 
            intelligent agents. The service includes chat capabilities, document management, agent customization, 
            and various AI models with different capabilities.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">3. User Accounts</h2>
          <p className="text-foreground">
            To access certain features of our platform, you must create an account. You are responsible for 
            maintaining the confidentiality of your account credentials and for all activities that occur under your account.
          </p>
          <p className="mt-2 text-foreground">
            You agree to provide accurate and complete information when creating your account and to update your 
            information to keep it accurate and current.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">4. Credits and Payment Terms</h2>
          <p className="text-foreground">
            Our platform operates on a credit system. Credits are used to access certain features and models. 
            Credits can be purchased through our payment system.
          </p>
          <p className="mt-2 text-foreground">
            All purchases are final and non-refundable, except as required by law. We reserve the right to change 
            our pricing structure and credit costs at any time.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">5. User Content</h2>
          <p className="text-foreground">
            You retain ownership of any content you submit to our platform, including chat messages, documents, 
            and agent customizations. However, you grant us a worldwide, non-exclusive, royalty-free license to use, 
            reproduce, modify, and display your content solely for the purpose of providing and improving our services.
          </p>
          <p className="mt-2 text-foreground">
            You are solely responsible for your content and the consequences of sharing it through our platform.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">6. Acceptable Use</h2>
          <p className="text-foreground">You agree not to use our service to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li className="text-foreground">Violate any applicable laws or regulations</li>
            <li className="text-foreground">Infringe upon the rights of others</li>
            <li className="text-foreground">Generate, distribute, or promote harmful, offensive, or illegal content</li>
            <li className="text-foreground">Interfere with the proper functioning of our platform</li>
            <li className="text-foreground">Attempt to gain unauthorized access to our systems or user accounts</li>
            <li className="text-foreground">Use our service for any malicious or abusive purpose</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">7. Data Usage and AI Training</h2>
          <p className="text-foreground">
            We may use anonymized and aggregated data from your interactions with our platform to improve our 
            services and train our AI models. This data will be stripped of personally identifiable information.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">8. Intellectual Property</h2>
          <p className="text-foreground">
            Our platform, including its software, design, graphics, and content created by us, is protected by 
            intellectual property laws. You may not copy, modify, distribute, or create derivative works based on 
            our platform without our explicit permission.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">9. Limitation of Liability</h2>
          <p className="text-foreground">
            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, 
            consequential, or punitive damages, including loss of profits, data, or use, arising out of or in 
            connection with your use of our platform.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">10. Termination</h2>
          <p className="text-foreground">
            We reserve the right to suspend or terminate your access to our platform at any time, with or without cause, 
            and with or without notice. Upon termination, your right to use the service will immediately cease.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">11. Changes to Terms</h2>
          <p className="text-foreground">
            We may modify these Terms of Service at any time. We will notify you of any significant changes by 
            posting a notice on our platform or sending you an email. Your continued use of the service after such 
            notification constitutes your acceptance of the modified terms.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">12. Contact Us</h2>
          <p className="text-foreground">
            If you have any questions about these Terms of Service, please contact us at:
            <br />
            <a href="mailto:emailalexan@protonmail.com" className="text-primary hover:text-primary/80 hover:underline transition-colors">
              emailalexan@protonmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
} 