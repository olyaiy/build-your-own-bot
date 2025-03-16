import { 
  Settings, 
  CreditCard, 
  Users, 
  Shield, 
  LifeBuoy,
  Zap
} from "lucide-react";

export interface FAQItem {
  question: string;
  answer: string;
  additionalInfo?: string;
}

export interface FAQCategory {
  title: string;
  icon?: string;
  items: FAQItem[];
}

export const faqData: FAQCategory[] = [
  {
    title: "Getting Started",
    icon: "Zap",
    items: [
      {
        question: "How do I create an account?",
        answer: "You can create an account by clicking the 'Sign Up' button on our homepage and following the registration process. You'll need to provide your email address and create a secure password.",
        additionalInfo: "Use a strong password with at least 8 characters including numbers and special characters."
      },
      {
        question: "How do I earn money from my chatbot on your platform?",
        answer: "When users interact with your chatbot, they pay for the tokens (or other API usage such as image generation). We add an 18% premium to the base cost, with 10% going directly to you as the creator and 8% going to our platform. In addition, every transaction incurs a flat fee of 30 cents to cover processing fees from Stripe. For example, if a user spends $10 worth of tokens with your bot, we charge them $11.80 plus a 30 cent transaction fee, making the total charge $12.10. Out of the 18% premium, $1 (10%) goes to you and $0.80 (8%) goes to the platform, with the extra 30 cents covering the Stripe fee."
      },
      {
        question: "How often will I get paid?",
        answer: "Creator payments are processed monthly for all earnings above $20. Payments are made by the 15th of each month for the previous month's activity."
      },
      {
        question: "Can I see how much my chatbot is earning in real-time?",
        answer: "Yes! Your models page shows real-time token usage, user interactions, and estimated earnings. You can track performance daily, weekly, or monthly."
      },
      {
        question: "Is there a minimum payout threshold?",
        answer: "Yes, we process payments for balances of $5 or more. Smaller amounts roll over to the next payment period until they reach the threshold."
      },
      {
        question: "Do I earn revenue when I use my own chatbot?",
        answer: "No. To prevent conflicts of interest and ensure fairness, creators do not earn revenue from their own usage of their bots. When you use your own bot, you still pay for the token usage plus the applicable fees, but the creator earnings portion (10%) is waived from your charge. You'll only pay for the actual AI provider costs plus the platform fee (8% and the 30 cent transaction fee)."
      },
      {
        question: "Why don't I earn from my own bot usage?",
        answer: "This policy prevents potential abuse where creators could artificially inflate their earnings by extensively using their own bots. It ensures that all creator earnings represent genuine value provided to other users."
      }
    ]
  },
  {
    title: "Account Management",
    icon: "Users",
    items: [
      {
        question: "What am I paying for when I use a chatbot on your platform?",
        answer: "We'd love to make chatbot usage free, but unfortunately, AI costs money. Your payment covers three things: (1) The actual AI token or API usage costs from our providers, (2) A fair payment to the bot creator who built and trained the bot (10% of your payment), and (3) Platform fees to support our infrastructure and services, which now include an 8% fee plus a flat 30 cent transaction fee per transaction to cover processing fees from Stripe."
      },
      {
        question: "How much do tokens cost?",
        answer: "Token prices are based on the current rates from our AI providers, plus our 18% fee that supports creators and our platform. Our pricing page always shows current rates, and you'll always see the estimated cost before starting a conversation."
      },
      {
        question: "Why is there an 18% fee on token costs?",
        answer: "The fee ensures creators are fairly compensated for their expertise and work in creating specialized bots (10%), while the remaining 8% plus the 30 cent per transaction fee support our platform infrastructure, tools, and services."
      },
      {
        question: "Do all bots cost the same to use?",
        answer: "Token costs vary depending on which AI model powers the bot. More powerful models cost more per token. Creators select which model works best for their specific use case."
      },
      {
        question: "Can I try a bot before paying?",
        answer: "Yes! New users receive a starter allocation of free tokens to try various bots. Some creators also offer free preview messages for their bots."
      },
      {
        question: "What happens if I run out of tokens mid-conversation?",
        answer: "You'll receive a notification when your tokens are running low. You can purchase more tokens instantly without leaving the conversation. If you have auto-refill set up in settings, we'll ensure you won't be interrupted and you will automatically purchase the set amount of tokens whenever your balance falls below a certain threshold."
      }
    ]
  },
  {
    title: "Billing & Payments",
    icon: "CreditCard",
    items: [
      {
        question: "How do I earn money from my chatbot on your platform?",
        answer: "When users interact with your chatbot, they pay for the tokens (or other API usage such as image generation). We add an 18% premium to the base cost, with 10% going directly to you as the creator and 8% going to our platform. In addition, every transaction incurs a flat fee of 30 cents to cover processing fees from Stripe. For example, if a user spends $10 worth of tokens with your bot, we charge them $11.80 plus a 30 cent transaction fee, making the total charge $12.10. Out of the 18% premium, $1 (10%) goes to you and $0.80 (8%) goes to the platform, with the extra 30 cents covering the Stripe fee."
      },
      {
        question: "How often will I get paid?",
        answer: "Creator payments are processed monthly for all earnings above $20. Payments are made by the 15th of each month for the previous month's activity."
      },
      {
        question: "Can I see how much my chatbot is earning in real-time?",
        answer: "Yes! Your models page shows real-time token usage, user interactions, and estimated earnings. You can track performance daily, weekly, or monthly."
      },
      {
        question: "Is there a minimum payout threshold?",
        answer: "Yes, we process payments for balances of $5 or more. Smaller amounts roll over to the next payment period until they reach the threshold."
      },
      {
        question: "Do I earn revenue when I use my own chatbot?",
        answer: "No. To prevent conflicts of interest and ensure fairness, creators do not earn revenue from their own usage of their bots. When you use your own bot, you still pay for the token usage plus the applicable fees, but the creator earnings portion (10%) is waived from your charge. You'll only pay for the actual AI provider costs plus the platform fee (8% and the 30 cent transaction fee)."
      },
      {
        question: "Why don't I earn from my own bot usage?",
        answer: "This policy prevents potential abuse where creators could artificially inflate their earnings by extensively using their own bots. It ensures that all creator earnings represent genuine value provided to other users."
      }
    ]
  },
  {
    title: "Security",
    icon: "Shield",
    items: [
      {
        question: "Can creators see the conversations I have with their chatbots?",
        answer: "No. By default, creators cannot see any messages exchanged between you and their chatbots. Your conversations remain private and are not shared with the bot creators unless you explicitly opt to share them."
      },
      {
        question: "Are my conversations with bots stored, and for how long?",
        answer: "Conversations are stored to provide continuity in your interactions. You can delete your conversation history at any time through your user settings. By default, we store your conversations indefinitely."
      },
      {
        question: "How does the platform handle sensitive information shared with bots?",
        answer: "We recommend not sharing sensitive personal information like financial details, passwords, or highly personal data with any AI system, including our bots. Our system automatically detects and redacts certain types of sensitive information in logs and analytics."
      },
      {
        question: "Are my conversations shared with third-party AI providers like OpenAI?",
        answer: "When you use a bot powered by a third-party AI provider (like OpenAI, Anthropic, or others), your messages must be processed by that provider's API to generate responses. This is a technical necessity for the service to function. These providers have their own privacy policies governing how they handle data sent to their APIs. We select providers with strong privacy commitments, and many offer data processing terms that prevent them from using your conversations to train their models. You can see which AI provider powers each bot in the bot description, and we provide links to their respective privacy policies so you can make informed decisions about which bots to use."
      },
      {
        question: "Can I choose which underlying AI model processes my conversations?",
        answer: "Yes. We clearly label which AI model powers each bot. If you have specific privacy concerns about a particular provider, you can filter bots by the underlying model they use and choose ones that align with your privacy preferences."
      }
    ]
  },
  {
    title: "Technical Support",
    icon: "Settings",
    items: [
      {
        question: "What types of chatbots can I create on your platform?",
        answer: "You can create a wide range of specialized chatbots including knowledge assistants, customer service bots, educational tutors, creative writing partners, coding assistants, and more. If it can be described through instructions and knowledge, you can likely build it on our platform."
      },
      {
        question: "Do I need coding experience to create a bot?",
        answer: "No coding required! Our platform is designed with an intuitive interface for bot creation. You can create sophisticated bots through our guided setup process by defining the bot's personality, knowledge areas, and capabilities."
      },
      {
        question: "How do users find and access my bot?",
        answer: "Your bot gets its own dedicated page on our marketplace and can be discovered through categories, search, and featured sections. You can also share a direct link to your bot anywhere online."
      },
      {
        question: "Can I embed my bot on my own website?",
        answer: "We're working on it! We're hoping to offer an embed widget that allows you to place your bot directly on your website while still tracking usage and earning revenue through our platform."
      }
    ]
  },
  {
    title: "Troubleshooting",
    icon: "LifeBuoy",
    items: [
      {
        question: "How do I create an account?",
        answer: "You can create an account by clicking the 'Sign Up' button on our homepage and following the registration process. You'll need to provide your email address and create a secure password.",
        additionalInfo: "Use a strong password with at least 8 characters including numbers and special characters."
      },
      {
        question: "What am I paying for when I use a chatbot on your platform?",
        answer: "We'd love to make chatbot usage free, but unfortunately, AI costs money. Your payment covers three things: (1) The actual AI token or API usage costs from our providers, (2) A fair payment to the bot creator who built and trained the bot (10% of your payment), and (3) Platform fees to support our infrastructure and services, which now include an 8% fee plus a flat 30 cent transaction fee per transaction to cover processing fees from Stripe."
      },
      {
        question: "How much do tokens cost?",
        answer: "Token prices are based on the current rates from our AI providers, plus our 18% fee that supports creators and our platform. Our pricing page always shows current rates, and you'll always see the estimated cost before starting a conversation."
      },
      {
        question: "Why is there an 18% fee on token costs?",
        answer: "The fee ensures creators are fairly compensated for their expertise and work in creating specialized bots (10%), while the remaining 8% plus the 30 cent per transaction fee support our platform infrastructure, tools, and services."
      },
      {
        question: "Do all bots cost the same to use?",
        answer: "Token costs vary depending on which AI model powers the bot. More powerful models cost more per token. Creators select which model works best for their specific use case."
      },
      {
        question: "Can I try a bot before paying?",
        answer: "Yes! New users receive a starter allocation of free tokens to try various bots. Some creators also offer free preview messages for their bots."
      },
      {
        question: "What happens if I run out of tokens mid-conversation?",
        answer: "You'll receive a notification when your tokens are running low. You can purchase more tokens instantly without leaving the conversation. If you have auto-refill set up in settings, we'll ensure you won't be interrupted and you will automatically purchase the set amount of tokens whenever your balance falls below a certain threshold."
      }
    ]
  }
]; 