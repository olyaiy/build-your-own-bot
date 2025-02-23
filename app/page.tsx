import { Card } from "@/components/ui/card";
import { getAgents } from "@/lib/db/queries";
import Link from 'next/link';

export default async function Page() {
    const agents = await getAgents();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">AI Agents</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => (
                    <Link 
                        key={agent.id} 
                        href={`/${agent.agent}`}
                    >
                        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                            <h3 className="text-xl font-semibold mb-2">{agent.agent_display_name}</h3>
                            <p className="text-muted-foreground mb-2 line-clamp-3">
                                {agent.description}
                            </p>
                            <div className="text-sm text-primary">
                                Visibility: {agent.visibility}
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}