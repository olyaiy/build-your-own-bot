"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Plus, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { getSuggestedPromptsByAgentId, upsertSuggestedPrompts } from "@/app/(agents)/actions";

interface PromptSuggestionEditorProps {
  agentId?: string;  // Optional for new agents
  initialPrompts?: string[];
  onChange?: (prompts: string[]) => void;
}

export function PromptSuggestionEditor({ 
  agentId, 
  initialPrompts,
  onChange 
}: PromptSuggestionEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [prompts, setPrompts] = useState<string[]>(initialPrompts || [
    "What can you help me with?",
    "Tell me about yourself",
    "What features do you have?",
    "How do I get started?"
  ]);
  
  // Load initial prompts if not provided and we have an agentId
  useEffect(() => {
    if (!initialPrompts && agentId) {
      const loadPrompts = async () => {
        setIsLoading(true);
        try {
          const loadedPrompts = await getSuggestedPromptsByAgentId(agentId);
          setPrompts(loadedPrompts);
          onChange?.(loadedPrompts);
        } catch (error) {
          console.error("Failed to load suggested prompts:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadPrompts();
    }
  }, [agentId, initialPrompts, onChange]);

  // Add new prompt
  const handleAddPrompt = useCallback(() => {
    if (prompts.length >= 4) {
      toast.warning("Maximum 4 prompts allowed");
      return;
    }
    
    const newPrompts = [...prompts, ""];
    setPrompts(newPrompts);
    onChange?.(newPrompts);
  }, [prompts, onChange]);

  // Update prompt at index
  const handlePromptChange = useCallback((index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
    onChange?.(newPrompts);
  }, [prompts, onChange]);

  // Remove prompt at index
  const handleRemovePrompt = useCallback((index: number) => {
    const newPrompts = prompts.filter((_, i) => i !== index);
    setPrompts(newPrompts);
    onChange?.(newPrompts);
  }, [prompts, onChange]);

  // Save prompts to the database
  const handleSavePrompts = useCallback(async () => {
    if (!agentId) return;
    
    setIsSaving(true);
    try {
      await upsertSuggestedPrompts(agentId, prompts.filter(p => p.trim() !== ""));
      toast.success("Suggested prompts saved");
    } catch (error) {
      console.error("Failed to save suggested prompts:", error);
      toast.error("Failed to save suggested prompts");
    } finally {
      setIsSaving(false);
    }
  }, [agentId, prompts]);

  // Preview of how the prompts will appear in chat
  const renderPromptPreview = () => {
    const validPrompts = prompts.filter(p => p.trim() !== "");
    
    if (validPrompts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-center p-4">
          <MessageSquare className="h-8 w-8 mb-2 opacity-50" />
          <p>Add some suggested prompts to see a preview</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-muted/20 rounded-md border">
        {validPrompts.map((prompt, index) => (
          <button
            key={index}
            className="text-left px-3 py-2 bg-card hover:bg-accent rounded-md border text-sm shadow-sm transition-colors"
          >
            {prompt || "Empty prompt"}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <h3 className="text-lg font-semibold">Suggested Prompts</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <AlertCircle className="size-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>Suggested prompts help users get started with your agent. They appear as clickable buttons at the start of a conversation.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="space-y-3">
            {prompts.map((prompt, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    value={prompt}
                    onChange={(e) => handlePromptChange(index, e.target.value)}
                    placeholder="Enter a suggested prompt..."
                    className="w-full"
                    maxLength={100}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemovePrompt(index)}
                  className="h-10 w-10 rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPrompt}
                disabled={prompts.length >= 4}
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Add Prompt</span>
              </Button>
              
              <Badge variant="outline" className="text-xs">
                {prompts.filter(p => p.trim() !== "").length}/4 Prompts
              </Badge>
            </div>
            
            {agentId && (
              <Button
                type="button" 
                variant="outline"
                size="sm"
                onClick={handleSavePrompts}
                disabled={isSaving}
                className="w-fit"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : "Save Prompts"}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Preview</Label>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {renderPromptPreview()}
              </CardContent>
            </Card>
            <p className="text-xs text-muted-foreground">
              This is how your suggested prompts will appear to users.
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 