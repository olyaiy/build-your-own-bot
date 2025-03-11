import { getAgents } from "@/lib/db/queries";
import { AgentList } from "./agent-list";
import { sortAgentsByRecentUsage } from "@/app/actions";
import { auth } from "@/app/(auth)/auth";

interface AgentContainerProps {
  // Make userId optional since we'll fetch it if not provided
  userId?: string;
}

export async function AgentContainer({ userId }: AgentContainerProps) {
  // If userId is not provided, fetch it from the auth session
  // This allows the component to work both ways - either with a provided userId or by fetching it
  let finalUserId = userId;
  
  if (!finalUserId) {
    // Fetch auth data only if userId wasn't provided
    const session = await auth();
    finalUserId = session?.user?.id;
  }
  
  // Fetch agents and sort them
  const agents = await getAgents(finalUserId, true);
  const sortedAgents = await sortAgentsByRecentUsage(agents as any);
  
  return <AgentList agents={sortedAgents} userId={finalUserId} />;
} 