"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter
} from "@/components/ui/card";
import {
  Paintbrush,
  Plus,
  X,
  EditIcon,
  LayoutTemplate,
  Info,
  Eye,
  Trash2,
  MessageSquare,
  CheckCircle2
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface OverviewCustomization {
  title: string;
  content: string;
  showPoints: boolean;
  points: string[];
}

interface AgentCustomizationSectionProps {
  overviewCustomization: OverviewCustomization;
  setOverviewCustomization: (value: OverviewCustomization) => void;
}

export default function AgentCustomizationSection({
  overviewCustomization,
  setOverviewCustomization,
}: AgentCustomizationSectionProps) {
  const [activeTab, setActiveTab] = useState<string>("edit");
  const [newPoint, setNewPoint] = useState("");
  const [editingPointIndex, setEditingPointIndex] = useState<number | null>(null);
  const [editingPointValue, setEditingPointValue] = useState("");
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOverviewCustomization({
      ...overviewCustomization,
      title: e.target.value
    });
  };
  
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setOverviewCustomization({
      ...overviewCustomization,
      content: e.target.value
    });
  };
  
  const handleTogglePoints = (checked: boolean) => {
    setOverviewCustomization({
      ...overviewCustomization,
      showPoints: checked
    });
  };
  
  const handleAddPoint = () => {
    if (newPoint.trim() === "") return;
    
    setOverviewCustomization({
      ...overviewCustomization,
      points: [...overviewCustomization.points, newPoint.trim()]
    });
    
    setNewPoint("");
  };
  
  const handleRemovePoint = (index: number) => {
    const updatedPoints = [...overviewCustomization.points];
    updatedPoints.splice(index, 1);
    
    setOverviewCustomization({
      ...overviewCustomization,
      points: updatedPoints
    });
  };
  
  const startEditingPoint = (index: number) => {
    setEditingPointIndex(index);
    setEditingPointValue(overviewCustomization.points[index]);
  };
  
  const saveEditingPoint = () => {
    if (editingPointIndex === null) return;
    
    const updatedPoints = [...overviewCustomization.points];
    updatedPoints[editingPointIndex] = editingPointValue.trim();
    
    setOverviewCustomization({
      ...overviewCustomization,
      points: updatedPoints
    });
    
    setEditingPointIndex(null);
    setEditingPointValue("");
  };
  
  const cancelEditingPoint = () => {
    setEditingPointIndex(null);
    setEditingPointValue("");
  };

  return (
    <Card className="border border-muted-foreground/10 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <LayoutTemplate className="size-4 text-primary" />
          Welcome Message & Customization
        </CardTitle>
        <CardDescription>
          Customize how your agent welcomes users when they first interact
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="edit" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              <EditIcon className="size-4" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="size-4" />
              Preview
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="edit" className="space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Label className="text-sm font-medium">
                    Welcome Title
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-80">
                        <p>The title shown at the top of your agent's welcome message</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-xs text-muted-foreground">
                  {overviewCustomization.title.length}/60
                </span>
              </div>
              <Input
                id="welcome-title"
                placeholder="Welcome title"
                value={overviewCustomization.title}
                onChange={handleTitleChange}
                maxLength={60}
                className="w-full"
              />
            </div>
            
            {/* Content Textarea */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Label className="text-sm font-medium">
                    Welcome Message
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="size-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-80">
                        <p>The main content of your agent's welcome message</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className="text-xs text-muted-foreground">
                  {overviewCustomization.content.length}/300
                </span>
              </div>
              <Textarea
                id="welcome-content"
                placeholder="Welcome message content..."
                value={overviewCustomization.content}
                onChange={handleContentChange}
                maxLength={300}
                className="min-h-24 resize-y"
              />
            </div>
            
            {/* Feature Points */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1">
                    <Label className="text-sm font-medium">
                      Feature Points
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="size-3.5 text-muted-foreground cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-80">
                          <p>Highlight key features or capabilities of your agent</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Show bulleted points highlighting capabilities
                  </p>
                </div>
                <Switch
                  id="show-points"
                  checked={overviewCustomization.showPoints}
                  onCheckedChange={handleTogglePoints}
                />
              </div>
              
              {overviewCustomization.showPoints && (
                <div className="space-y-3 pt-1">
                  {/* Add new point */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a feature point..."
                      value={newPoint}
                      onChange={(e) => setNewPoint(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newPoint.trim() !== '') {
                          e.preventDefault();
                          handleAddPoint();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleAddPoint} 
                      disabled={newPoint.trim() === ""}
                      size="icon"
                      variant="secondary"
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                  
                  {/* Point list */}
                  <div className="space-y-2 pt-1">
                    {overviewCustomization.points.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        No feature points added yet
                      </p>
                    ) : (
                      overviewCustomization.points.map((point, index) => (
                        <div 
                          key={index} 
                          className={cn(
                            "flex gap-2 items-center p-2 rounded-md",
                            editingPointIndex === index 
                              ? "bg-muted" 
                              : "hover:bg-muted/50"
                          )}
                        >
                          {editingPointIndex === index ? (
                            <div className="flex-1 flex gap-2">
                              <Input
                                value={editingPointValue}
                                onChange={(e) => setEditingPointValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    saveEditingPoint();
                                  } else if (e.key === 'Escape') {
                                    e.preventDefault();
                                    cancelEditingPoint();
                                  }
                                }}
                                autoFocus
                                className="flex-1"
                              />
                              <div className="flex gap-1">
                                <Button 
                                  size="icon"
                                  variant="ghost"
                                  onClick={saveEditingPoint}
                                  className="size-8"
                                >
                                  <CheckCircle2 className="size-4 text-green-500" />
                                </Button>
                                <Button 
                                  size="icon"
                                  variant="ghost"
                                  onClick={cancelEditingPoint}
                                  className="size-8"
                                >
                                  <X className="size-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <span className="flex-1 text-sm">{point}</span>
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => startEditingPoint(index)}
                                  className="size-6 text-muted-foreground hover:text-foreground"
                                >
                                  <EditIcon className="size-3.5" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleRemovePoint(index)}
                                  className="size-6 text-muted-foreground hover:text-red-500"
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="min-h-96">
            <div className="rounded-lg border overflow-hidden bg-card shadow-sm">
              <div className="p-4 bg-muted/20 border-b">
                <p className="text-sm text-muted-foreground">Welcome message preview</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-4 mt-2">
                    <MessageSquare className="size-8 text-primary" />
                  </div>
                  
                  <div className="space-y-5 flex-1">
                    <div>
                      <h3 className="text-xl font-semibold mb-3">
                        {overviewCustomization.title || "Welcome to your AI assistant!"}
                      </h3>
                      <p className="text-muted-foreground">
                        {overviewCustomization.content || "I&apos;m here to help answer your questions and provide information. Feel free to ask me anything."}
                      </p>
                    </div>
                    
                    {overviewCustomization.showPoints && overviewCustomization.points.length > 0 && (
                      <div className="space-y-1">
                        <p className="font-medium">I can help with:</p>
                        <ul className="space-y-2 ml-1">
                          {overviewCustomization.points.map((point, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="size-4 text-primary mt-0.5" />
                              <span>{point || "I&apos;m here to help answer your questions"}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                variant="outline" 
                onClick={() => setActiveTab("edit")}
                className="gap-2"
              >
                <EditIcon className="size-4" />
                Edit Content
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 