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
import { AlertCircle, Camera, ImageIcon, Loader2, Trash2 } from "lucide-react";
import { ToolGroupSelector, ToolGroupInfo } from "./tool-group-selector";
import { ModelSelectorSection, ModelInfo } from "./model-selector-section";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { InfoIcon } from "@/components/icons/info-icon";

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
    <form onSubmit={handleSubmit} className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-6 flex flex-row justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold">
              {mode === 'create' ? 'Create New Agent' : 'Edit Agent'}
            </CardTitle>
            <CardDescription>
              {mode === 'create' ? 'Configure your new AI agent' : 'Update your AI agent settings'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {mode === 'edit' && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
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
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Permanently delete this agent</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <Button 
              type="submit" 
              size="sm"
              className="px-6"
              disabled={isPending || !primaryModelId}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>{mode === 'create' ? 'Create' : 'Update'} Agent</>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
            {/* Image Upload Area with 4:3 aspect ratio - Enhanced */}
            <div className="col-span-1 md:col-span-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    Agent Image
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-[250px]">
                          <p>A visual representation of your agent. Good images help users recognize and connect with your agent.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  {imageUrl && (
                    <Badge variant="outline" className="text-xs font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900">
                      Image Added
                    </Badge>
                  )}
                </div>
                
                <div 
                  className={`relative overflow-hidden transition-all duration-300 
                  ${isDragActive ? 'ring-2 ring-primary ring-offset-2' : 'border border-gray-200 dark:border-gray-800 hover:border-primary/50'} 
                  rounded-lg w-full aspect-[4/3] shadow-sm`}
                >
                  {isUploading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/80 backdrop-blur-sm">
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      <span className="mt-2 text-sm text-gray-600 dark:text-gray-300">Uploading...</span>
                    </div>
                  ) : imageUrl ? (
                    <div className="group absolute inset-0 w-full h-full">
                      <Image 
                        src={imageUrl} 
                        alt="Agent profile" 
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        priority
                        quality={90}
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <div className="flex flex-col gap-2">
                          <Button 
                            type="button" 
                            variant="secondary"
                            size="sm"
                            className="shadow-lg"
                            onClick={open}
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Change
                          </Button>
                          
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="shadow-lg"
                            onClick={handleDeleteImage}
                            disabled={isDeletingImage}
                          >
                            {isDeletingImage ? 
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 
                              <Trash2 className="h-4 w-4 mr-2" />
                            }
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      {...getRootProps()} 
                      className="absolute inset-0 flex flex-col items-center justify-center p-4 cursor-pointer bg-gray-50 dark:bg-gray-900/50 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg transition-colors duration-200 hover:border-primary/50 hover:bg-gray-100/50 dark:hover:bg-gray-800/30"
                    >
                      <input {...getInputProps()} id="agent-image" />
                      <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                        <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      {isDragActive ? (
                        <p className="text-sm font-medium text-center text-primary">Drop to upload</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-center text-gray-700 dark:text-gray-300 mb-1">
                            Drag & drop or click to upload
                          </p>
                          <div className="flex items-center justify-center gap-1 mt-1 mb-2">
                            <Badge variant="secondary" className="text-xs font-normal">PNG</Badge>
                            <Badge variant="secondary" className="text-xs font-normal">JPG</Badge>
                            <Badge variant="secondary" className="text-xs font-normal">5MB max</Badge>
                          </div>
                          <p className="text-xs text-center text-gray-500 dark:text-gray-400 px-4 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
                            Recommended: 800×600px (4:3)
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <InfoIcon className="h-3.5 w-3.5" />
                  Images help users recognize and connect with your agent
                </p>
              </div>
            </div>

            {/* Right Column - Basic Information - Improved layout */}
            <div className="col-span-1 md:col-span-4 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="agentDisplayName" className="text-sm font-medium flex items-center gap-1.5">
                    Agent Name <span className="text-red-500">*</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[250px]">
                          <p>Choose a clear, descriptive name that reflects your agent's purpose or personality.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Input
                    id="agentDisplayName"
                    name="agentDisplayName"
                    type="text"
                    placeholder="Enter a name for your agent"
                    className="h-10"
                    required
                    defaultValue={initialData?.agentDisplayName}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="visibility" className="text-sm font-medium flex items-center gap-1.5">
                    Visibility
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[250px]">
                          <p>Public: Everyone can see and use your agent<br/>
                             Private: Only you can access it<br/>
                             Link: Anyone with the link can use it</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </Label>
                  <Select name="visibility" defaultValue={initialData?.visibility || "public"}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="link">Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium flex items-center gap-1.5">
                  Description
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px]">
                        <p>A brief explanation of what your agent does and how it can help users. This will be visible to users.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe what your agent does and how it can help users"
                  className="resize-none h-[120px]"
                  defaultValue={initialData?.description}
                />
                <div className="flex justify-end">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Recommended: 100-150 characters
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                <Switch 
                  id="artifactsEnabled" 
                  name="artifactsEnabled"
                  defaultChecked={initialData?.artifactsEnabled ?? true}
                />
                <div>
                  <Label htmlFor="artifactsEnabled" className="text-sm font-medium">
                    Enable Artifacts
                  </Label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Allow this agent to save and manage artifacts during conversations
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Models Section - Using the new component with improved header */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-semibold">AI Models</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px]">
                      <p>Select the AI models that will power your agent. The primary model will be used by default, with alternates available as fallbacks.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900">
                Required
              </Badge>
            </div>
            <ModelSelectorSection
              models={models}
              primaryModelId={primaryModelId}
              alternateModelIds={alternateModelIds}
              onPrimaryModelChange={setPrimaryModelId}
              onAlternateModelsChange={setAlternateModelIds}
            />
          </div>

          

          {/* Tool Groups Section - Improved header */}
          <div className="space-y-4">
           
            <ToolGroupSelector
              toolGroups={toolGroups}
              selectedToolGroupIds={selectedToolGroupIds}
              onChange={setSelectedToolGroupIds}
            />
          </div>

          <Separator className="my-8" />

          {/* System Prompt Section - Improved with better guidance */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-semibold">System Prompt</h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertCircle className="h-4 w-4 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[300px]">
                      <p>The system prompt defines how your agent behaves. Be specific about its role, knowledge, and preferred response style.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Badge variant="outline" className="text-xs bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900">
                Required
              </Badge>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Label htmlFor="systemPrompt" className="text-sm font-medium">
                  Instructions for your agent
                </Label>
              </div>
              <div className="relative">
                <Textarea
                  id="systemPrompt"
                  name="systemPrompt"
                  placeholder={mode === "create" 
                    ? "e.g. You are a friendly assistant! Keep your responses concise and helpful." 
                    : "Enter system prompt"}
                  className="min-h-[180px] font-mono text-sm leading-relaxed pr-4"
                  required
                  defaultValue={initialData?.systemPrompt}
                />
                <div className="absolute bottom-3 right-3">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer">
                          <AlertCircle className="h-4 w-4 text-gray-500" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[300px]">
                        <p className="font-medium mb-1">Tips for effective system prompts:</p>
                        <ul className="text-xs space-y-1 list-disc pl-4">
                          <li>Define the agent's role clearly (e.g., "You are a math tutor")</li>
                          <li>Specify tone and style (formal, casual, technical)</li>
                          <li>Set response length preferences (concise, detailed)</li>
                          <li>Include any domain-specific knowledge</li>
                          <li>Define how to handle uncertain questions</li>
                        </ul>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 p-2 rounded border border-gray-100 dark:border-gray-800">
                <span className="flex items-center gap-1">
                  <InfoIcon className="h-3.5 w-3.5" />
                  This prompt is invisible to users but guides how your agent responds
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button 
            type="button" 
            variant="outline"
            onClick={() => router.push('/')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isPending || !primaryModelId}
            className="min-w-[120px]"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creating...' : 'Updating...'}
              </>
            ) : (
              <>{mode === 'create' ? 'Create' : 'Update'} Agent</>
            )}
          </Button>
        </CardFooter>
      </Card>
      <input type="hidden" name="userId" value={userId || ''} />
    </form>
  );
} 