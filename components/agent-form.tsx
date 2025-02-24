"use client";

import React, { useTransition } from "react";
import { toast } from "sonner";
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
import { updateAgent, createAgent, deleteAgent } from "@/app/(agents)/actions";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

interface AgentFormProps {
  mode: "create" | "edit";
  userId?: string;
  models: {
    id: string;
    displayName: string;
    modelType?: string | null;
    description?: string | null;
  }[];
  initialData?: {
    id: string;
    agentDisplayName: string;
    systemPrompt: string;
    description?: string;
    modelId: string;
    visibility: "public" | "private" | "link";
    artifactsEnabled: boolean | null;
  };
}

export default function AgentForm({ mode, userId, models, initialData }: AgentFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const baseData = {
          agentDisplayName: formData.get("agentDisplayName") as string,
          systemPrompt: formData.get("systemPrompt") as string,
          description: formData.get("description") as string || undefined,
          modelId: formData.get("model") as string,
          visibility: formData.get("visibility") as "public" | "private" | "link",
          creatorId: formData.get("userId") as string,
          artifactsEnabled: formData.get("artifactsEnabled") === "on"
        };

        if (mode === "edit") {
          await updateAgent({ ...baseData, id: initialData!.id });
          toast.success("Agent updated successfully");
        } else {
          await createAgent(baseData);
          toast.success("Agent created successfully");
          router.push("/");
        }
      } catch (error) {
        const action = mode === "create" ? "create" : "update";
        toast.error(`Failed to ${action} agent. Please try again.`);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto">
      <div className="flex gap-8">
        {/* Profile Placeholder - Left Column */}
        <div className="w-1/4 aspect-square bg-gray-200 rounded-lg flex items-center justify-center">
          <svg
            className="size-1/2 text-gray-400"
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

        {/* Right Column - All Form Fields */}
        <div className="flex-1 space-y-6">
          <div>
            <Label htmlFor="agentDisplayName" className="text-lg font-semibold">
              Agent Name
            </Label>
            <Input
              id="agentDisplayName"
              name="agentDisplayName"
              type="text"
              placeholder="Enter agent display name"
              className="mt-2 text-xl h-16 px-6 font-medium"
              required
              defaultValue={initialData?.agentDisplayName}
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-lg font-semibold">
              Description
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter description (optional)"
              className="mt-2"
              defaultValue={initialData?.description}
            />
          </div>

          {/* Settings Row */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="model" className="text-sm font-medium">Model</Label>
              <Select name="model" required defaultValue={initialData?.modelId}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id} className=" flex flex-col justify-start items-start">
                      <div className="flex flex-col justify-start items-start">
                        <span className="font-medium">{model.displayName}</span>
                        <span className="text-xs text-muted-foreground">{model.modelType}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>

                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="visibility" className="text-sm font-medium">Visibility</Label>
              <Select name="visibility" defaultValue={initialData?.visibility || "public"}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end h-full">
              <div className="flex items-center gap-2">
                <Switch 
                  id="artifactsEnabled" 
                  name="artifactsEnabled"
                  defaultChecked={initialData?.artifactsEnabled ?? true}
                />
                <Label htmlFor="artifactsEnabled">
                  Enable Artifacts
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Prompt Section */}
      <div className="border-t pt-8">
        <Label htmlFor="systemPrompt" className="text-lg font-semibold">
          System Prompt
        </Label>
        <Textarea
          id="systemPrompt"
          name="systemPrompt"
          placeholder={mode === "create" 
            ? "e.g. You are a friendly assistant! Keep your responses concise and helpful." 
            : "Enter system prompt"}
          className="mt-2 min-h-[150px]"
          required
          defaultValue={initialData?.systemPrompt}
        />
      </div>

      <input type="hidden" name="userId" value={userId || ''} />
      
      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t">
        <Button type="submit" disabled={isPending}>
          {isPending ? `${mode === 'create' ? 'Creating' : 'Updating'}...` : `${mode === 'create' ? 'Create' : 'Update'} Agent`}
        </Button>
        {mode === 'edit' && (
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                if (initialData?.id) {
                  await deleteAgent(initialData.id);
                  toast.success('Agent deleted successfully');
                  router.push('/');
                }
              });
            }}
          >
            {isPending ? 'Deleting...' : 'Delete Agent'}
          </Button>
        )}
      </div>
    </form>
  );
} 