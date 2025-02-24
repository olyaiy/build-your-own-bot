import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

config({
  path: '.env.local',
});

const runMigrate = async () => {
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is not defined');
  }

  const connection = postgres(process.env.POSTGRES_URL, { max: 1 });
  const db = drizzle(connection);

  try {
    const start = Date.now();
    await migrate(db, { migrationsFolder: './lib/db/migrations' });
    const end = Date.now();
    console.log(`✅ Migration completed in ${end - start}ms`);
  } catch (err: any) {
    // Check if error is for column already exists (PostgreSQL error code 42701)
    if (err.code === '42701' && err.message.includes('column "agentId" of relation "Chat" already exists')) {
      console.warn('⚠️ Migration warning: agentId column already exists, continuing build process');
      // Exit with success to allow the build to continue
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
