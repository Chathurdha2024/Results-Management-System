import Fastify from 'fastify'
import cors from '@fastify/cors'
import multipart from '@fastify/multipart'
import jwt from '@fastify/jwt'
import fastifyMetrics from 'fastify-metrics'
import prisma from './lib/prisma.js'
import { adminRoutes } from './routes/adminRoutes.js'
import { studentRoutes } from './routes/studentRoutes.js'
import { examinerRoutes } from './routes/examinerRoutes.js'
import authRoutes from './routes/authRoutes.js'

const fastify = Fastify({
  logger: true
})
async function seedDepartments() {
  const depts = [
    { id: 'GENERAL', name: 'General / Interdisciplinary' },
    { id: 'COMPUTER', name: 'Computer Engineering' },
    { id: 'ELECTRICAL', name: 'Electrical Engineering' },
    { id: 'MECHANICAL', name: 'Mechanical Engineering' },
    { id: 'CIVIL', name: 'Civil Engineering' }
  ];
  for (const d of depts) {
    await prisma.department.upsert({
      where: { id: d.id },
      update: {},
      create: d
    });
  }
}

// Register plugins
fastify.register(fastifyMetrics.default || fastifyMetrics, { endpoint: '/metrics' })
fastify.register(cors, { 
  origin: '*'
})
fastify.register(multipart)
fastify.register(jwt, {
  secret: 'supersecret_ruhuna_key' // In production, use env var
})

// Add JWT verification hook
fastify.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
})

// Register routes
fastify.register(authRoutes, { prefix: '/api/auth' })
fastify.register(async (app) => {
  app.addHook('onRequest', app.authenticate)
  app.register(adminRoutes)
}, { prefix: '/api/admin' })
fastify.register(async (app) => {
  app.addHook('onRequest', app.authenticate)
  app.register(studentRoutes)
}, { prefix: '/api/student' })
fastify.register(async (app) => {
  app.addHook('onRequest', app.authenticate)
  app.register(examinerRoutes)
}, { prefix: '/api/examiner' })

const start = async () => {
  try {
    await seedDepartments()
    await fastify.listen({ port: 3000, host: '0.0.0.0' })
    console.log('Server is running on http://localhost:3000')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Export the fastify app for testing
export { fastify }

// Run the server only if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname || process.argv[1] === new URL(import.meta.url).pathname.replace(/^\//, '') || process.argv[1]?.includes('server.js')) {
  start()
}
