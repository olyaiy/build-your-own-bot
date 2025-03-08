import { db } from '@/lib/db/queries';
import { user, userCredits } from '@/lib/db/schema';

/**
 * Migration to move credit data from user table to userCredits table
 * This should be run once after schema changes are applied
 */
export async function migrateCreditsData() {
  console.log('Starting credit data migration...');
  
  try {
    // Get all users with their old credit data
    // Note: This assumes the old user table still has credit_balance and lifetime_credits columns
    // during the migration period
    const users = await db.query.user.findMany();
    
    console.log(`Found ${users.length} users to migrate credit data for`);
    
    // For each user, create a record in the userCredits table
    for (const userRecord of users) {
      // Skip if user doesn't have an id
      if (!userRecord.id) continue;
      
      // Check if user already has a credit record
      const existingCredit = await db.query.userCredits.findFirst({
        where: (credits, { eq }) => eq(credits.user_id, userRecord.id)
      });
      
      if (!existingCredit) {
        // Create new credit record with data from user table
        // Using any here temporarily during migration as the old user table structure includes credits
        const oldUserData = userRecord as any;
        
        await db.insert(userCredits).values({
          user_id: userRecord.id,
          credit_balance: oldUserData.credit_balance || '0',
          lifetime_credits: oldUserData.lifetime_credits || '0'
        });
        
        console.log(`Migrated credits for user ${userRecord.id}`);
      } else {
        console.log(`User ${userRecord.id} already has credit data`);
      }
    }
    
    console.log('Credit data migration completed successfully');
  } catch (error) {
    console.error('Error during credit data migration:', error);
    throw error;
  }
} 