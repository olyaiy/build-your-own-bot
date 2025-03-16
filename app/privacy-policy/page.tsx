import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for our AI assistant platform",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Privacy Policy</h1>
      
      <div className="prose prose-sm md:prose-base max-w-none dark:prose-invert">
        <p className="text-muted-foreground mb-6">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Introduction</h2>
          <p className="text-foreground">
            We respect your privacy and are committed to protecting the personal information you share with us. 
            This Privacy Policy explains how we collect, use, and safeguard your information when you use our AI assistant platform.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Information We Collect</h2>
          <p className="text-foreground">We collect the following types of information:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li className="text-foreground">
              <strong className="text-foreground">Account Information:</strong> Email address, username, and password (encrypted) to create and manage your account.
            </li>
            <li className="text-foreground">
              <strong className="text-foreground">Payment Information:</strong> When you purchase credits, we store information related to your transactions through our payment processor. 
              We maintain records of your credit balance and transaction history.
            </li>
            <li className="text-foreground">
              <strong className="text-foreground">Chat Data:</strong> The content of your conversations with our AI agents, including messages, timestamps, and related metadata.
            </li>
            <li className="text-foreground">
              <strong className="text-foreground">Document Data:</strong> Any documents you create or upload to our platform, including title, content, and document type.
            </li>
            <li className="text-foreground">
              <strong className="text-foreground">Agent Customizations:</strong> Information about how you customize and configure AI agents, including system prompts and display preferences.
            </li>
            <li className="text-foreground">
              <strong className="text-foreground">Usage Data:</strong> Information about how you use our service, including model usage, token consumption, and feature usage.
            </li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">How We Use Your Information</h2>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li className="text-foreground">To provide, maintain, and improve our services</li>
            <li className="text-foreground">To process transactions and manage your account</li>
            <li className="text-foreground">To personalize your experience and provide customized AI responses</li>
            <li className="text-foreground">To communicate with you about service updates and offers</li>
            <li className="text-foreground">To monitor usage patterns and optimize performance</li>
            <li className="text-foreground">To ensure the security of our platform</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Data Storage and Security</h2>
          <p className="text-foreground">
            We implement appropriate security measures to protect your personal information against unauthorized access, 
            alteration, disclosure, or destruction. Your data is stored in secure databases with encryption and access controls.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Third-Party Services</h2>
          <p className="text-foreground">
            We may use third-party services to process payments and provide certain features. These services have their own privacy policies, 
            and we encourage you to read those policies before using our platform.
          </p>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Your Rights</h2>
          <p className="text-foreground">You have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li className="text-foreground">Access the personal information we hold about you</li>
            <li className="text-foreground">Request correction of inaccurate information</li>
            <li className="text-foreground">Request deletion of your data (subject to certain exceptions)</li>
            <li className="text-foreground">Object to our processing of your data</li>
            <li className="text-foreground">Request a copy of your data in a portable format</li>
          </ul>
        </section>
        
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Changes to This Policy</h2>
          <p className="text-foreground">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page
            and updating the "Last updated" date.
          </p>
        </section>
        
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Contact Us</h2>
          <p className="text-foreground">
            If you have any questions about this Privacy Policy, please contact us at:
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