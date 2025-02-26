import { openai } from '@ai-sdk/openai';
import {
  customProvider,
} from 'ai';
import { perplexity } from '@ai-sdk/perplexity';
import { mistral } from '@ai-sdk/mistral';
import { groq } from '@ai-sdk/groq';
import { deepseek } from '@ai-sdk/deepseek';
import { anthropic } from '@ai-sdk/anthropic';

export const DEFAULT_CHAT_MODEL: string = 'gpt-4o';

export const myProvider = customProvider({
  languageModels: {
    'title-model': groq('llama-3.1-8b-instant'),
    'artifact-model': openai('gpt-4o-mini'),
    'gpt-4o-mini': openai('gpt-4o-mini'),
    'gpt-4o': openai('gpt-4o'),
    'sonar-pro': perplexity('sonar-pro'),
    'sonar': perplexity('sonar'),
    'pixtral-large-latest': mistral('pixtral-large-latest'),
    'mistral-small-latest': mistral('mistral-small-latest'),
    'mistral-large-latest': mistral('mistral-large-latest'),
    'llama-3.3-70b-versatile': groq('llama-3.3-70b-versatile'),
    'llama-3.1-8b-instant': groq('llama-3.1-8b-instant'),
    'deepseek-chat': deepseek('deepseek-chat'),
    'deepseek-reasoner': deepseek('deepseek-reasoner'),
    'claude-3-5-sonnet-20241022': anthropic('claude-3-5-sonnet-20241022'),
    'claude-3-5-haiku-20241022': anthropic('claude-3-5-haiku-20241022'),
    'o1-mini': openai('o1-mini'), 
    'o1': openai('o1'),
  },
  imageModels: {
    'small-model': openai.image('dall-e-2'),
    'large-model': openai.image('dall-e-3'),
  },
});

export interface ChatModel {
  id: string;
  name: string;
  description: string;
  provider: string;
}


export const chatModels: Array<ChatModel> = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT 4o mini',
    description: 'GPT-4o-mini model',
    provider: 'OpenAI'
  },
  {
    id: 'gpt-4o',
    name: 'GPT 4o',
    description: 'GPT-4o model',
    provider: 'OpenAI'
  },
  {
    id: 'sonar-pro',
    name: 'Sonar Pro',
    description: 'Perplexity Sonar Pro model',
    provider: 'Perplexity'
  },
  {
    id: 'sonar',
    name: 'Sonar',
    description: 'Perplexity Sonar model',
    provider: 'Perplexity'
  },
  {
    id: 'pixtral-large-latest',
    name: 'Pixtral Large (Latest)',
    description: 'Mistral Pixtral Large model',
    provider: 'Mistral'
  },
  {
    id: 'mistral-small-latest',
    name: 'Mistral Small (Latest)',
    description: 'Mistral Small model',
    provider: 'Mistral'
  },
  {
    id: 'mistral-large-latest',
    name: 'Mistral Large (Latest)',
    description: 'Mistral Large model',
    provider: 'Mistral'
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    description: 'Groq Llama 3.3 70B model',
    provider: 'Groq'
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B',
    description: 'Groq Llama 3.1 8B model',
    provider: 'Groq'
  },
  {
    id: 'deepseek-chat',
    name: 'Deepseek v3',
    description: 'Deepseek v3 Chat model',
    provider: 'Deepseek'
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    description: 'Anthropic Claude 3.5 Sonnet',
    provider: 'Anthropic'
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    description: 'Anthropic Claude 3.5 Haiku',
    provider: 'Anthropic'
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek R1',
    description: 'Deepseek R1 Reasoning Model',
    provider: 'DeepSeek'
  },
  {
    id: 'o1-mini',
    name: 'OpenAI o1 Mini',
    description: 'Openai o1 Mini Reasoning Model',
    provider: 'Openai'
  },
  {
    id: 'o1',
    name: 'O1',
    description: 'OpenAI O1 reasoning model',
    provider: 'OpenAI'
  },
  
];


// Different reasoning models have different capabilities
export const REASONING_MODEL_IDS = [
  'deepseek-reasoner',
  'o3-mini',
  'o1',
  'o1-mini'
];

// Models that support tools
export const TOOLS_SUPPORTED_MODEL_IDS = [
  'o1',  // o1 supports tools according to the docs
  // Other non-reasoning models that support tools
];

// Models that support structured object generation
export const OBJECT_GENERATION_MODEL_IDS = [
  'o1',  // o1 supports object generation according to the docs
  // Other non-reasoning models that support object generation
];

export const isReasoningModel = (modelId: string): boolean => {
  return REASONING_MODEL_IDS.includes(modelId);
};

export const supportsTools = (modelId: string): boolean => {
  return !isReasoningModel(modelId) || TOOLS_SUPPORTED_MODEL_IDS.includes(modelId);
};

export const supportsObjectGeneration = (modelId: string): boolean => {
  return !isReasoningModel(modelId) || OBJECT_GENERATION_MODEL_IDS.includes(modelId);
};

export const supportsReasoningEffort = (modelId: string): boolean => {
  return ['o1', 'o1-mini', 'o3-mini'].includes(modelId);
};

