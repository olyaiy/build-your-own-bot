import { Card } from "@/components/ui/card";
import { getAgents } from "@/lib/db/queries";
import Link from 'next/link';
import { AgentList } from "@/components/agent-list";

export default async function Page() {
    const agents = await getAgents();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">AI Agents</h1>
            <AgentList agents={agents} />
        </div>
    );
}