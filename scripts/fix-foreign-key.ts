import { config } from 'dotenv';
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Load environment variables from .env.local
config({
  path: '.env.local',
});

if (!process.env.POSTGRES_URL) {
  throw new Error('POSTGRES_URL is not defined');
}

// Create a new client
const client = postgres(process.env.POSTGRES_URL, { max: 1 });
const db = drizzle(client);

async function fixForeignKey() {
  
  try {
    await client.unsafe(`
      ALTER TABLE "user_transactions" DROP CONSTRAINT "user_transactions_message_id_Message_id_fk";
    `);
    
    await client.unsafe(`
      ALTER TABLE "user_transactions" ADD CONSTRAINT "user_transactions_message_id_Message_id_fk" 
      FOREIGN KEY ("message_id") REFERENCES "public"."Message"("id") 
      ON DELETE SET NULL ON UPDATE NO ACTION;
    `);
    
  } catch (error) {
    console.error("Error applying fix:", error);
  } finally {
    await client.end();
  }
}

fixForeignKey(); 