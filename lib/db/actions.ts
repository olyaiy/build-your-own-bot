'use server';

import { doesAgentHaveSearchTool } from './queries';

export async function checkAgentHasSearchTool(agentId: string): Promise<boolean> {
  return doesAgentHaveSearchTool(agentId);
} 