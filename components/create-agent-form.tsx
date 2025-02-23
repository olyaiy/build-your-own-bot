"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateAgentForm() {
  return (
    <form className="space-y-6">
      {/* Agent Display Name */}
      <div className="flex flex-col">
        <Label htmlFor="agentDisplayName">Agent Display Name</Label>
        <Input
          id="agentDisplayName"
          type="text"
          placeholder="Enter agent display name"
          className="mt-1"
        />
      </div>

      {/* Agent Slug */}
      <div className="flex flex-col">
        <Label htmlFor="agentSlug">Agent Slug</Label>
        <Input
          id="agentSlug"
          type="text"
          placeholder="Enter agent slug"
          className="mt-1"
        />
      </div>

      {/* System Prompt */}
      <div className="flex flex-col">
        <Label htmlFor="systemPrompt">System Prompt</Label>
        <Textarea
          id="systemPrompt"
          placeholder="Enter system prompt"
          className="mt-1"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter description (optional)"
          className="mt-1"
        />
      </div>

      {/* Model */}
      <div className="flex flex-col">
        <Label htmlFor="model">Model</Label>
        <Input
          id="model"
          type="text"
          placeholder="Enter model id"
          className="mt-1"
        />
      </div>

      {/* Visibility */}
      <div className="flex flex-col">
        <Label htmlFor="visibility">Visibility</Label>
        <select
          id="visibility"
          className="border rounded px-3 py-2 mt-1"
          defaultValue="public"
        >
          <option value="public">Public</option>
          <option value="private">Private</option>
          <option value="link">Link</option>
        </select>
      </div>

      <Button type="submit">Create Agent</Button>
    </form>
  );
} 