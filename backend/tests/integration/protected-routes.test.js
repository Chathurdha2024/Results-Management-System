import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { fastify } from '../../src/server.js'
import { dbAvailable } from './dbAvailable.js'

// Integration tests for JWT protection and role-based access control.
// Tokens are signed with the app's own JWT signer after fastify.ready(),
// so no login data or real passwords are needed. Tests marked with
// runIf(dbAvailable) query the database and are skipped when no live database
// is reachable (CI). All tests are read-only.

describe('Protected routes - authentication and authorization', () => {
  beforeAll(async () => {
    await fastify.ready()
  })

  afterAll(async () => {
    await fastify.close()
  })

  const studentToken = () =>
    fastify.jwt.sign({
      id: 'ZZ/9999/999',
      regNo: 'ZZ/9999/999',
      batchId: 'B_TEST',
      department: 'COMPUTER',
      role: 'STUDENT',
      isFirstLogin: false
    })

  const adminToken = () =>
    fastify.jwt.sign({ id: 999999, email: 'admin@rms.test', role: 'ADMIN' })

  const examinerToken = () =>
    fastify.jwt.sign({ id: 'examiner@rms.test', email: 'examiner@rms.test', department: 'COMPUTER', role: 'EXAMINER' })

  describe('Requests without a token are rejected', () => {
    it('INT-08: GET /api/admin/batches without token -> 401', async () => {
      const res = await request(fastify.server).get('/api/admin/batches')
      expect(res.status).toBe(401)
    })

    it('INT-09: GET /api/student/dashboard without token -> 401', async () => {
      const res = await request(fastify.server).get('/api/student/dashboard')
      expect(res.status).toBe(401)
    })

    it('INT-10: GET /api/examiner/schedules without token -> 401', async () => {
      const res = await request(fastify.server).get('/api/examiner/schedules')
      expect(res.status).toBe(401)
    })

    it('INT-11: GET /api/student/dashboard with a fake/garbage token -> 401', async () => {
      const res = await request(fastify.server)
        .get('/api/student/dashboard')
        .set('Authorization', 'Bearer faketoken.abc.123')
      expect(res.status).toBe(401)
    })
  })

  describe('Role-based access control', () => {
    it.runIf(dbAvailable)('INT-12: STUDENT token on student dashboard passes auth (404 = route reached, student not in DB)', async () => {
      const res = await request(fastify.server)
        .get('/api/student/dashboard')
        .set('Authorization', `Bearer ${studentToken()}`)

      // The regNo ZZ/9999/999 does not exist, so the handler returns 404.
      // This proves the token was accepted and the role check passed.
      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error', 'Student not found')
    })

    it('INT-13: ADMIN token on student dashboard -> 403 Forbidden', async () => {
      const res = await request(fastify.server)
        .get('/api/student/dashboard')
        .set('Authorization', `Bearer ${adminToken()}`)

      expect(res.status).toBe(403)
      expect(res.body).toHaveProperty('error', 'Forbidden')
    })

    it.runIf(dbAvailable)('INT-14: EXAMINER token on examiner schedules -> 200 with a JSON array', async () => {
      const res = await request(fastify.server)
        .get('/api/examiner/schedules')
        .set('Authorization', `Bearer ${examinerToken()}`)

      expect(res.status).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
    })

    it('INT-15: EXAMINER token on student dashboard -> 403 Forbidden', async () => {
      const res = await request(fastify.server)
        .get('/api/student/dashboard')
        .set('Authorization', `Bearer ${examinerToken()}`)

      expect(res.status).toBe(403)
    })

    // SECURITY BUG TEST (expected to FAIL until the bug is fixed):
    // adminRoutes.js performs NO role check, so a STUDENT token can read
    // admin data. The correct behaviour is 403. If this test fails with
    // status 200, document it in your QA report as:
    // "Broken Access Control - admin endpoints do not verify ADMIN role".
    it('INT-16: STUDENT token on admin batches -> should be 403 (KNOWN BUG if it returns 200)', async () => {
      const res = await request(fastify.server)
        .get('/api/admin/batches')
        .set('Authorization', `Bearer ${studentToken()}`)

      expect(res.status).toBe(403)
    })
  })
})
