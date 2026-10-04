import prisma from '../lib/prisma.js';
import bcrypt from 'bcrypt';
export default async function authRoutes(fastify, options) {
  // POST /api/auth/admin/login
  fastify.post('/admin/login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
    }

    try {
      const admin = await prisma.admin.findUnique({ where: { email } });
      if (!admin) {
        return reply.code(401).send({ error: 'Invalid email or password' });
      }

      const match = await bcrypt.compare(password, admin.password);
      if (!match) {
        return reply.code(401).send({ error: 'Invalid email or password' });
      }

      // Issue JWT token
      const token = fastify.jwt.sign({ 
        id: admin.id, 
        email: admin.email,
        role: 'ADMIN'
      });

      return reply.send({ success: true, token, email: admin.email });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error during login' });
    }
  });

  // POST /api/auth/student/login
  fastify.post('/student/login', async (request, reply) => {
    const { regNo, password } = request.body;

    if (!regNo || !password) {
      return reply.code(400).send({ error: 'Registration number and password are required' });
    }

    try {
      const student = await prisma.student.findUnique({ where: { regNo } });
      if (!student) {
        return reply.code(401).send({ error: 'Invalid registration number or password' });
      }

      if (!student.password) {
        return reply.code(401).send({ error: 'No password set for this student. Contact administrator.' });
      }

      const match = await bcrypt.compare(password, student.password);
      if (!match) {
        return reply.code(401).send({ error: 'Invalid registration number or password' });
      }

      // Issue JWT token
      const token = fastify.jwt.sign({ 
        id: student.regNo, 
        regNo: student.regNo,
        batchId: student.batchId,
        department: student.departmentId,
        role: 'STUDENT',
        isFirstLogin: student.isFirstLogin
      });

      return reply.send({ success: true, token, regNo: student.regNo, isFirstLogin: student.isFirstLogin });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error during login' });
    }
  });

  // POST /api/auth/examiner/login
  fastify.post('/examiner/login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
    }

    try {
      const examiner = await prisma.examiner.findUnique({ where: { email } });
      if (!examiner) {
        return reply.code(401).send({ error: 'Invalid email or password' });
      }

      if (!examiner.isRegistered || !examiner.password) {
        return reply.code(403).send({ error: 'Account not registered. Please sign up first.' });
      }

      const match = await bcrypt.compare(password, examiner.password);
      if (!match) {
        return reply.code(401).send({ error: 'Invalid email or password' });
      }

      // Issue JWT token
      const token = fastify.jwt.sign({ 
        id: examiner.email, 
        email: examiner.email,
        department: examiner.departmentId,
        role: 'EXAMINER'
      });

      return reply.send({ success: true, token, email: examiner.email });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error during login' });
    }
  });

  // POST /api/auth/examiner/register
  fastify.post('/examiner/register', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.code(400).send({ error: 'Email and password are required' });
    }

    try {
      const examiner = await prisma.examiner.findUnique({ where: { email } });
      if (!examiner) {
        return reply.code(404).send({ error: 'Examiner account not found. Contact administrator.' });
      }

      if (examiner.isRegistered) {
        return reply.code(400).send({ error: 'Account is already registered. Please log in.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.examiner.update({
        where: { email },
        data: { password: hashedPassword, isRegistered: true }
      });

      return reply.send({ success: true, message: 'Account registered successfully. You can now log in.' });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Internal server error during registration' });
    }
  });

  // POST /api/auth/student/change-password
  fastify.post('/student/change-password', async (request, reply) => {
    // Rely on JWT token verification hook
    try {
      await request.jwtVerify();
    } catch (err) {
      return reply.code(401).send({ error: 'Unauthorized' });
    }

    const { newPassword } = request.body;
    const { role, regNo } = request.user;

    if (role !== 'STUDENT' || !regNo) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    if (!newPassword || newPassword.length < 6) {
      return reply.code(400).send({ error: 'Password must be at least 6 characters long' });
    }

    try {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      const updatedStudent = await prisma.student.update({
        where: { regNo },
        data: { 
          password: hashedPassword,
          isFirstLogin: false 
        }
      });

      // Issue updated JWT token
      const token = fastify.jwt.sign({ 
        id: updatedStudent.regNo, 
        regNo: updatedStudent.regNo,
        batchId: updatedStudent.batchId,
        department: updatedStudent.departmentId,
        role: 'STUDENT',
        isFirstLogin: false
      });

      return reply.send({ success: true, token, regNo: updatedStudent.regNo, isFirstLogin: false });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update password' });
    }
  });
}
