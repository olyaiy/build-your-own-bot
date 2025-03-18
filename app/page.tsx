import { MainFooter } from "@/components/layout/main-footer";
import { Suspense } from "react";
import { AgentListSkeleton } from "@/components/agent/agent-list-skeleton";
import { AgentContainer } from "@/components/agent/agent-container";
import { HowItWorksBanner } from "@/components/marketing/how-it-works-banner";

export default function Page() {

    return (
        <>
            <div className="container mx-auto p-4">
                <HowItWorksBanner />
                <Suspense fallback={<AgentListSkeleton />}>
                    <AgentContainer />
                </Suspense>
            </div>
            <MainFooter />
        </>
    );
}