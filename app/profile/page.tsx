import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserById } from "./actions";
import { UserAvatar } from "./avatar";
import { EditUsername } from "./edit-username";
import { auth } from "@/app/(auth)/auth";
import { AgentList } from "@/components/agent/agent-list";
import { getAgents } from "@/lib/db/queries";
import { MainHeader } from "@/components/layout/main-header";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your profile settings",
};

export default async function ProfilePage() {
  // Get the authenticated user
  const session = await auth();
  
  if (!session?.user?.id) {
    return notFound();
  }
  
  const userId = session.user.id;
  const user = await getUserById(userId);
  
  if (!user) {
    return notFound();
  }

  // Fetch user's agents
  const userAgents = await getAgents(userId);
  // Limit to just a preview (3 agents)
  const agentPreview = userAgents.slice(0, 3);

  return (
    <>
    <MainHeader />
    <div className="container max-w-5xl mx-auto py-12">
      <div className="grid gap-8">
        {/* Profile Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold">Profile</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 p-2">
              <UserAvatar user={user} className="h-16 w-16" />
              <div className="flex-1 space-y-2">
                <EditUsername user={user} />
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agents Preview Section */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-xl font-semibold">Your Agents</CardTitle>
              <CardDescription className="text-sm text-muted-foreground mt-1">
                Preview of your custom agents
              </CardDescription>
            </div>
            <Button size="sm" className="ml-auto">
              <Link href="/agents">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            {agentPreview.length > 0 ? (
              <AgentList agents={agentPreview} userId={userId} />
            ) : (
              <div className="text-center py-10 px-4 bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">You haven't created any agents yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  );
} 