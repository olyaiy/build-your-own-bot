'use server';

import { db } from '@/lib/db/queries';
import { agents } from '@/lib/db/schema';
import { type AgentVisibility } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function createAgent({
  agentDisplayName,
  systemPrompt,
  description,
  modelId,
  visibility,
  creatorId,
}: {
  agentDisplayName: string;
  systemPrompt: string;
  description?: string;
  modelId: string;
  visibility: AgentVisibility;
  creatorId: string;
}) {
  try {
    const slug = agentDisplayName.toLowerCase().replace(/\s+/g, '-');
    
    return await db.insert(agents).values({
      agent: slug,
      agent_display_name: agentDisplayName,
      system_prompt: systemPrompt,
      description,
      model: modelId,
      visibility,
      creatorId,
    });
  } catch (error) {
    console.error('Error creating agent:', error);
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
  creatorId,
}: {
  id: string;
  agentDisplayName: string;
  systemPrompt: string;
  description?: string;
  modelId: string;
  visibility: AgentVisibility;
  creatorId: string;
}) {
  try {
    const slug = agentDisplayName.toLowerCase().replace(/\s+/g, '-');
    
    return await db.update(agents)
      .set({
        agent: slug,
        agent_display_name: agentDisplayName,
        system_prompt: systemPrompt,
        description,
        model: modelId,
        visibility,
        creatorId,
      })
      .where(eq(agents.id, id));
  } catch (error) {
    console.error('Error updating agent:', error);
    throw new Error('Failed to update agent');
  }
}
