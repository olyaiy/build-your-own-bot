import { getAgents } from "@/lib/db/queries";
import { AgentList } from "@/components/agent-list";
import { MainHeader } from "@/components/main-header";
import { auth } from "@/app/(auth)/auth";

export default async function Page() {
    const session = await auth();
    const agents = await getAgents(session?.user?.id, true);


    return (
        <>
            <MainHeader/>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6">AI Agents</h1>
                <AgentList agents={agents} userId={session?.user?.id} />
            </div>
        </>
    );
}