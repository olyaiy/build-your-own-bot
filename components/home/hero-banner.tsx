/**
 * HeroBanner Component
 * 
 * A visually appealing hero section for the AI Agent Marketplace homepage.
 * Features a gradient background, value propositions, and call-to-action buttons.
 * Includes a decorative UI mockup on desktop views.
 */
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { getRandomChat } from "./mock-chat-content";
import { useEffect, useState } from "react";

// Import the AgentChat interface from the mock-chat-content file
import type { AgentChat } from "./mock-chat-content";

export function HeroBanner() {
  // Properly type the state to accept null or AgentChat
  const [currentChat, setCurrentChat] = useState<AgentChat | null>(null);

  // Effect to set random chat only after component is mounted (client-side only)
  useEffect(() => {
    setCurrentChat(getRandomChat());
  }, []);

  // Smooth scroll handler for the "Browse Agents" button
  const scrollToAgents = () => {
    const agentList = document.getElementById("agent-list");
    agentList?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    // Main container with gradient background
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl mb-8 overflow-hidden">
      <div className="container px-4 py-6 mx-auto">
        {/* Responsive grid layout: 1 column on mobile, 12 columns on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left content section - spans 7 columns on desktop */}
          <div className="md:col-span-7 space-y-4">
            {/* Main heading with accent text */}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              AI Agent Marketplace
              <span className="text-blue-400 block mt-0.5">Powered by Experts</span>
            </h1>
            
            {/* Value propositions section */}
            <div className="space-y-3">
              {/* Creator value proposition */}
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 p-1.5 rounded-full">
                  <div className="w-5 h-5 flex items-center justify-center text-blue-400 font-semibold text-sm">1</div>
                </div>
                <div>
                  <h3 className="font-medium text-blue-300">For Creators</h3>
                  <p className="text-slate-300 text-sm">Build specialized AI agents and monetize your expertise</p>
                </div>
              </div>
              
              {/* User value proposition */}
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 p-1.5 rounded-full">
                  <div className="w-5 h-5 flex items-center justify-center text-purple-400 font-semibold text-sm">2</div>
                </div>
                <div>
                  <h3 className="font-medium text-purple-300">For Users</h3>
                  <p className="text-slate-300 text-sm">Discover and access tailored AI solutions for your specific needs</p>
                </div>
              </div>
              
              {/* Community value proposition */}
              <div className="flex items-start gap-3">
                <div className="bg-green-500/20 p-1.5 rounded-full">
                  <div className="w-5 h-5 flex items-center justify-center text-green-400 font-semibold text-sm">3</div>
                </div>
                <div>
                  <h3 className="font-medium text-green-300">For Everyone</h3>
                  <p className="text-slate-300 text-sm">Fair revenue sharing in a sustainable AI ecosystem</p>
                </div>
              </div>
            </div>
            
            {/* Call-to-action buttons */}
            <div className="flex gap-3 pt-1">
              {/* Primary CTA - Create Agent */}
              <Link href="/agents/create">
                <Button className="group" size="sm">
                  Create Your Agent
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              {/* Secondary CTA - Browse Agents with smooth scroll */}
              <Button onClick={scrollToAgents} className="group" size="sm" variant="outline">
                Browse Agents
                <Search className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          {/* Right section - Chat UI mockup (hidden on mobile) */}
          <div className="md:col-span-5 hidden md:block">
            <div className="relative">
              {/* Glowing gradient border effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-75"></div>
              {/* Mock chat container */}
              <div className="relative bg-slate-950 p-6 rounded-lg">
                <div className="space-y-4">
                  {/* Chat header */}
                  <div className="flex flex-col gap-1 pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div className="text-sm text-slate-400">
                        {currentChat ? `${currentChat.agentName} Active` : 'AI Agent Active'}
                      </div>
                    </div>
                    {currentChat && (
                      <div className="text-xs text-blue-400 ml-5">Specialized in {currentChat.agentSpecialty}</div>
                    )}
                  </div>
                  {/* Chat messages */}
                  <div className="space-y-4">
                    {currentChat ? (
                      // Render chat messages if chat is loaded
                      currentChat.conversation.map((message, index) => (
                        message.type === 'user' ? (
                          <div key={index} className="flex justify-end">
                            <div className="bg-blue-500/20 text-blue-200 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%] text-sm">
                              {message.message}
                            </div>
                          </div>
                        ) : (
                          <div key={index} className="flex gap-2">
                            <div className="w-6 h-6 rounded-full bg-purple-500/30 flex-shrink-0"></div>
                            <div className="bg-slate-800/50 text-slate-200 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] text-sm">
                              {message.message}
                            </div>
                          </div>
                        )
                      ))
                    ) : (
                      // Placeholder skeleton loader while loading
                      <>
                        <div className="flex justify-end">
                          <div className="bg-blue-500/10 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%] h-8"></div>
                        </div>
                        <div className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-purple-500/20 flex-shrink-0"></div>
                          <div className="bg-slate-800/30 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%] h-8"></div>
                        </div>
                      </>
                    )}
                    {/* AI typing indicator */}
                    <div className="flex gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-500/30 flex-shrink-0"></div>
                      <div className="bg-slate-800/50 rounded-2xl rounded-tl-sm px-4 py-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}