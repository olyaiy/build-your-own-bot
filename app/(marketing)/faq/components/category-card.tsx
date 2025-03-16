"use client";

import { 
  HelpCircle, 
  Settings, 
  CreditCard, 
  Users, 
  Shield, 
  LifeBuoy,
  Zap
} from "lucide-react";
import { useRef, useEffect } from "react";

interface CategoryCardProps {
  title: string;
  count: number;
  icon: string;
  href: string;
}

export function CategoryCard({ title, count, icon, href }: CategoryCardProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  
  const getIcon = () => {
    switch (icon) {
      case "Settings": return <Settings className="h-6 w-6" />;
      case "CreditCard": return <CreditCard className="h-6 w-6" />;
      case "Users": return <Users className="h-6 w-6" />;
      case "Shield": return <Shield className="h-6 w-6" />;
      case "LifeBuoy": return <LifeBuoy className="h-6 w-6" />;
      case "Zap": return <Zap className="h-6 w-6" />;
      default: return <HelpCircle className="h-6 w-6" />;
    }
  };
  
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetId = href.substring(1);
    const targetElement = document.getElementById(targetId);
    
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 100,
        behavior: "smooth"
      });
    }
  };
  
  return (
    <a 
      ref={ref}
      href={href}
      onClick={handleClick}
      className="flex flex-col p-6 bg-card hover:bg-accent/50 rounded-xl border border-border shadow-sm hover:shadow-md transition-all group"
    >
      <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
        {getIcon()}
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-muted-foreground text-sm">{count} question{count !== 1 ? 's' : ''}</p>
      <div className="mt-auto pt-4 flex items-center text-primary text-sm font-medium">
        <span>View questions</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="ml-1 group-hover:translate-x-1 transition-transform"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>
    </a>
  );
} 