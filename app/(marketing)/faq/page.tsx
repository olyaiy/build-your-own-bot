import { faqData } from "./faq-data";
import { BackToTopButton } from "./components/back-to-top-button";
import { SearchFAQ } from "./components/search-faq";
import { CategoryCard } from "./components/category-card";

export const metadata = {
  title: 'FAQ - Build Your Own Bot',
  description: 'Frequently Asked Questions about our service',
};

export default function FAQPage() {
  return (
    <>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background pt-16 pb-12">
        <div className="container max-w-4xl text-center mx-auto">
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Frequently Asked Questions
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our service and how to get the most out of your bot.
          </p>
        </div>
      </div>
      
      <div className="container max-w-5xl py-12 px-4 mx-auto">
        {/* Search Component */}
        <div className="mb-12">
          <SearchFAQ />
        </div>
        
        {/* Categories Grid */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {faqData.map((category, index) => (
              <CategoryCard 
                key={index} 
                title={category.title}
                count={category.items.length}
                icon={category.icon || "HelpCircle"}
                href={`#${category.title.toLowerCase().replace(/\s+/g, '-')}`}
              />
            ))}
          </div>
        </div>
        
        {/* FAQ Content */}
        <div className="space-y-20">
          {faqData.map((category, categoryIndex) => (
            <div 
              id={category.title.toLowerCase().replace(/\s+/g, '-')} 
              key={categoryIndex} 
              className="scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {/* Icon would be rendered here by the CategoryIcon component */}
                </div>
                <h2 className="text-3xl font-bold">{category.title}</h2>
              </div>
              
              <div className="grid gap-8">
                {category.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex} 
                    id={`${category.title.toLowerCase().replace(/\s+/g, '-')}-${item.question.toLowerCase().replace(/\s+/g, '-')}`}
                    className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-border scroll-mt-24"
                  >
                    <h3 className="text-xl font-semibold mb-3 flex items-start gap-3">
                      <span className="text-primary font-bold">Q.</span>
                      <span>{item.question}</span>
                    </h3>
                    <div className="pl-7 ml-3 border-l-2 border-muted">
                      <p className="text-muted-foreground leading-relaxed">{item.answer}</p>
                      {item.additionalInfo && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg text-sm">
                          <strong>Pro Tip:</strong> {item.additionalInfo}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Additional Help Section */}
        <div className="mt-20 bg-primary/5 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Our support team is here to help you with any other questions you might have about our products and services.
          </p>
          <a 
            href="/contact" 
            className="inline-flex items-center justify-center px-6 py-3 font-medium text-primary bg-background hover:bg-secondary/20 rounded-lg transition-colors"
          >
            Contact Support
          </a>
        </div>
        
        <BackToTopButton />
      </div>
    </>
  );
} 