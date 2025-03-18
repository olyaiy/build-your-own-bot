import { 
  Zap, 
  Users, 
  CreditCard, 
  TrendingUp
} from "lucide-react";

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number;
}

function StepCard({ icon, title, description, index }: StepCardProps) {
  const gradientColors = [
    "from-blue-600 to-purple-600",
    "from-purple-600 to-pink-600", 
    "from-pink-600 to-orange-600",
    "from-orange-600 to-blue-600"
  ];

  return (
    <div className="relative p-6 rounded-xl bg-gradient-to-br from-white/15 to-white/5 border border-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all group">
      <div className="absolute -z-10 -inset-1 rounded-xl opacity-0 group-hover:opacity-100 blur-sm bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 transition-all duration-500" />
      
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full bg-gradient-to-r ${gradientColors[index % gradientColors.length]} shadow-md shadow-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300`}>
          {icon}
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-2 text-white group-hover:text-blue-300 transition-colors">{title}</h3>
          <p className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">{description}</p>
        </div>
      </div>
      
      <div className="w-0 group-hover:w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-4 transition-all duration-300" />
    </div>
  );
}

export function HowItWorksStatic() {
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {steps.map((step, index) => (
        <StepCard
          key={index}
          icon={step.icon}
          title={step.title}
          description={step.description}
          index={index}
        />
      ))}
    </div>
  );
} 