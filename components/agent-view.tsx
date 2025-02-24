"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";

interface AgentViewProps {
  agentData: {
    id: string;
    agentDisplayName: string;
    systemPrompt: string;
    description?: string;
    modelId: string;
    visibility: "public" | "private" | "link";
    artifactsEnabled: boolean | null;
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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex gap-8">
        {/* Profile Placeholder - Same as form */}
        <div className="w-1/4 aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
          <svg
            className="w-1/2 h-1/2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>

        {/* Right Column - Display Fields */}
        <div className="flex-1 space-y-6">
          <div>
            <Label className="text-lg font-semibold">Agent Name</Label>
            <Input
              readOnly
              value={agentData.agentDisplayName}
              className="mt-2 text-xl h-16 px-6 font-medium bg-muted"
            />
          </div>

          <div>
            <Label className="text-lg font-semibold">Description</Label>
            <Textarea
              readOnly
              value={agentData.description || ''}
              className="mt-2 bg-muted"
            />
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Model</Label>
              <Select value={agentData.modelId} disabled>
                <SelectTrigger className="mt-2 bg-muted">
                  <SelectValue placeholder="Selected model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={selectedModel?.id || ''}>
                    <div className="flex flex-col justify-start items-start">
                      <span className="font-medium">{selectedModel?.displayName}</span>
                      <span className="text-xs text-muted-foreground">
                        {selectedModel?.modelType ?? ''}
                      </span>
                      <span className="text-xs text-muted-foreground">{selectedModel?.description}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Visibility</Label>
              <Input
                readOnly
                value={agentData.visibility}
                className="mt-2 bg-muted capitalize"
              />
            </div>

            <div className="flex items-end h-full">
              <div className="flex items-center gap-2">
                <Switch 
                  checked={agentData.artifactsEnabled ?? false}
                  disabled
                />
                <Label>Artifacts Enabled</Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Prompt Section */}
      <div className="border-t pt-8">
        <Label className="text-lg font-semibold">System Prompt</Label>
        <Textarea
          readOnly
          value={agentData.systemPrompt}
          className="mt-2 min-h-[150px] bg-muted"
        />
      </div>

      <div className="flex gap-4 pt-4 border-t">
        <Button variant="outline" onClick={() => router.back()}>
          Back to List
        </Button>
      </div>
    </div>
  );
} 