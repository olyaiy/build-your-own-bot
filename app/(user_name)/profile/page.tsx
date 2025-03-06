import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserById } from "./actions";
import { UserAvatar } from "./avatar";
import { EditUsername } from "./edit-username";
import { auth } from "@/app/(auth)/auth";

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

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Manage your account details and personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <UserAvatar user={user} className="h-24 w-24" />
              
              <div className="space-y-4 flex-1">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-base">{user.email}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Username</h3>
                  <EditUsername user={user} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 