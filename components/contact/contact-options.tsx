"use client";

import { Twitter, Mail, MessageSquare, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function ContactOptions() {
  return (
    <div className="relative bg-blue-950/10 border border-white/20 dark:border-white/10  rounded-2xl p-8 m-4">
      <div className="container max-w-6xl px-4 mx-auto">          
        {/* Cards with simplified design and interactions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Option 1: X/Twitter */}
          <a 
            href="https://x.com/alexfromvan" 
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 to-black/40"></div>
            
            <div className="relative z-20 p-8 flex flex-col h-full">
              <div className="mb-6 flex items-center">
                <div className="size-12 rounded-full overflow-hidden border-2 border-white/50 mr-3">
                  <Image 
                    src="/images/x-pprofile-pic.jpg" 
                    alt="Alex on X" 
                    className="size-full object-cover"
                    width={48}
                    height={48}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">Connect on X</h3>
                  <p className="text-white/70 text-sm">@alexfromvan</p>
                </div>
              </div>
              <p className="text-white/90 mb-6 grow">
                Reach out directly to our founder Alex on X for quick responses.
              </p>
              <div className="mt-auto">
                <span className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white group-hover:bg-white/20 transition-colors">
                  <Twitter size={16} />
                  <span>Message on X</span>
                  <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </a>
          
          {/* Option 2: Contact Form */}
          <a 
            href="#contact-form"
            className="group relative overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-purple-700 to-pink-600"></div>
            
            <div className="relative z-20 p-8 flex flex-col h-full">
              <div className="mb-6">
                <div className="size-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <MessageSquare size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Leave a Message</h3>
              </div>
              <p className="text-white/90 mb-6 grow">
                Fill out our contact form and we&apos;ll get back to you as soon as possible.
              </p>
              <div className="mt-auto">
                <span className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white group-hover:bg-white/20 transition-colors">
                  <span>Go to Form</span>
                  <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </a>
          
          {/* Option 3: Email */}
          <a 
            href="mailto:emailalexan@protonmail.com"
            className="group relative overflow-hidden rounded-2xl transition-all duration-200 hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-blue-600/40"></div>
            
            <div className="relative z-20 p-8 flex flex-col h-full">
              <div className="mb-6">
                <div className="size-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                  <Mail size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Send an Email</h3>
              </div>
              <p className="text-white/90 mb-6 grow">
                Email our founder directly for business inquiries or partnerships.
              </p>
              <div className="mt-auto">
                <span className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white group-hover:bg-white/20 transition-colors">
                  <Mail size={16} />
                  <span className="text-sm truncate max-w-[150px] sm:max-w-[180px] md:max-w-[120px] lg:max-w-[160px]">emailalexan@protonmail.com</span>
                  <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
} 