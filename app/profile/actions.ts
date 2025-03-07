'use server';


import { User, user } from '@/lib/db/schema';
import { db } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Get a user by their ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const users = await db.select().from(user).where(eq(user.id, id));
  return users.length > 0 ? users[0] : null;
}

/**
 * Update a user's username
 */
export async function updateUsername(userId: string, newUsername: string): Promise<void> {
  await db.update(user)
    .set({ user_name: newUsername })
    .where(eq(user.id, userId));
  
  revalidatePath('/profile');
} 