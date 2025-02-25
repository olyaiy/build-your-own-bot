'use client';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Model } from '@/lib/db/schema';

// Extend the Model type to include the isDefault flag
export type ModelWithDefault = Model & {
  isDefault: boolean | null;
};

interface ChatModelSelectorProps {
  isReadonly: boolean;
  availableModels: ModelWithDefault[];
  currentModel: string;
  onModelChange: (modelId: string) => void;
}

export function ChatModelSelector({
  isReadonly,
  availableModels,
  currentModel,
  onModelChange,
}: ChatModelSelectorProps) {
  if (isReadonly || availableModels.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
      {/* <Label htmlFor="model-selector" className="text-sm whitespace-nowrap">
        Model:
      </Label> */}
      <Select
        value={currentModel}
        onValueChange={onModelChange}
      >
        <SelectTrigger id="model-selector" className="h-8 w-full md:w-60">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent>
          {availableModels.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              <div className="flex items-center justify-between w-full">
                <span>{model.model_display_name}</span>
                {model.isDefault && <span className="text-xs text-muted-foreground ml-2">(Default)</span>}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 