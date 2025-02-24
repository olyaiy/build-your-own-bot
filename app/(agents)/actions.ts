'use server';

import { revalidatePath } from 'next/cache';
import { createAgent as createAgentQuery, deleteAgentQuery, getAgentById, updateAgentById } from '@/lib/db/queries';
import { agents } from '@/lib/db/schema';
import { type AgentVisibility } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateSlug } from '@/lib/utils';

export async function createAgent({
  agentDisplayName,
  systemPrompt,
  description,
  modelId,
  visibility,
  creatorId,
  artifactsEnabled,
  imageUrl
}: {
  agentDisplayName: string;
  systemPrompt: string;
  description?: string;
  modelId: string;
  visibility: "public" | "private" | "link";
  creatorId: string;
  artifactsEnabled?: boolean;
  imageUrl?: string | null;
}) {
  try {
    await createAgentQuery({
      agentDisplayName,
      systemPrompt,
      description,
      modelId,
      visibility,
      creatorId,
      artifactsEnabled,
      imageUrl
    });
    
    revalidatePath('/');
  } catch (error) {
    console.error('Failed to create agent:', error);
    throw new Error('Failed to create agent');
  }
}

export async function updateAgent({
  id,
  agentDisplayName,
  systemPrompt,
  description,
  modelId,
  visibility,
  artifactsEnabled,
  imageUrl
}: {
  id: string;
  agentDisplayName: string;
  systemPrompt: string;
  description?: string;
  modelId: string;
  visibility: "public" | "private" | "link";
  artifactsEnabled?: boolean;
  imageUrl?: string | null;
}) {
  try {
    const agent = await getAgentById(id);
    
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    // Call the updateAgentById function
    await updateAgentById({
      id,
      agentDisplayName,
      systemPrompt,
      description,
      modelId,
      visibility,
      artifactsEnabled,
      imageUrl
    });
    
    revalidatePath('/');
  } catch (error) {
    console.error('Failed to update agent:', error);
    throw new Error('Failed to update agent');
  }
}

export async function deleteAgent(id: string) {
  try {
    await deleteAgentQuery(id);
    revalidatePath('/');
  } catch (error) {
    console.error('Failed to delete agent:', error);
    throw new Error('Failed to delete agent');
  }
}
