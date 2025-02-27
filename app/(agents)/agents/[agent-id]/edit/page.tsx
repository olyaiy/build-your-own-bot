import AgentForm from "@/components/agent/agent-form";
import { auth } from "@/app/(auth)/auth";
import { db, getAgentWithAllModels, getAllToolGroups } from "@/lib/db/queries";
import { models, agents } from "@/lib/db/schema";
import { notFound } from "next/navigation";

export default async function EditAgentPage({
  params: paramsPromise,
}: {
  params: Promise<{ "agent-id": string }>;
}) {
  const session = await auth();
  const params = await paramsPromise;
  const agentId = params["agent-id"];

  const [agentWithModels, modelsList, toolGroups] = await Promise.all([
    getAgentWithAllModels(agentId),
    db.select({
      id: models.id,
      displayName: models.model_display_name,
      modelType: models.model_type,
      description: models.description,
      provider: models.provider
    }).from(models),
    getAllToolGroups(),
  ]);

  if (!agentWithModels) {
    return notFound();
  }

  const initialData = {
    id: agentId,
    agentDisplayName: agentWithModels.agent_display_name,
    systemPrompt: agentWithModels.system_prompt,
    description: agentWithModels.description ?? undefined,
    modelId: agentWithModels.modelId,
    alternateModelIds: agentWithModels.alternateModelIds,
    toolGroupIds: agentWithModels.toolGroupIds || [],
    visibility: agentWithModels.visibility || 'public',
    artifactsEnabled: agentWithModels.artifacts_enabled,
    imageUrl: agentWithModels.image_url ?? undefined,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Edit Agent</h1>
      <AgentForm 
        mode="edit"
        userId={session?.user?.id}
        models={modelsList}
        toolGroups={toolGroups}
        initialData={initialData}
      />
    </div>
  );
}
