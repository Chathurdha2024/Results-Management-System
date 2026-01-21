require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const cors = require('@fastify/cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// --- ENV ---
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/results_db';
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';
const ADMIN_JWT_EXP = process.env.ADMIN_JWT_EXP || '1d';
const STUDENT_JWT_EXP = process.env.STUDENT_JWT_EXP || '1d';
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// --- DATABASE CONNECTION ---
async function connectDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    fastify.log.info('Connected to MongoDB');
  } catch (err) {
    fastify.log.error({ err }, 'MongoDB connection failed');
    process.exit(1);
  }
}

// --- SCHEMAS ---

// Admin
const adminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
}, { timestamps: true });

const Admin = mongoose.model('Admin', adminSchema);

// Student
const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  register_no: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true },
  semester: { type: String, required: true },
  year: { type: String, required: true },
  password: { type: String, required: true },
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

// --- SEEDING ---
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ChangeMe123!';

async function ensureSeedData() {
  // Admin
  const adminExists = await Admin.findOne({ email: ADMIN_EMAIL });
  if (!adminExists) {
    await Admin.create({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
    fastify.log.warn(`Seed admin created: ${ADMIN_EMAIL}`);
  }

  // Student
  const testRegNo = 'EG/2022/4981';
  const studentExists = await Student.findOne({ register_no: testRegNo });

  if (!studentExists) {
    await Student.create({
      name: 'John Doe',
      register_no: testRegNo,
      email: 'john@eng.ruh.ac.lk',
      semester: '3rd Semester',
      year: '2nd Year',
      password: 'password123',
    });
    fastify.log.warn(`Seed student created: ${testRegNo} / password123`);
  }
}

// --- SERVER & ROUTES ---
async function buildServer() {

  //  FIXED CORS (5173 + 5174)
  const allowedOrigins =
    CORS_ORIGIN === '*' ? ['*'] : CORS_ORIGIN.split(',');

  await fastify.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); 

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
  });

  // Health check
  fastify.get('/api/health', async () => ({ status: 'ok' }));

  // --- ADMIN LOGIN ---
  fastify.post('/api/admin/login', async (request, reply) => {
    const { email, password } = request.body || {};

    if (!email || !password) {
      return reply.code(400).send({ message: 'Missing credentials.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin || admin.password !== password) {
      return reply.code(401).send({ message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { sub: admin._id, role: 'admin' },
      JWT_SECRET,
      { expiresIn: ADMIN_JWT_EXP }
    );

    return reply.send({ token, role: 'admin' });
  });

  // --- STUDENT LOGIN ---
  fastify.post('/api/student/login', async (request, reply) => {
    const { register_no, password } = request.body || {};

    if (!register_no || !password) {
      return reply
        .code(400)
        .send({ message: 'Registration Number and password are required.' });
    }

    const student = await Student.findOne({ register_no: register_no.trim() });

    if (!student || student.password !== password) {
      return reply
        .code(401)
        .send({ message: 'Invalid Registration Number or Password.' });
    }

    const token = jwt.sign(
      {
        sub: student._id,
        role: 'student',
        register_no: student.register_no,
        name: student.name,
      },
      JWT_SECRET,
      { expiresIn: STUDENT_JWT_EXP }
    );

    return reply.send({
      token,
      role: 'student',
      user: {
        name: student.name,
        register_no: student.register_no,
        email: student.email,
        semester: student.semester,
        year: student.year,
      },
    });
  });
}

// --- START SERVER ---
async function start() {
  await connectDatabase();
  await ensureSeedData();
  await buildServer();

  try {
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    fastify.log.info(`Server running on port ${PORT}`);
  } catch (err) {
    fastify.log.error({ err }, ' Server failed to start');
    process.exit(1);
  }
}

start();
