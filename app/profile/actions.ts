'use server';


import { User, user, userCredits, UserCredits } from '@/lib/db/schema';
import { db } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

/**
 * Extended user type that includes credit information
 */
export type UserWithCredits = User & {
  credit_balance?: string | null;
  lifetime_credits?: string | null;
};

/**
 * Get a user by their ID with their credits
 */
export async function getUserById(id: string): Promise<UserWithCredits | null> {
  const users = await db.select().from(user).where(eq(user.id, id));
  
  if (users.length === 0) {
    return null;
  }
  
  // Get user credits
  const credits = await db.select()
    .from(userCredits)
    .where(eq(userCredits.user_id, id));
  
  // Combine user with credits
  return {
    ...users[0],
    credit_balance: credits.length > 0 ? credits[0].credit_balance?.toString() : null,
    lifetime_credits: credits.length > 0 ? credits[0].lifetime_credits?.toString() : null,
  };
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