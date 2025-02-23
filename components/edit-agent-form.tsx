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
import { updateAgent } from "@/app/(agents)/actions";

interface EditAgentFormProps {
  userId?: string;
  models: {
    id: string;
    displayName: string;
  }[];
  initialData: {
    id: string;
    agentDisplayName: string;
    systemPrompt: string;
    description?: string;
    modelId: string;
    visibility: "public" | "private" | "link";
  };
}

export default function EditAgentForm({ userId, models, initialData }: EditAgentFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await updateAgent({
          id: initialData.id,
          agentDisplayName: formData.get("agentDisplayName") as string,
          systemPrompt: formData.get("systemPrompt") as string,
          description: formData.get("description") as string || undefined,
          modelId: formData.get("model") as string,
          visibility: formData.get("visibility") as "public" | "private" | "link",
          creatorId: formData.get("userId") as string
        });
        
        toast.success("Agent updated successfully");
      } catch (error) {
        toast.error("Failed to update agent. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Agent Display Name */}
      <div className="flex flex-col">
        <Label htmlFor="agentDisplayName">Agent Display Name</Label>
        <Input
          id="agentDisplayName"
          name="agentDisplayName"
          type="text"
          placeholder="Enter agent display name"
          className="mt-1"
          required
          defaultValue={initialData.agentDisplayName}
        />
      </div>

      {/* System Prompt */}
      <div className="flex flex-col">
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          name="systemPrompt"
          placeholder="Enter system prompt"
          className="mt-1"
          required
          defaultValue={initialData.systemPrompt}
        />
      </div>

      {/* Model */}
      <div className="flex flex-col">
        <Label htmlFor="model">Model</Label>
        <Select name="model" required defaultValue={initialData.modelId}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                {model.displayName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Visibility */}
      <div className="flex flex-col">
        <Label htmlFor="visibility">Visibility</Label>
        <select
          id="visibility"
          name="visibility"
          className="border rounded px-3 py-2 mt-1"
          defaultValue={initialData.visibility}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="link">Link</option>
        </select>
      </div>

      <input type="hidden" name="userId" value={userId || ''} />
      <Button type="submit" disabled={isPending}>
        {isPending ? "Updating..." : "Update Agent"}
      </Button>
    </form>
  );
} 