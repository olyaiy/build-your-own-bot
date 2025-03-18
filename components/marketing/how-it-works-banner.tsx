"use client";

import Link from "next/link";
import HowItWorksCards from "./how-it-works-cards";
import { useEffect, useState } from "react";

export function HowItWorksBanner() {
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if viewport is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return (
    <section className="w-full mb-16 rounded-xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="relative p-4 sm:px-8 md:px-12 md:py-20">
        {/* Enhanced decorative elements */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500" />
        <div className="absolute -bottom-12 -right-12 size-48 rounded-full bg-blue-500/15 blur-3xl" />
        <div className="absolute -top-12 -left-12 size-48 rounded-full bg-purple-500/15 blur-3xl" />
        <div className="absolute top-1/2 left-1/4 size-24 rounded-full bg-pink-500/10 blur-2xl" />
        <div className="absolute bottom-1/4 right-1/3 size-16 rounded-full bg-blue-500/10 blur-xl" />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="max-w-screen-xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-2/5 space-y-6">
             
              
              <h2 className="mt-4 text-3xl md:text-4xl lg:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">
                Turn Your AI Expertise Into Revenue
              </h2>
              
              <p className="text-lg text-slate-300 leading-relaxed">
                Create specialized AI agents that solve real problems, share them on our marketplace, 
                and earn passive income when others put your creations to work. No coding required.
              </p>
              
              {!isMobile && (
                <div className="flex flex-col gap-4 pt-2">
                  <Link 
                    href="/#agent-list" 
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium transition-all hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105"
                  >
                    Explore Agents
                    <svg className="ml-2 size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  
                  <Link 
                    href="/about" 
                    className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg font-medium transition-all"
                  >
                    Learn More
                  </Link>
                </div>
              )}
            </div>
            
            <div className="lg:w-3/5 w-full">
              <div className={`${isMobile ? 'p-0 bg-transparent' : 'p-1.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20'} rounded-2xl backdrop-blur-sm`}>
                <div className={`${isMobile ? 'bg-transparent p-0' : 'bg-slate-900/80 p-2 sm:p-4'} rounded-xl`}>
                  <HowItWorksCards />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 