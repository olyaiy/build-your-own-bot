"use client";

import React, { useEffect, useTransition, useState } from "react";
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
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Loader2 } from "lucide-react";

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
    imageUrl?: string | null;
  };
}

export default function AgentForm({ mode, userId, models, initialData }: AgentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    accept: {
      'image/jpeg': [],
      'image/png': []
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        await handleImageUpload(acceptedFiles[0]);
      }
    },
    noClick: false,
    noKeyboard: false,
  });

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload image');
      }

      const data = await response.json();
      setImageUrl(data.url);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

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
          artifactsEnabled: formData.get("artifactsEnabled") === "on",
          imageUrl: imageUrl
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
        {/* Image Upload Area - Left Column */}
        <div className="w-1/4 aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
              <span className="mt-2 text-sm text-gray-500">Uploading...</span>
            </div>
          ) : imageUrl ? (
            <div className="relative h-full w-full group">
              <Image 
                src={imageUrl} 
                alt="Agent profile" 
                fill 
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 25vw"
                priority
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                <Button 
                  type="button" 
                  variant="secondary" 
                  className="z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={open}
                >
                  Change Image
                </Button>
              </div>
            </div>
          ) : (
            <div 
              {...getRootProps()} 
              className="h-full w-full flex flex-col items-center justify-center p-4 cursor-pointer"
            >
              <input {...getInputProps()} />
              <svg
                className="size-1/4 text-gray-400 mb-4"
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
              {isDragActive ? (
                <p className="text-sm text-center text-gray-500">Drop the image here</p>
              ) : (
                <>
                  <p className="text-sm text-center text-gray-500 mb-2">Drag and drop an image here or</p>
                  <Button type="button" variant="outline" size="sm">
                    Browse Files
                  </Button>
                </>
              )}
              <p className="text-xs text-gray-400 mt-2 text-center">
                PNG or JPG (max. 5MB)
              </p>
            </div>
          )}
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