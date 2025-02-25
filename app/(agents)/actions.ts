'use server';

import { revalidatePath } from 'next/cache';
import { createAgent as createAgentQuery, deleteAgentQuery, getAgentById, updateAgentById } from '@/lib/db/queries';
import { agents, agentModels } from '@/lib/db/schema';
import { type AgentVisibility } from '@/lib/db/schema';
import { and, eq } from 'drizzle-orm';
import { generateSlug } from '@/lib/utils';
import { db } from '@/lib/db/queries';

export async function createAgent({
  agentDisplayName,
  systemPrompt,
  description,
  modelId,
  visibility,
  creatorId,
  artifactsEnabled,
  imageUrl,
  alternateModelIds = []
}: {
  agentDisplayName: string;
  systemPrompt: string;
  description?: string;
  modelId: string;
  visibility: "public" | "private" | "link";
  creatorId: string;
  artifactsEnabled?: boolean;
  imageUrl?: string | null;
  alternateModelIds?: string[];
}) {
  try {
    // Create agent with primary model
    const result = await createAgentQuery({
      agentDisplayName,
      systemPrompt,
      description,
      modelId,
      visibility,
      creatorId,
      artifactsEnabled,
      imageUrl
    });
    
    // If alternate models were provided, add them to the agent
    if (alternateModelIds.length > 0 && result?.id) {
      const alternateModelsData = alternateModelIds.map(alternateModelId => ({
        agentId: result.id,
        modelId: alternateModelId,
        isDefault: false
      }));
      
      await db.insert(agentModels).values(alternateModelsData);
    }
    
    revalidatePath('/');
    return result;
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
  imageUrl,
  alternateModelIds = []
}: {
  id: string;
  agentDisplayName: string;
  systemPrompt: string;
  description?: string;
  modelId: string;
  visibility: "public" | "private" | "link";
  artifactsEnabled?: boolean;
  imageUrl?: string | null;
  alternateModelIds?: string[];
}) {
  try {
    const agent = await getAgentById(id);
    
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    // Update the agent with primary model
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
    
    // Handle alternate models
    // First, get existing alternate models (non-default ones)
    const existingModels = await db.select({
      modelId: agentModels.modelId,
      isDefault: agentModels.isDefault
    })
    .from(agentModels)
    .where(eq(agentModels.agentId, id));
    
    const existingAlternateModelIds = existingModels
      .filter(m => !m.isDefault)
      .map(m => m.modelId);
    
    // Models to remove (they exist but aren't in the new list)
    const modelIdsToRemove = existingAlternateModelIds
      .filter(existingId => !alternateModelIds.includes(existingId));
    
    // Models to add (they're in the new list but don't exist yet)
    const modelIdsToAdd = alternateModelIds
      .filter(newId => !existingAlternateModelIds.includes(newId));
    
    // Remove models that are no longer needed
    if (modelIdsToRemove.length > 0) {
      await Promise.all(modelIdsToRemove.map(modelId => 
        db.delete(agentModels)
          .where(and(
            eq(agentModels.agentId, id), 
            eq(agentModels.modelId, modelId)
          ))
      ));
    }
    
    // Add new alternate models
    if (modelIdsToAdd.length > 0) {
      const newModelsData = modelIdsToAdd.map(modelId => ({
        agentId: id,
        modelId,
        isDefault: false
      }));
      
      await db.insert(agentModels).values(newModelsData);
    }
    
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

export async function deleteAgentImage(id: string, imageUrl: string) {
  try {
    console.log("DeleteAgentImage called with:", { id, imageUrl });
    
    // Extract the key (filename) from the imageUrl
    // Handle different URL formats more robustly
    let key;
    try {
      // Try to parse as a URL first
      const url = new URL(imageUrl);
      // Get the pathname without leading slash
      const pathname = url.pathname.startsWith('/') ? url.pathname.substring(1) : url.pathname;
      
      // If the path has multiple segments, we need the last part
      const pathParts = pathname.split('/');
      key = pathParts[pathParts.length - 1];
      
      console.log("URL parsing approach extracted key:", key);
    } catch (parseError) {
      // If URL parsing fails, fall back to string manipulation
      console.log("URL parsing failed, using string manipulation");
      key = imageUrl.includes('?') 
        ? imageUrl.substring(imageUrl.lastIndexOf('/') + 1, imageUrl.indexOf('?')) 
        : imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
      
      console.log("String manipulation extracted key:", key);
    }
    
    if (!key) {
      throw new Error('Failed to extract valid key from image URL');
    }
    
    console.log("Final extracted key:", key);
    
    // Skip the API route and directly delete from R2
    // This approach avoids authentication issues since we're already in a server action
    
    // Initialize the S3 client with Cloudflare R2 credentials
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '',
      },
    });
    
    console.log('Executing delete command with bucket:', process.env.CLOUDFLARE_R2_BUCKET_NAME);
    
    // Create and send the delete command
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || '',
      Key: key,
    });
    
    await s3Client.send(deleteCommand);
    console.log('R2 delete operation completed successfully');
    
    // Get agent details
    const agent = await getAgentById(id);
    if (!agent) {
      throw new Error('Agent not found');
    }
    
    // Get agent's default model
    const models = await db.select({
      modelId: agentModels.modelId,
      isDefault: agentModels.isDefault
    })
    .from(agentModels)
    .where(eq(agentModels.agentId, id));
    
    const defaultModelId = models.find((m: { modelId: string, isDefault: boolean | null }) => m.isDefault === true)?.modelId || '';
    
    // Update the agent record to remove the image reference
    await updateAgentById({
      id,
      agentDisplayName: agent.agent_display_name || '',
      systemPrompt: agent.system_prompt || '',
      description: agent.description || undefined,
      modelId: defaultModelId,
      visibility: agent.visibility || 'public',
      artifactsEnabled: agent.artifacts_enabled || true,
      imageUrl: null,
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete agent image:', error);
    throw new Error('Failed to delete agent image');
  }
}
