import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

config({
  path: '.env.local',
});

// Check if we're in a Vercel environment
const isVercel = process.env.VERCEL === '1';
// For local development, we want migrations to fail if there's an issue
const shouldIgnoreErrors = isVercel || process.env.NODE_ENV === 'production';

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  try {
    const start = Date.now();
    
    // Run the migration
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    
    const end = Date.now();
    console.log(`✅ Migration completed in ${end - start}ms`);
  } catch (err: any) {
    // Known errors we want to handle gracefully
    const knownErrors = [
      // Column already exists
      { code: '42701', message: 'column "agentId" of relation "Chat" already exists' },
      // Referenced column doesn't exist
      { code: '42703', message: 'column "model" referenced in foreign key constraint does not exist' },
      // Constraint doesn't exist
      { code: '0A000', message: 'constraint "agents_model_models_id_fk" of relation "agents" does not exist' }
    ];

    // Check if the error matches any known error
    const knownError = knownErrors.find(
      (error) => 
        (error.code === err.code || error.message === err.message) || 
        (typeof err.message === 'string' && err.message.includes(error.message))
    );

    if (knownError && shouldIgnoreErrors) {
      console.warn(`⚠️ Migration warning: ${err.message}`);
      console.warn('Continuing build process despite migration error');
      process.exit(0);
    }
    
    // Re-throw any other errors
    throw err;
  }

  process.exit(0);
};

runMigrate().catch((err) => {
  console.error('❌ Migration failed');
  console.error(err);
  process.exit(1);
});
