import { customer, user } from '@/lib/db/schema';
import { Customer } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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
