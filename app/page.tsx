import { getAgents } from "@/lib/db/queries";
import { auth } from "@/app/(auth)/auth";
import { MainHeader } from "@/components/layout/main-header";
import { AgentList } from "@/components/agent/agent-list";
import { sortAgentsByRecentUsage } from "./actions";

export default async function Page() {
    const session = await auth();
    const agents = await getAgents(session?.user?.id, true);
    
    // Sort agents based on recent usage cookie
    const sortedAgents = await sortAgentsByRecentUsage(agents);

    return (
        <>
            <MainHeader/>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6">AI Agents</h1>
                <AgentList agents={sortedAgents} userId={session?.user?.id} />
            </div>
        </>
    );
}