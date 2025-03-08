import React from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModelInfo } from '@/components/agent/agent-form';


// Group models by provider
export function groupModelsByProvider(models: ModelInfo[]): Array<{ provider: string; models: ModelInfo[] }> {
  // Create a map of providers to models
  const groupMap: Record<string, ModelInfo[]> = {};
  
  models.forEach(model => {
    // First try to use the provider field if it exists
    let provider = model.provider;
    
    // If provider field doesn't exist, fall back to the mapping approach
    if (!provider) {
      // Extract from model ID as fallback
      const id = model.id.toLowerCase();
      
      if (id.includes('gpt') || id === 'chat-model-small' || id === 'chat-model-large') {
        provider = 'OpenAI';
      } else if (id.includes('sonar')) {
        provider = 'Perplexity';
      } else if (id.includes('mistral') || id.includes('pixtral')) {
        provider = 'Mistral';
      } else if (id.includes('llama')) {
        provider = 'Groq';
      } else if (id.includes('deepseek')) {
        provider = 'DeepSeek';
      } else if (id.includes('claude')) {
        provider = 'Anthropic';
      } else if (id.includes('reasoning')) {
        provider = 'Reasoning Models';
      } else {
        provider = 'Other Models';
      }
    }
    
    if (!groupMap[provider]) {
      groupMap[provider] = [];
    }
    groupMap[provider].push(model);
  });
  
  // Sort models within each group by displayName
  Object.values(groupMap).forEach(modelGroup => {
    modelGroup.sort((a, b) => a.displayName.localeCompare(b.displayName));
  });
  
  const providerOrder: Record<string, number> = {
    'openai': 1,
    'anthropic': 2,
    'deepseek': 3,
    'mistral': 4,
    'groq': 5,
    'perplexity': 6,
    'reasoning models': 7,
    'other models': 8
  };
  
  // Convert the map to an array and sort by provider priority
  return Object.entries(groupMap)
    .map(([provider, models]) => ({ provider, models }))
    .sort((a, b) => (providerOrder[a.provider] || 999) - (providerOrder[b.provider] || 999));
}

interface ModelSelectorProps {
  models: ModelInfo[];
  value: string;
  onValueChange: (value: string) => void;
  id: string;
  placeholder: string;
  className?: string;
  required?: boolean;
}

export function ModelSelector({ 
  models, 
  value, 
  onValueChange, 
  id, 
  placeholder, 
  className = "",
  required = false
}: ModelSelectorProps) {
  // Group models by provider
  const groupedModels = groupModelsByProvider(models);
  
  return (
    <Select value={value} onValueChange={onValueChange} required={required}>
      <SelectTrigger id={id} className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-[450px]">
        {groupedModels.map((group) => (
          <SelectGroup key={group.provider}>
            <SelectLabel className="font-bold text-md text-primary p-0 m-0 py-1 pl-2">
            {group.provider.charAt(0).toUpperCase() + group.provider.slice(1)}
            </SelectLabel>

            {group.models.map((model) => (
              <SelectItem 
                key={model.id} 
                value={model.id} 
                className="pl-6"
              >
                <div className="flex flex-col   justify-between py-1">
                  <span className="font-medium">{model.displayName}</span>
                  {model.description && (
                    <span className=" text-xs text-muted-foreground">{model.description}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}