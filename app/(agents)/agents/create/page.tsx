import AgentForm from "@/components/agent-form";
import { auth } from "@/app/(auth)/auth";
import { db } from "@/lib/db/queries";
import { models } from "@/lib/db/schema";

export default async function CreateAgentPage() {
  const session = await auth();
  const modelsList = await db.select({
    id: models.id,
    displayName: models.model_display_name
  }).from(models);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Create New Agent</h1>
      <AgentForm 
        mode="create"
        userId={session?.user?.id}
        models={modelsList}
      />
    </div>
  );
} 