import AgentForm from "@/components/agent-form";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { models, agents } from "@/lib/db/schema";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";

export default async function EditAgentPage({
  params: paramsPromise,
}: {
  params: Promise<{ "agent-id": string }>;
}) {
  const session = await auth();
  const params = await paramsPromise;
  const agentId = params["agent-id"];

  const [agentData, modelsList] = await Promise.all([
    db.select().from(agents).where(eq(agents.id, agentId)),
    db.select({
      id: models.id,
      displayName: models.model_display_name
    }).from(models),
  ]);

  if (!agentData.length) {
    return notFound();
  }

  const initialData = {
    id: agentId,
    agentDisplayName: agentData[0].agent_display_name,
    systemPrompt: agentData[0].system_prompt,
    description: agentData[0].description ?? undefined,
    modelId: agentData[0].model || '',
    visibility: agentData[0].visibility || 'public',
    artifactsEnabled: agentData[0].artifacts_enabled,
    imageUrl: agentData[0].image_url ?? undefined,
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Edit Agent</h1>
      <AgentForm 
        mode="edit"
        userId={session?.user?.id}
        models={modelsList}
        initialData={initialData}
      />
    </div>
  );
}
