"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from "@/components/ui/card";
import {
  BrainCircuit,
  Wand2,
  Copy,
  CheckCircle2,
  Info,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface AgentSystemPromptSectionProps {
  systemPromptRef: React.RefObject<HTMLTextAreaElement>;
  systemPrompt: string;
  isFocused: boolean; 
  copiedTemplate: string | null;
  showTemplates: boolean;
  onSystemPromptChange: (value: string) => void;
  onFocusChange: (focused: boolean) => void;
  onTemplateCopy: (template: string) => void;
  onShowTemplatesChange: (show: boolean) => void;
  onTemplateSelect: (template: string) => void;
  onClearPrompt: () => void;
  adjustSystemPromptHeight: () => void;
  mode: "create" | "edit";
}

// Sample templates for different types of agents
const PROMPT_TEMPLATES = [
  {
    name: "General Assistant",
    content: "You are a helpful, friendly AI assistant. Your goal is to provide accurate, concise, and helpful responses to user queries. Always aim to be respectful and thoughtful in your interactions.",
    tags: ["general", "helpful"]
  },
  {
    name: "Code Assistant",
    content: "You are a programming assistant specialized in helping with coding tasks. Provide clear, concise code examples with explanations. When appropriate, suggest best practices and potential improvements. If you don't know something, be honest about it.",
    tags: ["code", "programming"]
  },
  {
    name: "Research Assistant",
    content: "You are a research assistant specializing in providing well-researched, factual information. Your responses should be thorough, balanced, and backed by evidence. Always indicate if information might be uncertain or debated among experts.",
    tags: ["research", "academic"]
  },
  {
    name: "Creative Writer",
    content: "You are a creative writing assistant designed to help with generating stories, poems, and other creative content. Be imaginative, engaging, and tailor your responses to the user's requests. Feel free to suggest creative directions while respecting the user's vision.",
    tags: ["creative", "writing"]
  },
  {
    name: "Subject Matter Expert",
    content: "You are an expert in [SUBJECT]. Provide detailed, accurate information about this field. Use proper terminology and concepts. When users ask questions, give thorough explanations that would satisfy both beginners and those with some existing knowledge.",
    tags: ["expert", "specialized"]
  }
];

export default function AgentSystemPromptSection({
  systemPromptRef,
  systemPrompt,
  isFocused,
  copiedTemplate,
  showTemplates,
  onSystemPromptChange,
  onFocusChange,
  onTemplateCopy,
  onShowTemplatesChange,
  onTemplateSelect,
  onClearPrompt,
  adjustSystemPromptHeight,
  mode,
}: AgentSystemPromptSectionProps) {
  const isPromptTooShort = systemPrompt.length > 0 && systemPrompt.length < 50;
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onSystemPromptChange(e.target.value);
    // Timeout to allow the textarea to update its value before adjusting height
    setTimeout(adjustSystemPromptHeight, 0);
  };

  return (
    <Card className="border border-muted-foreground/10 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <BrainCircuit className="size-4 text-primary" />
            System Prompt
            <span className="text-red-500">*</span>
          </CardTitle>
          <Popover open={showTemplates} onOpenChange={onShowTemplatesChange}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Wand2 className="size-3.5" />
                Templates
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Prompt Templates</h4>
                <p className="text-xs text-muted-foreground">
                  Select a template to use as a starting point
                </p>
              </div>
              <ScrollArea className="h-72 mt-2">
                <div className="space-y-2 pr-3">
                  {PROMPT_TEMPLATES.map((template, index) => (
                    <div 
                      key={index} 
                      className="border rounded-md p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h5 className="font-medium text-sm">{template.name}</h5>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="size-6"
                            onClick={() => onTemplateCopy(template.content)}
                          >
                            {copiedTemplate === template.content ? (
                              <CheckCircle2 className="size-3.5 text-green-500" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-1 mb-2">
                        {template.tags.map((tag, tagIndex) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs px-1.5 py-0">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {template.content}
                      </p>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-2 h-7 text-xs"
                        onClick={() => onTemplateSelect(template.content)}
                      >
                        Use Template
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
        <CardDescription>
          Define how your agent should behave and respond to user inputs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Label htmlFor="systemPrompt" className="text-sm font-medium">
              Instructions for your agent
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="right" className="max-w-80">
                  <p>The system prompt provides instructions to the AI model about how it should behave, what role it should adopt, and any specific guidelines it should follow.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <span className="text-xs text-muted-foreground">
            {systemPrompt.length} characters
          </span>
        </div>
        
        <div className="relative">
          <Textarea
            id="systemPrompt"
            name="systemPrompt"
            ref={systemPromptRef}
            className={cn(
              "min-h-32 font-mono text-sm leading-relaxed",
              isFocused ? "border-primary ring-1 ring-primary/50" : ""
            )}
            placeholder="You are a helpful assistant that..."
            onChange={handlePromptChange}
            onFocus={() => onFocusChange(true)}
            onBlur={() => onFocusChange(false)}
            value={systemPrompt}
            required
          />
          
          {systemPrompt.length > 0 && (
            <div className="absolute top-2 right-2 flex gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-6 bg-background/80 backdrop-blur-sm"
                      onClick={() => {
                        if (confirm("Are you sure you want to clear the system prompt?")) {
                          onClearPrompt();
                        }
                      }}
                    >
                      <RefreshCw className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Reset system prompt</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="size-6 bg-background/80 backdrop-blur-sm"
                      onClick={() => {
                        if (systemPromptRef.current) {
                          navigator.clipboard.writeText(systemPromptRef.current.value);
                          // Provide visual feedback
                          const button = document.activeElement as HTMLElement;
                          if (button) button.blur();
                          // Show toast or some feedback
                        }
                      }}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>Copy to clipboard</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
        
        {isPromptTooShort && (
          <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
            <AlertCircle className="size-3" />
            Your prompt is very short. Consider adding more detailed instructions for better results.
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-2 pb-3 flex flex-col items-start">
        <div className="text-xs text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-md w-full">
          <p className="font-medium">Tips for effective system prompts:</p>
          <ul className="list-disc list-inside space-y-0.5 pl-1">
            <li>Be specific about your agent&apos;s role and expertise</li>
            <li>Include instructions on how the agent should respond</li>
            <li>Define boundaries for what the agent should and shouldn&apos;t do</li>
            <li>Provide examples of desired responses where helpful</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
} 