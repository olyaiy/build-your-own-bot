import { db } from "@/lib/db/queries";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import AgentView from "@/components/agent-view";
import { models, agents } from "@/lib/db/schema";
import { auth } from "@/app/(auth)/auth";

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
        <p>Sorry, you don't have access</p>
      </div>
    );
  }

  // Proceed with full data fetch if authorized
  const [agentData, rawModels] = await Promise.all([
    db.select().from(agents).where(eq(agents.id, agentId)),
    db.select({
      id: models.id,
      displayName: models.model_display_name,
      modelType: models.model_type,
      description: models.description
    }).from(models),
  ]);

  if (!agentData.length) {
    return notFound();
  }

  const agentViewData = {
    id: agentId,
    agentDisplayName: agentData[0].agent_display_name,
    systemPrompt: agentData[0].system_prompt,
    description: agentData[0].description ?? undefined,
    modelId: agentData[0].model || '',
    visibility: agentData[0].visibility || 'public',
    artifactsEnabled: agentData[0].artifacts_enabled,
  };

  const modelsList = rawModels.map(m => ({
    ...m,
    description: m.description ?? undefined
  }));

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">View Agent</h1>
      <AgentView 
        agentData={agentViewData}
        models={modelsList}
      />
    </div>
  );
} 