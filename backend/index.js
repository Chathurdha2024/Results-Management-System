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

const programSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  level: String,
  semesters: Number,
  status: { type: String, default: 'Active' }
}, { timestamps: true });

const Program = mongoose.model('Program', programSchema);

const moduleSchema = new mongoose.Schema({
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  code: { type: String, required: true },
  title: { type: String, required: true },
  semester: { type: Number, required: true },
  batch: { type: String, required: true }, // e.g., "2022/2023"
  credits: { type: Number, default: 3 }
}, { timestamps: true });

const Module = mongoose.model('Module', moduleSchema);

// --- NEW EXAM SCHEMA ---
const examSchema = new mongoose.Schema({
  programId: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  batch: { type: String, required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  session: { type: String, enum: ['Morning', 'Evening'], required: true },
  venue: { type: String, required: true },
  startTime: String,
  endTime: String
}, { timestamps: true });

const Exam = mongoose.model('Exam', examSchema);

// --- EXAM ROUTES (Add inside buildServer) ---



// Get all exams with populated details
fastify.get('/api/exams', async () => {
  return await Exam.find({})
    .populate('programId', 'name code')
    .populate('moduleId', 'title code')
    .sort({ date: 1, startTime: 1 });
});

// Schedule Exam with Validation
fastify.post('/api/exams', async (request, reply) => {
  const { programId, moduleId, batch, date, session, venue } = request.body;

  // 1. Check if this module already has an exam scheduled
  const existingModuleExam = await Exam.findOne({ moduleId });
  if (existingModuleExam) {
    return reply.code(400).send({ message: "An exam for this module is already scheduled." });
  }

  // 2. Check if the venue is already occupied for this date and session
  const venueClash = await Exam.findOne({ date, session, venue });
  if (venueClash) {
    return reply.code(400).send({ 
      message: `Venue ${venue} is already booked for ${session} session on ${date}.` 
    });
  }

  // Set times based on session
  const startTime = session === 'Morning' ? '09:00' : '13:00';
  const endTime = session === 'Morning' ? '12:00' : '16:00';

  try {
    const newExam = await Exam.create({
      ...request.body,
      startTime,
      endTime
    });
    return newExam;
  } catch (err) {
    return reply.code(500).send({ message: "Server error during scheduling." });
  }
  
});

// Delete Exam
fastify.delete('/api/exams/:id', async (request) => {
  await Exam.findByIdAndDelete(request.params.id);
  return { success: true };
});


// --- 1. Programs ---
fastify.get('/api/programs', async () => await Program.find({}));

fastify.post('/api/programs', async (request, reply) => {
  try {
    const program = await Program.create(request.body);
    return program;
  } catch (err) {
    return reply.code(400).send({ message: "Duplicate Program Code or Invalid Data" });
  }
});

// Update Program
fastify.put('/api/programs/:id', async (request) => {
  return await Program.findByIdAndUpdate(request.params.id, request.body, { new: true });
});

// Delete Program & its associated modules
fastify.delete('/api/programs/:id', async (request) => {
  await Program.findByIdAndDelete(request.params.id);
  await Module.deleteMany({ programId: request.params.id }); // Clean up modules
  return { success: true };
});

// --- 2. Modules ---
fastify.get('/api/programs/:id/modules', async (request) => {
  return await Module.find({ programId: request.params.id }).sort({ semester: 1 });
});

fastify.post('/api/modules', async (request, reply) => {
  try {
    const moduleData = await Module.create(request.body);
    return moduleData;
  } catch (err) {
    return reply.code(400).send({ message: "Failed to create module" });
  }
});

// Update Module
fastify.put('/api/modules/:id', async (request) => {
  return await Module.findByIdAndUpdate(request.params.id, request.body, { new: true });
});

// Delete Module
fastify.delete('/api/modules/:id', async (request) => {
  await Module.findByIdAndDelete(request.params.id);
  return { success: true };
});

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