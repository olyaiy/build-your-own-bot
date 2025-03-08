"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { toast } from "sonner";
import { ModelSelector } from "../util/grouped-model-select";

export type ModelInfo = {
  id: string;
  displayName: string;
  modelType?: string | null;
  description?: string | null;
  provider?: string | null;
};

interface ModelSelectorSectionProps {
  models: ModelInfo[];
  primaryModelId: string;
  alternateModelIds: string[];
  onPrimaryModelChange: (modelId: string) => void;
  onAlternateModelsChange: (modelIds: string[]) => void;
}

export function ModelSelectorSection({
  models,
  primaryModelId,
  alternateModelIds,
  onPrimaryModelChange,
  onAlternateModelsChange,
}: ModelSelectorSectionProps) {
  const handlePrimaryModelChange = (value: string) => {
    onPrimaryModelChange(value);
    
    // If the selected primary model is in the alternate models list, remove it
    if (alternateModelIds.includes(value)) {
      onAlternateModelsChange(alternateModelIds.filter(id => id !== value));
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
    
    onAlternateModelsChange([...alternateModelIds, value]);
  };

  const handleRemoveAlternateModel = (id: string) => {
    onAlternateModelsChange(alternateModelIds.filter(modelId => modelId !== id));
  };
  
  const getModelById = (id: string): ModelInfo | undefined => {
    return models.find(model => model.id === id);
  };

  return (
    <div className="space-y-4 relative">
      <div className="relative">
        <Label htmlFor="primaryModel" className="text-lg font-semibold">Primary Model</Label>
        <ModelSelector
          id="primaryModel"
          models={models}
          value={primaryModelId}
          onValueChange={handlePrimaryModelChange}
          placeholder="Select a primary model"
          className="mt-2 text-start py-2 h-12 z-[9999] "
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
                  <X className="size-3" />
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
    </div>
  );
} 