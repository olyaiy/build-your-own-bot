"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { 
  Zap, 
  Users, 
  CreditCard, 
  TrendingUp,
  ChevronRight
} from "lucide-react";

// CSS to hide scrollbar
const hideScrollbarStyles = `
  .hide-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

function StepCard({ icon, title, description, isActive, onClick, index }: StepCardProps) {
  return (
    <motion.div
      className={`relative p-4 sm:p-6 rounded-xl cursor-pointer transition-all backdrop-blur-sm w-full ${
        isActive 
          ? "bg-gradient-to-br from-white/15 to-white/5 shadow-lg border border-white/20" 
          : "bg-white/5 hover:bg-white/10 border border-transparent"
      }`}
      whileHover={{ scale: 1.03, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <div className="absolute top-0 right-0 p-2">
        <motion.div 
          animate={{ opacity: isActive ? 1 : 0 }}
          className="text-blue-400"
        >
          <ChevronRight size={16} />
        </motion.div>
      </div>
      
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="relative">
          <motion.div 
            className={`p-2 sm:p-3 rounded-full ${
              isActive 
                ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-md shadow-blue-500/20" 
                : "bg-slate-800"
            }`}
            animate={{ 
              scale: isActive ? 1.1 : 1,
              rotate: isActive ? 5 : 0
            }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
          <motion.div 
            className="absolute -top-3 -left-3 flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold shadow-lg shadow-blue-500/30 border border-white/25"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: isActive ? 1.1 : 1, 
              opacity: 1,
              rotate: isActive ? -5 : 0
            }}
            transition={{ duration: 0.4, delay: 0.1 + (index * 0.05) }}
          >
            {index + 1}
          </motion.div>
        </div>
        
        <div className="flex-1">
          <motion.h3 
            className={`text-base sm:text-lg font-semibold mb-1 sm:mb-2 ${isActive ? "text-blue-300" : "text-white"}`}
            animate={{ 
              scale: isActive ? 1.05 : 1,
              x: isActive ? 2 : 0
            }}
            transition={{ duration: 0.2 }}
          >
            {title}
          </motion.h3>
          <p className="text-xs sm:text-sm text-slate-300">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function HowItWorksCards() {
  const [activeStep, setActiveStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  
  // Check if viewport is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Auto-cycle through steps
  useEffect(() => {
    const interval = setInterval(() => {
      const nextStep = (activeStep + 1) % steps.length;
      setActiveStep(nextStep);
      
      // Scroll to the active card on mobile
      if (isMobile && carouselRef.current) {
        const scrollTo = nextStep * carouselRef.current.offsetWidth;
        carouselRef.current.scrollTo({
          left: scrollTo,
          behavior: 'smooth'
        });
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [activeStep, isMobile]);
  
  // Function to handle swipe/drag end
  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = offset.x;
    
    if (Math.abs(swipe) > 50) {
      if (swipe < 0) {
        // Swipe left - next slide
        const nextStep = (activeStep + 1) % steps.length;
        setActiveStep(nextStep);
        if (carouselRef.current) {
          const scrollTo = nextStep * carouselRef.current.offsetWidth;
          carouselRef.current.scrollTo({
            left: scrollTo,
            behavior: 'smooth'
          });
        }
      } else {
        // Swipe right - previous slide
        const prevStep = (activeStep - 1 + steps.length) % steps.length;
        setActiveStep(prevStep);
        if (carouselRef.current) {
          const scrollTo = prevStep * carouselRef.current.offsetWidth;
          carouselRef.current.scrollTo({
            left: scrollTo,
            behavior: 'smooth'
          });
        }
      }
    }
  };
  
  // Handle manual scroll events (sync indicator with scroll position)
  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current && isMobile) {
        const scrollPosition = carouselRef.current.scrollLeft;
        const cardWidth = carouselRef.current.offsetWidth;
        const newActiveStep = Math.round(scrollPosition / cardWidth);
        
        if (newActiveStep !== activeStep) {
          setActiveStep(newActiveStep);
        }
      }
    };
    
    const carouselElement = carouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener('scroll', handleScroll);
    }
    
    return () => {
      if (carouselElement) {
        carouselElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [activeStep, isMobile]);
  
  const steps = [
    {
      icon: <Zap size={20} />,
      title: "Design Your AI Agent",
      description: "Create powerful AI agents that solve specific problems. Define personality, knowledge, and capabilities without writing a single line of code."
    },
    {
      icon: <Users size={20} />,
      title: "Join the AI Marketplace",
      description: "List your agent alongside the best AI solutions. Reach thousands of users searching for specialized help with their unique challenges."
    },
    {
      icon: <CreditCard size={20} />,
      title: "Generate Passive Income",
      description: "Earn 10% of token usage whenever someone interacts with your agent. Scale your earnings as your agent gains popularity."
    },
    {
      icon: <TrendingUp size={20} />,
      title: "Scale Your AI Business",
      description: "Gather user feedback, refine your agent, and build a portfolio of specialized AI solutions that generate revenue 24/7."
    }
  ];

  // Render as grid on desktop, carousel on mobile
  return (
    <>
      <style jsx global>{hideScrollbarStyles}</style>
      {isMobile ? (
        <div className="relative w-full">
          <motion.div 
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar touch-pan-y"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            style={{
              scrollBehavior: 'smooth',
              scrollSnapType: 'x mandatory'
            }}
          >
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="w-full flex-shrink-0 flex-grow-0 snap-center"
                style={{ 
                  flexBasis: '100%',
                  scrollSnapAlign: 'center'
                }}
              >
                <div className="p-1">
                  <StepCard
                    icon={step.icon}
                    title={step.title}
                    description={step.description}
                    isActive={activeStep === index}
                    onClick={() => {
                      setActiveStep(index);
                      if (carouselRef.current) {
                        const scrollTo = index * carouselRef.current.offsetWidth;
                        carouselRef.current.scrollTo({
                          left: scrollTo,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    index={index}
                  />
                </div>
              </div>
            ))}
          </motion.div>
          
          <div className="flex justify-center mt-4 space-x-2">
            {steps.map((_, index) => (
              <button
                key={index}
                aria-label={`Go to slide ${index + 1}`}
                className={`w-2 h-2 rounded-full transition-all ${
                  activeStep === index 
                    ? "bg-blue-400 w-4" 
                    : "bg-slate-600 hover:bg-slate-500"
                }`}
                onClick={() => {
                  setActiveStep(index);
                  if (carouselRef.current) {
                    const scrollTo = index * carouselRef.current.offsetWidth;
                    carouselRef.current.scrollTo({
                      left: scrollTo,
                      behavior: 'smooth'
                    });
                  }
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {steps.map((step, index) => (
            <StepCard
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
              isActive={activeStep === index}
              onClick={() => setActiveStep(index)}
              index={index}
            />
          ))}
        </div>
      )}
    </>
  );
} 