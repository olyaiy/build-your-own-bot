import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Info, 
  Settings,
  Sparkles
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AgentFeaturesSectionProps {
  initialArtifactsEnabled: boolean;
}

export default function AgentFeaturesSection({
  initialArtifactsEnabled = true,
}: AgentFeaturesSectionProps) {
  const [artifactsEnabled, setArtifactsEnabled] = useState(initialArtifactsEnabled);

  return (
    <Card className="border border-muted-foreground/10 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Settings className="size-4 text-primary" />
          Agent Features
        </CardTitle>
        <CardDescription>
          Configure special features and capabilities for your agent
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Artifacts Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1">
                <Label className="text-sm font-medium">
                  Enable Artifacts
                </Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="size-3.5 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-80">
                      <p>Allow the agent to generate and display artifacts like charts, code blocks, and other visual elements</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <p className="text-xs text-muted-foreground">
                Let your agent generate rich visual content
              </p>
            </div>
            <Switch
              id="artifactsEnabled"
              name="artifactsEnabled"
              checked={artifactsEnabled}
              onCheckedChange={setArtifactsEnabled}
            />
          </div>
          
          {artifactsEnabled && (
            <div className="pl-4 border-l-2 border-muted mt-2">
              <p className="text-xs text-muted-foreground">
                Your agent will be able to generate and display artifacts such as charts, code blocks, images, and other visual elements.
              </p>
            </div>
          )}
        </div>
        
        {/* Space for additional features in the future */}
      </CardContent>
    </Card>
  );
} 