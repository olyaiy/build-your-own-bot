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
    
    // Update the agent record to remove the image reference
    await updateAgentById({
      id,
      agentDisplayName: (await getAgentById(id))?.agent_display_name || '',
      systemPrompt: (await getAgentById(id))?.system_prompt || '',
      description: (await getAgentById(id))?.description || undefined,
      modelId: (await getAgentById(id))?.model || '',
      visibility: (await getAgentById(id))?.visibility || 'public',
      artifactsEnabled: (await getAgentById(id))?.artifacts_enabled || true,
      imageUrl: null,
    });
    
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete agent image:', error);
    throw new Error('Failed to delete agent image');
  }
}
