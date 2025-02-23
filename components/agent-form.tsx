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
import { updateAgent, createAgent } from "@/app/(agents)/actions";
import { useRouter } from "next/navigation";

interface AgentFormProps {
  mode: "create" | "edit";
  userId?: string;
  models: {
    id: string;
    displayName: string;
  }[];
  initialData?: {
    id: string;
    agentDisplayName: string;
    systemPrompt: string;
    description?: string;
    modelId: string;
    visibility: "public" | "private" | "link";
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
          creatorId: formData.get("userId") as string
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
          defaultValue={initialData?.agentDisplayName}
        />
      </div>

      {/* Agent Slug (only in create mode) */}
      {mode === "create" && (
        <div className="flex flex-col">
          <Label htmlFor="agentSlug">Agent Slug</Label>
          <Input
            id="agentSlug"
            name="agentSlug"
            type="text"
            placeholder="Enter agent slug"
            className="mt-1"
          />
        </div>
      )}

      {/* System Prompt */}
      <div className="flex flex-col">
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          name="systemPrompt"
          placeholder="Enter system prompt"
          className="mt-1"
          required
          defaultValue={initialData?.systemPrompt}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Enter description (optional)"
          className="mt-1"
          defaultValue={initialData?.description}
        />
      </div>

      {/* Model */}
      <div className="flex flex-col">
        <Label htmlFor="model">Model</Label>
        <Select name="model" required defaultValue={initialData?.modelId}>
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
          defaultValue={initialData?.visibility || "public"}
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="link">Link</option>
        </select>
      </div>

      <input type="hidden" name="userId" value={userId || ''} />
      <Button type="submit" disabled={isPending}>
        {isPending ? `${mode === 'create' ? 'Creating' : 'Updating'}...` : `${mode === 'create' ? 'Create' : 'Update'} Agent`}
      </Button>
    </form>
  );
} 