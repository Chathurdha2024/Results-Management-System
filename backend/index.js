require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/results_db';
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const ADMIN_JWT_EXP = process.env.ADMIN_JWT_EXP || '1d';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
// Support multiple seed admins via env.
// Example:
//   ADMIN_ACCOUNTS=admin@example.com:Pass123,ops@example.com:Ops456
// Fallback to single ADMIN_EMAIL/ADMIN_PASSWORD if ADMIN_ACCOUNTS not provided.
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
const ADMIN_ACCOUNTS = process.env.ADMIN_ACCOUNTS || '';
const ADMIN_SEED_OVERWRITE = String(process.env.ADMIN_SEED_OVERWRITE || '').toLowerCase() === 'true';

// Admin schema
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // plain text
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

async function connectDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    fastify.log.info('Connected to MongoDB');
  } catch (err) {
    fastify.log.error({ err }, 'Failed to connect to MongoDB');
    process.exit(1);
  }
}

function parseAdminAccounts() {
  if (!ADMIN_ACCOUNTS.trim()) {
    return [{ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }];
  }

  return ADMIN_ACCOUNTS.split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [emailRaw, passwordRaw] = entry.split(':');
      const email = (emailRaw || '').toLowerCase().trim();
      const password = (passwordRaw || '').trim();
      if (!email || !password) {
        throw new Error(`Invalid ADMIN_ACCOUNTS entry: "${entry}" (expected email:password)`);
      }
      return { email, password };
    });
}

async function ensureSeedAdmins() {
  const seeds = parseAdminAccounts();
  for (const { email, password } of seeds) {
    const existing = await Admin.findOne({ email });
    if (existing) {
      if (ADMIN_SEED_OVERWRITE && existing.password !== password) {
        existing.password = password;
        await existing.save();
        fastify.log.warn(`Seed admin password updated for "${email}" (ADMIN_SEED_OVERWRITE=true).`);
      }
      continue;
    }

    await Admin.create({ email, password });
    fastify.log.warn(`Seed admin created with email "${email}". Update passwords in DB/ENV.`);
  }
}

async function buildServer() {
  await fastify.register(cors, {
    origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN,
    credentials: true,
  });

  fastify.get('/api/health', async () => ({ status: 'ok' }));

  fastify.post('/api/admin/login', async (request, reply) => {
    const { email, password } = request.body || {};

    if (!email || !password) {
      return reply.code(400).send({ message: 'Email and password are required.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin || password !== admin.password) {
      return reply.code(401).send({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { sub: admin._id.toString(), email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: ADMIN_JWT_EXP }
    );

    return reply.send({ token });
  });
}

async function start() {
  await connectDatabase();
  await ensureSeedAdmins();
  await buildServer();

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server listening on port ${PORT}`);
  } catch (err) {
    fastify.log.error({ err }, 'Failed to start server');
    process.exit(1);
  }
}

start();
