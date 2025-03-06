'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/lib/db/schema";
import { updateUsername } from "./actions";
import { Label } from "@/components/ui/label";

interface EditUsernameProps {
  user: User;
}

export function EditUsername({ user }: EditUsernameProps) {
  const [username, setUsername] = useState(user.user_name || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setIsLoading(true);
    try {
      await updateUsername(user.id, username);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update username:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="flex items-center gap-2">
        <span>{user.user_name || "No username set"}</span>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsEditing(true)}
        >
          Edit
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="username">Username</Label>
        <div className="flex w-full gap-2">
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
            autoFocus
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save"}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              setUsername(user.user_name || "");
              setIsEditing(false);
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
} 