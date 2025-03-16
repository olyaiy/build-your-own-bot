
import { MainHeader } from "@/components/layout/main-header";
import { Suspense } from "react";
import { AgentListSkeleton } from "@/components/agent/agent-list-skeleton";
import { AgentContainer } from "@/components/agent/agent-container";

export default function Page() {

    return (
        <>
            <div className="container mx-auto p-4">
                <Suspense fallback={<AgentListSkeleton />}>
                    <AgentContainer />
                </Suspense>
            </div>
        </>
    );
}