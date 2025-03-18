import { db } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { eq, and } from "drizzle-orm";

import { models, agents, agentTags, tags, agentToolGroups, toolGroups, AgentCustomization, agentModels } from "@/lib/db/schema";
import { auth } from "@/app/(auth)/auth";
import AgentView from "@/components/agent/agent-view";

export default async function ViewAgentPage({
  params: paramsPromise,
}: {
  params: Promise<{ "agent-id": string }>;
}) {
  const params = await paramsPromise;
  const agentId = params["agent-id"];
  const session = await auth();

  // First check agent existence and permissions
  const [accessCheck] = await db.select({
    creatorId: agents.creatorId,
    visibility: agents.visibility
  }).from(agents).where(eq(agents.id, agentId));

  if (!accessCheck) {
    return notFound();
  }

  if (accessCheck.visibility === 'private' && session?.user?.id !== accessCheck.creatorId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Sorry, you don&#39;t have access</p>
      </div>
    );
  }

  // Proceed with full data fetch if authorized
  const [agentData, rawModels, defaultModelData] = await Promise.all([
    db.select().from(agents).where(eq(agents.id, agentId)),
    db.select({
      id: models.id,
      displayName: models.model_display_name,
      modelType: models.model_type,
      description: models.description
    }).from(models),
    // Fetch the default model ID for this agent
    db.select({
      modelId: agentModels.modelId
    })
    .from(agentModels)
    .where(and(
      eq(agentModels.agentId, agentId),
      eq(agentModels.isDefault, true)
    ))
  ]);

  if (!agentData.length) {
    return notFound();
  }

  // Get the default model ID, or empty string if not found
  const defaultModelId = defaultModelData.length > 0 ? defaultModelData[0].modelId : '';

  // Fetch agent tags
  const agentTagsData = await db
    .select({
      id: tags.id,
      name: tags.name
    })
    .from(agentTags)
    .innerJoin(tags, eq(agentTags.tagId, tags.id))
    .where(eq(agentTags.agentId, agentId));

  // Fetch agent tool groups
  const agentToolGroupsData = await db
    .select({
      id: toolGroups.id,
      name: toolGroups.name,
      displayName: toolGroups.display_name,
      description: toolGroups.description
    })
    .from(agentToolGroups)
    .innerJoin(toolGroups, eq(agentToolGroups.toolGroupId, toolGroups.id))
    .where(eq(agentToolGroups.agentId, agentId));
    
  // Map tool groups to the correct format
  const formattedToolGroups = agentToolGroupsData.map(tool => ({
    id: tool.id,
    name: tool.name,
    displayName: tool.displayName,
    description: tool.description ?? undefined
  }));

  const agentViewData = {
    id: agentId,
    agentDisplayName: agentData[0].agent_display_name,
    systemPrompt: agentData[0].system_prompt,
    description: agentData[0].description ?? undefined,
    modelId: defaultModelId, // Use the actual model ID instead of agent slug
    visibility: agentData[0].visibility || 'public',
    artifactsEnabled: agentData[0].artifacts_enabled,
    imageUrl: agentData[0].image_url || undefined,
    customization: agentData[0].customization as AgentCustomization | undefined,
    createdAt: agentData[0].createdAt || undefined,
    updatedAt: agentData[0].updatedAt || undefined,
    tags: agentTagsData,
    toolGroups: formattedToolGroups,
  };

  const modelsList = rawModels.map(m => ({
    ...m,
    description: m.description ?? undefined
  }));

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">View Agent</h1>
      <AgentView
        agentData={agentViewData}
        models={modelsList}
      />
    </div>
  );
} 