import { customer, user, userCredits, userTransactions, transactionTypeEnum } from '@/lib/db/schema';
import { Customer } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import Stripe from 'stripe';
import { db } from '../db/queries';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia', // Specify the Stripe API version
});

/**
 * Creates a customer in Stripe or retrieves an existing one
 * @param userId - The ID of the user
 * @returns The customer object
 */
export async function createOrRetrieveCustomer(userId: string): Promise<Customer> {
  // Check if the customer already exists in our database
  const existingCustomers = await db.select().from(customer).where(eq(customer.id, userId));
  
  // If the customer exists, return it
  if (existingCustomers.length > 0) {
    return existingCustomers[0];
  }

  // If not, get the user's email from the user table
  const users = await db.select().from(user).where(eq(user.id, userId));
  
  if (users.length === 0 || !users[0].email) {
    throw new Error('User not found or missing email');
  }

  const userRecord = users[0];

  // Create a new customer in Stripe
  const stripeCustomer = await stripe.customers.create({
    email: userRecord.email,
    metadata: {
      userId: userId,
    },
  });

  // Insert the new customer into our database
  const newCustomer = await db
    .insert(customer)
    .values({
      id: userId,
      stripe_customer_id: stripeCustomer.id,
      email: userRecord.email,
    })
    .returning();

  return newCustomer[0];
}

/**
 * Adds credits to a user's account based on a Stripe customer ID
 * @param stripeCustomerId - The Stripe customer ID
 * @param creditsAmount - The number of credits to add
 * @returns boolean indicating success
 */
export async function addCreditsToUser(stripeCustomerId: string, creditsAmount: number): Promise<boolean> {
  try {
    // Find the user associated with the Stripe customer ID
    const customers = await db.select().from(customer).where(eq(customer.stripe_customer_id, stripeCustomerId));
    
    if (customers.length === 0) {
      throw new Error(`No customer found with Stripe ID: ${stripeCustomerId}`);
    }
    
    const userId = customers[0].id;
    
    // Use a transaction to ensure both operations succeed or fail together
    await db.transaction(async (tx) => {
      // Check if the user already has a credit record
      const existingCredits = await tx.select().from(userCredits).where(eq(userCredits.user_id, userId));
      
      if (existingCredits.length > 0) {
        // Update existing record
        await tx.update(userCredits)
          .set({
            credit_balance: sql`${userCredits.credit_balance} + ${creditsAmount}`,
            lifetime_credits: sql`${userCredits.lifetime_credits} + ${creditsAmount}`
          })
          .where(eq(userCredits.user_id, userId));
      } else {
        // Create new record
        await tx.insert(userCredits).values({
          user_id: userId,
          credit_balance: creditsAmount.toString(),
          lifetime_credits: creditsAmount.toString()
        });
      }
      
      // Add transaction record
      await tx.insert(userTransactions).values({
        userId,
        amount: creditsAmount.toString(),
        type: "purchase"
      });
    });
    
    return true;
  } catch (error) {
    console.error('Failed to add credits to user account:', error);
    return false;
  }
}
