"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatDistance } from "date-fns";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Icons
import {
  Clock,
  Eye,
  EyeOff,
  Globe,
  Link as LinkIcon,
  MessageSquare,
  FileText,
  Book,
  Cpu,
  Puzzle,
  Tag,
  ArrowLeft,
  ImageIcon,
} from "lucide-react";

interface AgentViewProps {
  agentData: {
    id: string;
    agentDisplayName: string;
    systemPrompt: string;
    description?: string;
    modelId: string;
    visibility: "public" | "private" | "link";
    artifactsEnabled: boolean | null;
    imageUrl?: string;
    customization?: {
      overview: {
        title: string;
        content: string;
        showPoints: boolean;
        points: string[];
      };
      style: {
        colorSchemeId: string;
      };
    };
    createdAt?: Date;
    updatedAt?: Date;
    tags?: { id: string; name: string }[];
    toolGroups?: { id: string; name: string; displayName: string; description?: string }[];
    modelDetails?: {
      displayName: string;
      modelType: string;
      description?: string;
    };
  };
  models: {
    id: string;
    displayName: string;
    modelType: string | null;
    description?: string;
  }[];
}

export default function AgentView({ agentData, models }: AgentViewProps) {
  const router = useRouter();
  const selectedModel = models.find(m => m.id === agentData.modelId);
  
  // Color schemes based on colorSchemeId
  const colorSchemes: Record<string, { bg: string; accent: string }> = {
    default: { bg: "bg-gradient-to-br from-slate-800 to-slate-900", accent: "bg-blue-600" },
    blue: { bg: "bg-gradient-to-br from-blue-800 to-blue-950", accent: "bg-blue-500" },
    green: { bg: "bg-gradient-to-br from-emerald-800 to-emerald-950", accent: "bg-emerald-500" },
    purple: { bg: "bg-gradient-to-br from-violet-800 to-violet-950", accent: "bg-violet-500" },
    red: { bg: "bg-gradient-to-br from-rose-800 to-rose-950", accent: "bg-rose-500" },
    orange: { bg: "bg-gradient-to-br from-orange-800 to-orange-950", accent: "bg-orange-500" },
  };
  
  // Set color scheme based on agent customization or default
  const colorSchemeId = agentData.customization?.style?.colorSchemeId || "default";
  const colorScheme = colorSchemes[colorSchemeId] || colorSchemes.default;
  
  // Helper function to get visibility icon and text
  const getVisibilityInfo = () => {
    switch (agentData.visibility) {
      case "public":
        return { icon: <Globe className="h-4 w-4" />, text: "Public" };
      case "private":
        return { icon: <EyeOff className="h-4 w-4" />, text: "Private" };
      case "link":
        return { icon: <LinkIcon className="h-4 w-4" />, text: "Link Sharing" };
      default:
        return { icon: <Globe className="h-4 w-4" />, text: "Public" };
    }
  };

  const visibilityInfo = getVisibilityInfo();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Hero section with agent info */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <div className={`${colorScheme.bg} text-white p-8`}>
          <div className="flex items-start gap-8">
            {/* Agent Avatar */}
            <div className="hidden sm:block flex-shrink-0">
              {agentData.imageUrl ? (
                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                  <Image
                    src={agentData.imageUrl}
                    alt={agentData.agentDisplayName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 bg-black/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <ImageIcon className="size-16 text-white/50" />
                </div>
              )}
            </div>
            
            {/* Agent Info */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h1 className="text-3xl font-bold mb-2">{agentData.agentDisplayName}</h1>
                <Badge variant="outline" className="text-xs border-white/20 bg-white/10 flex gap-1 items-center">
                  {visibilityInfo.icon}
                  <span>{visibilityInfo.text}</span>
                </Badge>
              </div>
              
              <p className="text-white/80 mb-4 max-w-3xl">
                {agentData.description || agentData.customization?.overview?.content || "No description provided."}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {/* Agent Model Badge */}
                {selectedModel && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 flex gap-1.5 items-center">
                          <Cpu className="h-3 w-3" />
                          <span>{selectedModel.displayName}</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>{selectedModel.modelType}</p>
                        {selectedModel.description && <p className="text-xs text-muted-foreground">{selectedModel.description}</p>}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                
                {/* Artifacts Enabled Badge */}
                <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 flex gap-1.5 items-center">
                  <FileText className="h-3 w-3" />
                  <span>Artifacts {agentData.artifactsEnabled ? "Enabled" : "Disabled"}</span>
                </Badge>
                
                {/* Timestamp Badge if available */}
                {agentData.createdAt && (
                  <Badge variant="secondary" className="bg-white/10 hover:bg-white/20 flex gap-1.5 items-center">
                    <Clock className="h-3 w-3" />
                    <span>Created {formatDistance(agentData.createdAt, new Date(), { addSuffix: true })}</span>
                  </Badge>
                )}
                
                {/* Tags */}
                {agentData.tags && agentData.tags.length > 0 && (
                  <div className="flex gap-1.5 items-center flex-wrap">
                    {agentData.tags.slice(0, 3).map(tag => (
                      <Badge key={tag.id} variant="outline" className="bg-white/5 border-white/20 text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                    {agentData.tags.length > 3 && (
                      <Badge variant="outline" className="bg-white/5 border-white/20 text-xs">
                        +{agentData.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Overview Section */}
      <Card>

        <CardContent className="space-y-0  m-0 p-0">
          <div className="flex items-start gap-3">
            
            {/* Message bubble - Apple iMessage style */}
            <div className="relative max-w-[85%] m-0">
              <div className="bg-blue-500 text-white p-4 rounded-2xl rounded-tl-sm shadow-sm">
                <p className="text-base leading-relaxed">
                  {agentData.customization?.overview?.content || agentData.description || "No description available for this agent."}
                </p>
              </div>
            </div>
          </div>
          
        </CardContent>
      </Card>
      
      {/* Capabilities Section - only show if there are points */}
      {agentData.customization?.overview?.showPoints && agentData.customization.overview.points.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Capabilities</CardTitle>
            <CardDescription>What this agent can do for you</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {agentData.customization.overview.points.map((point, index) => (
                <li key={index} className="flex gap-3">
                  <div className={`flex-shrink-0 w-6 h-6 ${colorScheme.accent} rounded-full flex items-center justify-center text-white text-sm font-medium`}>
                    {index + 1}
                  </div>
                  <p className="text-base">{point}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
        
      {/* Simple Tools and Categories Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tools List */}
        {agentData.toolGroups && agentData.toolGroups.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                Tools
              </CardTitle>
              <CardDescription>This agent has access to the following tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {agentData.toolGroups.map(tool => (
                  <div
                    key={tool.id}
                    className="border border-primary bg-primary/5 rounded-lg p-3 flex flex-col"
                  >
                    <div className="font-medium flex items-center gap-2">
                      {tool.displayName}
                    </div>
                    {tool.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {tool.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
      
      </div>
      
      {/* System Prompt Section */}
      <Card>
        <CardHeader>
          <CardTitle>System Prompt</CardTitle>
          <CardDescription>The foundational instructions that define this agent's behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-md p-4 overflow-auto max-h-[500px]">
            <pre className="text-sm whitespace-pre-wrap">{agentData.systemPrompt}</pre>
          </div>
        </CardContent>
      </Card>
      
      {/* Technical Details Section */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Details</CardTitle>
          <CardDescription>Advanced information about this agent's configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Models Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Models</h3>
            {selectedModel ? (
              <div className="space-y-3">
                {/* Default Model */}
                <div className="bg-muted p-3 rounded-md relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium">{selectedModel.displayName}</div>
                      <div className="text-xs text-muted-foreground flex flex-col gap-1 mt-1">
                        <span>Type: {selectedModel.modelType || "Unknown"}</span>
                        {selectedModel.description && <span>{selectedModel.description}</span>}
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-primary/10 text-primary text-[10px]">Default</Badge>
                  </div>
                </div>
                
                {/* Alternate Models */}
                {models
                  .filter(m => m.id !== agentData.modelId && models.some(am => am.id === m.id))
                  .map(model => (
                    <div key={model.id} className="bg-muted/50 p-3 rounded-md">
                      <div className="text-sm font-medium">{model.displayName}</div>
                      <div className="text-xs text-muted-foreground flex flex-col gap-1 mt-1">
                        <span>Type: {model.modelType || "Unknown"}</span>
                        {model.description && <span>{model.description}</span>}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No model information available</div>
            )}
          </div>
          
          {/* Visibility Section */}
          <div className="space-y-2 pt-2">
            <h3 className="text-sm font-medium">Visibility</h3>
            <div className="flex items-center gap-2">
              {visibilityInfo.icon}
              <span className="text-sm capitalize">{agentData.visibility}</span>
              <span className="text-xs text-muted-foreground">
                {agentData.visibility === "public" && "Accessible to everyone"}
                {agentData.visibility === "private" && "Only accessible to the creator"}
                {agentData.visibility === "link" && "Accessible to anyone with the link"}
              </span>
            </div>
          </div>
          
          {/* Timestamps Section */}
          {(agentData.createdAt || agentData.updatedAt) && (
            <div className="space-y-2 pt-2">
              <h3 className="text-sm font-medium">Timestamps</h3>
              <div className="grid gap-2 text-sm">
                {agentData.createdAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Created: {formatDistance(agentData.createdAt, new Date(), { addSuffix: true })}</span>
                  </div>
                )}
                {agentData.updatedAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Updated: {formatDistance(agentData.updatedAt, new Date(), { addSuffix: true })}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-2">
        <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to List
        </Button>
        
        <Button 
          variant="default" 
          onClick={() => router.push(`/${agentData.id}`)}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          Start Chat
        </Button>
      </div>
    </div>
  );
} 