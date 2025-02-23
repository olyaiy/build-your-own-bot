
import { getAgents } from "@/lib/db/queries";
import { AgentList } from "@/components/agent-list";
import { ChatHeader } from "@/components/chat-header";
import { MainHeader } from "@/components/main-header";

export default async function Page() {
    const agents = await getAgents();

    

    return (
        <>
            <MainHeader/>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6">AI Agents</h1>
                <AgentList agents={agents} />
            </div>
        </>
    );
}