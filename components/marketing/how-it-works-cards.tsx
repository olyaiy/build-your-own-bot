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
  isActive: boolean;
  onClick: () => void;
  index: number;
}

function StepCard({ icon, title, isActive, onClick, index }: StepCardProps) {
  return (
    <motion.div
      className={`relative p-6 sm:p-8 rounded-2xl cursor-pointer transition-all duration-500 backdrop-blur-xl w-full overflow-hidden group ${
        isActive 
          ? "bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/20 shadow-xl shadow-blue-500/10 border border-white/20" 
          : "bg-gradient-to-br from-white/10 to-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20"
      }`}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      {/* Gradient orb background effect */}
      <div 
        className={`absolute inset-0 transition-opacity duration-500 opacity-0 group-hover:opacity-100 ${
          isActive ? "opacity-50" : ""
        }`}
      >
        <div className="absolute -right-1/4 -top-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 blur-2xl" />
        <div className="absolute -left-1/4 -bottom-1/4 w-1/2 h-1/2 rounded-full bg-gradient-to-br from-purple-500/30 to-blue-500/30 blur-2xl" />
      </div>

      <div className="absolute top-4 right-4">
        <motion.div 
          animate={{ 
            opacity: isActive ? 1 : 0,
            x: isActive ? 0 : -10
          }}
          transition={{ duration: 0.3 }}
          className="text-blue-400"
        >
          <ChevronRight size={20} />
        </motion.div>
      </div>
      
      <div className="flex items-start gap-5 relative z-10">
        <div className="relative">
          <motion.div 
            className={`p-3 sm:p-4 rounded-xl ${
              isActive 
                ? "bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25" 
                : "bg-gradient-to-br from-slate-800 to-slate-700"
            }`}
            animate={{ 
              scale: isActive ? 1.1 : 1,
              rotate: isActive ? 5 : 0
            }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              animate={{
                rotate: isActive ? [0, -5, 5, 0] : 0,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              {icon}
            </motion.div>
          </motion.div>
          <motion.div 
            className="absolute -top-3 -left-3 flex items-center justify-center size-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 text-white text-xs font-bold shadow-lg shadow-blue-500/30 border-2 border-white/25"
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
        
        <div className="flex-1 pt-1">
          <motion.h3 
            className={`text-lg sm:text-xl font-semibold mb-2 tracking-tight ${
              isActive ? "text-blue-300" : "text-white group-hover:text-blue-300 transition-colors duration-300"
            }`}
            animate={{ 
              scale: isActive ? 1.02 : 1,
              x: isActive ? 2 : 0
            }}
            transition={{ duration: 0.3 }}
          >
            {title}
          </motion.h3>
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
    },
    {
      icon: <Users size={20} />,
      title: "Join the AI Marketplace",
    },
    {
      icon: <CreditCard size={20} />,
      title: "Generate Passive Income",
    },
    {
      icon: <TrendingUp size={20} />,
      title: "Scale Your AI Business",
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
                className="w-full shrink-0 flex-grow-0 snap-center"
                style={{ 
                  flexBasis: '100%',
                  scrollSnapAlign: 'center'
                }}
              >
                <div className="p-1">
                  <StepCard
                    icon={step.icon}
                    title={step.title}
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
          
          <div className="flex justify-center mt-6 space-x-3">
            {steps.map((_, index) => (
              <button
                key={index}
                aria-label={`Go to slide ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeStep === index 
                    ? "bg-gradient-to-r from-blue-400 to-purple-500 w-8" 
                    : "bg-slate-700 w-2 hover:bg-slate-600"
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