import { Metadata } from "next";
import { auth } from "@/app/(auth)/auth";
import { getAgents, getMostCommonTags } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { MyAgentList } from "@/components/agent/my-agent-list";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { CreateAgentButton } from "@/components/agent/create-agent-button";


export const metadata: Metadata = {
  title: "My Agents",
  description: "Manage your AI agents",
};

export default async function MyAgentsPage() {
  const session = await auth();
  
  // If user is not logged in, redirect to login page
  if (!session?.user) {
    redirect("/login");
  }
  
  // Fetch only agents created by the current user including models, tools, tags, and earnings
  const userAgents = await getAgents(session.user.id, true, true, true);
  
  // Fetch most common tags to assist in filtering
  const commonTags = await getMostCommonTags(10);
  
  return (
    <div className="container py-6 space-y-6 px-4 mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Agents</h1>
          <p className="text-muted-foreground max-w-2xl">
            Manage all your custom agents in one place. View, edit, or create new AI assistants tailored to your specific needs.
          </p>
        </div>
      </div>
      
      <MyAgentList 
        agents={userAgents} 
        userId={session.user.id}
        tags={commonTags}
      />
    </div>
  );
}
