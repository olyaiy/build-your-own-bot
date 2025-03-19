"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";

export function HeroBanner() {
  const scrollToAgents = () => {
    const agentList = document.getElementById("agent-list");
    agentList?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-xl mb-8 overflow-hidden">
      <div className="container px-4 py-6 mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              AI Agent Marketplace
              <span className="text-blue-400 block mt-0.5">Powered by Experts</span>
            </h1>
            
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="bg-blue-500/20 p-1.5 rounded-full">
                  <div className="w-5 h-5 flex items-center justify-center text-blue-400 font-semibold text-sm">1</div>
                </div>
                <div>
                  <h3 className="font-medium text-blue-300">For Creators</h3>
                  <p className="text-slate-300 text-sm">Build specialized AI agents and monetize your expertise</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 p-1.5 rounded-full">
                  <div className="w-5 h-5 flex items-center justify-center text-purple-400 font-semibold text-sm">2</div>
                </div>
                <div>
                  <h3 className="font-medium text-purple-300">For Users</h3>
                  <p className="text-slate-300 text-sm">Discover and access tailored AI solutions for your specific needs</p>
                </div>
              </div>
              
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
            
            <div className="flex gap-3 pt-1">
              <Link href="/agents/create">
                <Button className="group" size="sm">
                  Create Your Agent
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              
              <Button onClick={scrollToAgents} className="group" size="sm" variant="outline">
                Browse Agents
                <Search className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          
          <div className="md:col-span-5 hidden md:block">
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg blur opacity-75"></div>
              <div className="relative bg-slate-950 p-4 rounded-lg">
                <div className="space-y-3">
                  <div className="h-1.5 w-20 bg-blue-500/30 rounded-full"></div>
                  <div className="h-1.5 w-28 bg-purple-500/30 rounded-full"></div>
                  <div className="mt-4 space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800"></div>
                        <div className="flex-1">
                          <div className="h-1.5 w-full bg-slate-800 rounded-full"></div>
                          <div className="h-1.5 w-2/3 bg-slate-800 rounded-full mt-1.5"></div>
                        </div>
                      </div>
                    ))}
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