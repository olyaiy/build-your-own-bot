import { MainFooter } from "@/components/layout/main-footer";
import { Suspense } from "react";
import { AgentListSkeleton } from "@/components/agent/agent-list-skeleton";
import { HeroBanner } from "@/components/home/hero-banner";
import { AgentContainer } from "@/components/agent/agent-container";

export default function Page() {

    return (
        <>
            <div className="container mx-auto p-4">
                <HeroBanner />
                
                <div id="agent-list">
                    <Suspense fallback={<AgentListSkeleton />}>
                        <AgentContainer />
                    </Suspense>
                </div>
            </div>
            <MainFooter />
        </>
    );
}