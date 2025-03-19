'use server';

import { cookies } from 'next/headers';
import { InferSelectModel } from 'drizzle-orm';
import { agents, models } from '@/lib/db/schema';
import { fal } from '@fal-ai/client';
import { experimental_generateImage as generateImage } from 'ai';

// Configure Fal client with API key from environment variable
fal.config({
  credentials: process.env.FAL_API_KEY
});

// Function to sort agents based on recent usage cookie
export async function sortAgentsByRecentUsage(
  agentsList: (Omit<InferSelectModel<typeof agents>, 'model'> & {
    models?: InferSelectModel<typeof models>[] | null;
    toolGroups?: { id: string; name: string; display_name: string; description: string | null }[] | null;
  })[]
) {
  const cookieStore = await cookies();
  const recentAgentsCookie = cookieStore.get('recent-agents');
  
  if (!recentAgentsCookie) {
    return agentsList;
  }
  
  // Parse the cookie value to get the array of agent IDs
  const recentAgentIds = recentAgentsCookie.value.split(',');
  
  // Create a map for quick lookup of agent positions
  const recentAgentPositions = new Map<string, number>();
  recentAgentIds.forEach((id: string, index: number) => {
    recentAgentPositions.set(id, index);
  });
  
  // Sort agents based on their position in the recent agents list
  const sortedAgents = [...agentsList].sort((a, b) => {
    const posA = recentAgentPositions.has(a.id) ? recentAgentPositions.get(a.id)! : Number.MAX_SAFE_INTEGER;
    const posB = recentAgentPositions.has(b.id) ? recentAgentPositions.get(b.id)! : Number.MAX_SAFE_INTEGER;
    return posA - posB;
  });
  
  return sortedAgents;
}

// Define types for Fal API parameters
type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "16:10" | "10:16" | "3:2" | "2:3" | "1:3" | "3:1";
type Style = "auto" | "general" | "realistic" | "design" | "render_3D" | "anime";

// Updated to accept all parameters from the UI with proper typing
export async function generateImageWithFal(
  prompt: string, 
  aspectRatio: AspectRatio = "1:1", 
  style: Style = "auto", 
  expandPrompt = true
) {
  try {
    // Using Fal's API directly with the passed parameters
    const result = await fal.subscribe("fal-ai/ideogram/v2/turbo", {
      input: {
        prompt,
        aspect_ratio: aspectRatio,
        expand_prompt: expandPrompt,
        style: style
      },
      logs: true,
    });
    
    // Return the raw result
    return { 
      success: true, 
      response: result
    };
  } catch (error) {
    console.error('Error generating image:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    };
  }
} 