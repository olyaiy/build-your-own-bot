"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { faqData } from "../faq-data";

// Helper function to highlight the matching text
function highlightMatch(text: string, query: string): JSX.Element {
  if (!query || query.trim() === '') {
    return <>{text}</>;
  }

  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const parts: JSX.Element[] = [];
  
  let lastIndex = 0;
  let index = textLower.indexOf(queryLower);
  
  while (index !== -1) {
    // Add the text before the match
    if (index > lastIndex) {
      parts.push(<span key={`before-${lastIndex}`}>{text.slice(lastIndex, index)}</span>);
    }
    
    // Add the highlighted match
    parts.push(
      <span 
        key={`highlight-${index}`} 
        className="bg-yellow-200 dark:bg-yellow-800 dark:text-yellow-100"
      >
        {text.slice(index, index + query.length)}
      </span>
    );
    
    lastIndex = index + query.length;
    index = textLower.indexOf(queryLower, lastIndex);
  }
  
  // Add the text after the last match
  if (lastIndex < text.length) {
    parts.push(<span key={`after-${lastIndex}`}>{text.slice(lastIndex)}</span>);
  }
  
  return <>{parts}</>;
}

export function SearchFAQ() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ question: string; answer: string; category: string; id: string }>>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    
    if (searchQuery.trim() === "") {
      setResults([]);
      setIsSearching(false);
      return;
    }
    
    setIsSearching(true);
    
    // Create a flat list of all questions with their categories
    const allQuestions = faqData.flatMap(category => 
      category.items.map(item => ({
        question: item.question,
        answer: item.answer,
        category: category.title,
        id: `${category.title.toLowerCase().replace(/\s+/g, '-')}-${item.question.toLowerCase().replace(/\s+/g, '-')}`
      }))
    );
    
    // Filter questions that match the search query
    const filteredResults = allQuestions.filter(
      item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setResults(filteredResults);
  };

  const navigateToResult = (id: string) => {
    setQuery("");
    setResults([]);
    setIsSearching(false);
    
    // Navigate to the question
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      element.classList.add("bg-primary/10");
      setTimeout(() => {
        element.classList.remove("bg-primary/10");
      }, 2000);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="size-5 text-muted-foreground" />
        </div>
        <input
          type="search"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="block w-full p-4 pl-12 text-sm bg-card border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          placeholder="Search for questions or keywords..."
        />
      </div>
      
      {isSearching && results.length > 0 && (
        <div className="absolute mt-2 w-full bg-card rounded-lg shadow-lg border border-border z-10 max-h-96 overflow-y-auto">
          <div className="p-3 border-b border-border">
            <p className="text-sm text-muted-foreground">
              Found {results.length} result{results.length !== 1 ? 's' : ''}
            </p>
          </div>
          <ul>
            {results.map((result, index) => (
              <li 
                key={index}
                className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer"
                onClick={() => navigateToResult(result.id)}
              >
                <div className="p-4">
                  <p className="text-xs font-medium text-primary mb-1">{result.category}</p>
                  <p className="font-medium mb-1">
                    {highlightMatch(result.question, query)}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {highlightMatch(result.answer, query)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {isSearching && query && results.length === 0 && (
        <div className="absolute mt-2 w-full bg-card rounded-lg shadow-lg border border-border z-10">
          <div className="p-4 text-center">
            <p className="text-muted-foreground">No results found for &quot;{query}&quot;</p>
          </div>
        </div>
      )}
    </div>
  );
} 