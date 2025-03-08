import { MainHeader } from "@/components/layout/main-header";
import { Suspense } from "react";
import { AgentListSkeleton } from "@/components/agent/agent-list-skeleton";
import { AgentContainer } from "@/components/agent/agent-container";

export default function Page() {
    // Remove the blocking auth call from here to allow immediate rendering
    return (
        <>
            <MainHeader/>
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-6">AI Agents</h1>
                <Suspense fallback={<AgentListSkeleton />}>
                    <AgentContainer />
                </Suspense>
            </div>
        </>
    );
}