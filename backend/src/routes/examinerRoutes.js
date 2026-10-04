import prisma from '../lib/prisma.js';
export async function examinerRoutes(fastify, options) {
  // GET /api/examiner/schedules
  fastify.get('/schedules', async (request, reply) => {
    const { role, id } = request.user;
    if (role !== 'EXAMINER' || !id) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    try {
      const schedules = await prisma.examSchedule.findMany({
        where: { examinerEmail: id },
        include: { module: true },
        orderBy: { date: 'asc' }
      });
      return schedules;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch schedules' });
    }
  });

  // GET /api/examiner/notifications
  fastify.get('/notifications', async (request, reply) => {
    const { role, id } = request.user;
    if (role !== 'EXAMINER' || !id) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    try {
      const notifications = await prisma.examinerNotification.findMany({
        where: { examinerEmail: id },
        orderBy: { createdAt: 'desc' }
      });
      return notifications;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch notifications' });
    }
  });

  // POST /api/examiner/notifications/read
  fastify.post('/notifications/read', async (request, reply) => {
    const { role, id } = request.user;
    if (role !== 'EXAMINER' || !id) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    try {
      await prisma.examinerNotification.updateMany({
        where: { examinerEmail: id, isRead: false },
        data: { isRead: true }
      });
      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to mark notifications as read' });
    }
  });

  // GET /api/examiner/profile
  fastify.get('/profile', async (request, reply) => {
    const { role, id } = request.user;
    if (role !== 'EXAMINER' || !id) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    try {
      const examiner = await prisma.examiner.findUnique({
        where: { email: id },
        include: { department: true }
      });
      if (!examiner) return reply.code(404).send({ error: 'Examiner not found' });
      
      // Don't send password
      const { password, ...safeExaminer } = examiner;
      return safeExaminer;
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to fetch profile' });
    }
  });

  // PUT /api/examiner/profile
  fastify.put('/profile', async (request, reply) => {
    const { role, id } = request.user;
    if (role !== 'EXAMINER' || !id) {
      return reply.code(403).send({ error: 'Forbidden' });
    }

    const { name, password } = request.body;
    try {
      const updateData = {};
      if (name) updateData.name = name;
      
      if (password) {
        // Need to import bcrypt in this file to hash it, wait!
        // Actually, let's use dynamic import or require since it's an ES module.
        const bcrypt = (await import('bcrypt')).default;
        updateData.password = await bcrypt.hash(password, 10);
      }

      await prisma.examiner.update({
        where: { email: id },
        data: updateData
      });

      return reply.send({ success: true });
    } catch (error) {
      fastify.log.error(error);
      return reply.code(500).send({ error: 'Failed to update profile' });
    }
  });
}
