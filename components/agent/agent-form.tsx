"use client";

import React, { useTransition, useState } from "react";
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
import { updateAgent, createAgent, deleteAgent, deleteAgentImage } from "@/app/(agents)/actions";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Loader2, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ModelSelector } from "../util/grouped-model-select";
import { ToolGroupSelector, ToolGroupInfo } from "./tool-group-selector";

export type ModelInfo = {
  id: string;
  displayName: string;
  modelType?: string | null;
  description?: string | null;
  provider?: string | null;
};

interface AgentFormProps {
  mode: "create" | "edit";
  userId?: string;
  models: ModelInfo[];
  toolGroups: ToolGroupInfo[];
  initialData?: {
    id: string;
    agentDisplayName: string;
    systemPrompt: string;
    description?: string;
    modelId: string;
    visibility: "public" | "private" | "link";
    artifactsEnabled: boolean | null;
    imageUrl?: string | null;
    alternateModelIds?: string[]; // Field for alternate models
    toolGroupIds?: string[]; // Field for tool groups
  };
}

export default function AgentForm({ mode, userId, models, toolGroups, initialData }: AgentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState<string | null>(initialData?.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingImage, setIsDeletingImage] = useState(false);
  const [primaryModelId, setPrimaryModelId] = useState<string>(initialData?.modelId || "");
  const [alternateModelIds, setAlternateModelIds] = useState<string[]>(initialData?.alternateModelIds || []);
  const [selectedToolGroupIds, setSelectedToolGroupIds] = useState<string[]>(initialData?.toolGroupIds || []);
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

  const handleDeleteImage = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent's onClick handler
    
    if (!initialData?.id || !imageUrl) return;
    
    if (confirm("Are you sure you want to delete this image? This action cannot be undone.")) {
      setIsDeletingImage(true);
      try {
        await deleteAgentImage(initialData.id, imageUrl);
        setImageUrl(null);
        toast.success("Image deleted successfully");
      } catch (error) {
        console.error('Delete image error:', error);
        toast.error('Failed to delete image. Please try again.');
      } finally {
        setIsDeletingImage(false);
      }
    }
  };

  const handlePrimaryModelChange = (value: string) => {
    setPrimaryModelId(value);
    
    // If the selected primary model is in the alternate models list, remove it
    if (alternateModelIds.includes(value)) {
      setAlternateModelIds(alternateModelIds.filter(id => id !== value));
    }
  };

  const handleAddAlternateModel = (value: string) => {
    // Don't add if it's already the primary model
    if (value === primaryModelId) {
      toast.error("This model is already set as the primary model");
      return;
    }
    
    // Don't add if it's already in the list
    if (alternateModelIds.includes(value)) {
      toast.error("This model is already added");
      return;
    }
    
    setAlternateModelIds([...alternateModelIds, value]);
  };

  const handleRemoveAlternateModel = (id: string) => {
    setAlternateModelIds(alternateModelIds.filter(modelId => modelId !== id));
  };
  
  const getModelById = (id: string): ModelInfo | undefined => {
    return models.find(model => model.id === id);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        // Basic agent data
        const baseData = {
          agentDisplayName: formData.get("agentDisplayName") as string,
          systemPrompt: formData.get("systemPrompt") as string,
          description: formData.get("description") as string || undefined,
          modelId: primaryModelId, // Use the primary model ID
          visibility: formData.get("visibility") as "public" | "private" | "link",
          creatorId: formData.get("userId") as string,
          artifactsEnabled: formData.get("artifactsEnabled") === "on",
          imageUrl: imageUrl,
          alternateModelIds: alternateModelIds, // Include alternate models
          toolGroupIds: selectedToolGroupIds, // Include tool groups
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
    <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6  z-[100] relative">
      
        
              {/* Action Buttons at Top Right */}
      <div className="flex justify-end gap-4">
        {mode === 'edit' && (
          <Button
            type="button"
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              if (confirm("Are you sure you want to delete this agent? This action cannot be undone.")) {
                startTransition(async () => {
                  try {
                    if (initialData?.id) {
                      if (imageUrl) {
                        try {
                          await deleteAgentImage(initialData.id, imageUrl);
                        } catch (error) {
                          toast.error('Failed to delete image, but proceeding with agent deletion');
                        }
                      }
                      await deleteAgent(initialData.id);
                      toast.success('Agent deleted successfully');
                      router.push('/');
                    }
                  } catch (error) {
                    toast.error('Failed to delete agent. Please try again.');
                  }
                });
              }
            }}
          >
            {isPending ? 'Deleting...' : 'Delete Agent'}
          </Button>
        )}
        <Button 
          type="submit" 
          disabled={isPending || !primaryModelId}
        >
          {isPending ? `${mode === 'create' ? 'Creating' : 'Updating'}...` : `${mode === 'create' ? 'Create' : 'Update'} Agent`}
        </Button>
      </div>
      <div className="flex flex-col md:flex-row gap-8">

        {/* Image Upload Area - Full width on mobile, 1/4 width on desktop */}
        <div className="w-full md:w-1/4 relative mb-6 md:mb-0">
          <div className="w-full h-0 pb-[75%] relative bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
            {isUploading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
                <span className="mt-2 text-sm text-gray-500">Uploading...</span>
              </div>
            ) : imageUrl ? (
              <div className="absolute inset-0">
                <div className="relative w-full h-full">
                  <Image 
                    src={imageUrl} 
                    alt="Agent profile" 
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                    <Button 
                      type="button" 
                      variant="secondary" 
                      className="z-10 opacity-0 hover:opacity-100 transition-opacity duration-200"
                      onClick={open}
                    >
                      Change Image
                    </Button>
                  </div>
                  
                  {/* Delete Image Button */}
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute bottom-2 right-2 z-10 opacity-70 sm:opacity-0 sm:hover:opacity-100 transition-opacity duration-200"
                    onClick={handleDeleteImage}
                    disabled={isDeletingImage}
                  >
                    {isDeletingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ) : (
              <div 
                {...getRootProps()} 
                className="absolute inset-0 flex flex-col items-center justify-center p-4 cursor-pointer"
              >
                <input {...getInputProps()} />
                <svg
                  className="size-16 sm:size-1/4 text-gray-400 mb-4"
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
        </div>

        {/* Right Column - All Form Fields */}
        <div className="w-full md:flex-1 space-y-6">
          <div>
            <Label htmlFor="agentDisplayName" className="text-lg font-semibold">
              Agent Name
            </Label>
            <Input
              id="agentDisplayName"
              name="agentDisplayName"
              type="text"
              placeholder="Enter agent display name"
              className="mt-2 text-xl h-12 sm:h-12  font-medium  mx-0 px-2"
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

          {/* Models Section */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="primaryModel" className="text-lg font-semibold">Primary Model</Label>
              <ModelSelector
                id="primaryModel"
                models={models}
                value={primaryModelId}
                onValueChange={handlePrimaryModelChange}
                placeholder="Select a primary model"
                className="mt-2 text-start py-2 h-12"
                required
              />
            </div>

            {/* Alternate Models Section */}
            <div>
              <Label className="text-lg font-semibold">Alternate Models</Label>
              <div className="flex flex-wrap gap-2 mt-2 mb-4">
                {alternateModelIds.map(modelId => {
                  const model = getModelById(modelId);
                  return model ? (
                    <Badge key={modelId} variant="secondary" className="py-1 px-2 flex items-center gap-1">
                      {model.displayName}
                      <button 
                        type="button" 
                        onClick={() => handleRemoveAlternateModel(modelId)}
                        className="ml-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ) : null;
                })}
                {alternateModelIds.length === 0 && (
                  <p className="text-sm text-muted-foreground">No alternate models selected</p>
                )}
              </div>
              
              <div className="flex gap-2">
                <ModelSelector
                  id="alternateModel"
                  models={models.filter(model => 
                    model.id !== primaryModelId && 
                    !alternateModelIds.includes(model.id)
                  )}
                  value=""
                  onValueChange={handleAddAlternateModel}
                  placeholder="Add alternate model"
                  className="w-full"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Add alternate models that this agent can use in addition to the primary model.
              </p>
            </div>

            {/* Tool Groups Section - Using the new component */}
            <ToolGroupSelector
              toolGroups={toolGroups}
              selectedToolGroupIds={selectedToolGroupIds}
              onChange={setSelectedToolGroupIds}
            />

            {/* Other Settings Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 gap-y-6 mt-4">
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

              <div className="flex items-start sm:items-end h-full">
                <div className="flex items-center gap-2 mt-4 sm:mt-0">
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
      
      
    </form>
  );
} 