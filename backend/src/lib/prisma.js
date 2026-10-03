import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';
import dotenv from 'dotenv';

dotenv.config();

// Enable WebSocket for Neon connection
neonConfig.webSocketConstructor = ws;

// Configure connection pool for high concurrency
const connectionString = `${process.env.DATABASE_URL}`;

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

// Use the adapter with PrismaClient and disable query logging for performance
const prisma = new PrismaClient({ adapter });

export default prisma;
