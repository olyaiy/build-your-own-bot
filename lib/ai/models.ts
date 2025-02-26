import { openai } from '@ai-sdk/openai';
import { fireworks } from '@ai-sdk/fireworks';
import {
  customProvider,
  extractReasoningMiddleware,
  wrapLanguageModel,
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
  },
  imageModels: {
    'small-model': openai.image('dall-e-2'),
    'large-model': openai.image('dall-e-3'),
  },
});

interface ChatModel {
  id: string;
  name: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT 4o mini',
    description: 'GPT-4o-mini model',
  },
  {
    id: 'gpt-4o',
    name: 'GPT 4o',
    description: 'GPT-4o model',
  },
  {
    id: 'sonar-pro',
    name: 'Sonar Pro',
    description: 'Perplexity Sonar Pro model',
  },
  {
    id: 'sonar',
    name: 'Sonar',
    description: 'Perplexity Sonar model',
  },
  {
    id: 'pixtral-large-latest',
    name: 'Pixtral Large (Latest)',
    description: 'Mistral Pixtral Large model',
  },
  {
    id: 'mistral-small-latest',
    name: 'Mistral Small (Latest)',
    description: 'Mistral Small model',
  },
  {
    id: 'mistral-large-latest',
    name: 'Mistral Large (Latest)',
    description: 'Mistral Large model',
  },
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B',
    description: 'Groq Llama 3.3 70B model',
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B',
    description: 'Groq Llama 3.1 8B model',
  },
  {
    id: 'deepseek-chat',
    name: 'Deepseek v3',
    description: 'Deepseek v3 Chat model',
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    description: 'Anthropic Claude 3.5 Sonnet',
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    description: 'Anthropic Claude 3.5 Haiku',
  },
  {
    id: 'deepseek-reasoner',
    name: 'DeepSeek R1',
    description: 'Deepseek R1 Reasoning Model',
  },
  
];
