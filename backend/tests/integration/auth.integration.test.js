import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { fastify } from '../../src/server.js'

// Integration tests for auth flows that touch the real database.
// All tests here are READ-ONLY: they use unknown accounts, so no data is
// created, updated, or deleted.

describe('Auth API - database integration', () => {
  beforeAll(async () => {
    await fastify.ready()
  })

  afterAll(async () => {
    await fastify.close()
  })

  describe('POST /api/auth/admin/login', () => {
    it('INT-01: returns 401 for an email that does not exist', async () => {
      const res = await request(fastify.server)
        .post('/api/auth/admin/login')
        .send({ email: 'does.not.exist@rms.test', password: 'whatever123' })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Invalid email or password')
    })
  })

  describe('POST /api/auth/student/login', () => {
    it('INT-02: returns 401 for a registration number that does not exist', async () => {
      const res = await request(fastify.server)
        .post('/api/auth/student/login')
        .send({ regNo: 'ZZ/9999/999', password: 'whatever123' })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Invalid registration number or password')
    })
  })

  describe('POST /api/auth/examiner/login', () => {
    it('INT-03: returns 401 for an examiner email that does not exist', async () => {
      const res = await request(fastify.server)
        .post('/api/auth/examiner/login')
        .send({ email: 'no.such.examiner@rms.test', password: 'whatever123' })

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Invalid email or password')
    })
  })

  describe('POST /api/auth/examiner/register', () => {
    it('INT-04: returns 404 when the examiner account does not exist', async () => {
      const res = await request(fastify.server)
        .post('/api/auth/examiner/register')
        .send({ email: 'no.such.examiner@rms.test', password: 'whatever123' })

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error', 'Examiner account not found. Contact administrator.')
    })
  })

  describe('POST /api/auth/student/change-password', () => {
    it('INT-05: returns 400 when the new password is shorter than 6 characters', async () => {
      const token = fastify.jwt.sign({
        id: 'ZZ/9999/999',
        regNo: 'ZZ/9999/999',
        role: 'STUDENT',
        isFirstLogin: true
      })

      const res = await request(fastify.server)
        .post('/api/auth/student/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword: 'abc' })

      expect(res.status).toBe(400)
      expect(res.body).toHaveProperty('error', 'Password must be at least 6 characters long')
    })

    it('INT-06: returns 404 when the student in the token does not exist', async () => {
      const token = fastify.jwt.sign({
        id: 'ZZ/9999/999',
        regNo: 'ZZ/9999/999',
        role: 'STUDENT',
        isFirstLogin: true
      })

      const res = await request(fastify.server)
        .post('/api/auth/student/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword: 'longenough123' })

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error', 'Student not found')
    })

    it('INT-07: returns 403 when an ADMIN token calls the student change-password route', async () => {
      const token = fastify.jwt.sign({
        id: 1,
        email: 'admin@rms.test',
        role: 'ADMIN'
      })

      const res = await request(fastify.server)
        .post('/api/auth/student/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ newPassword: 'longenough123' })

      expect(res.status).toBe(403)
      expect(res.body).toHaveProperty('error', 'Forbidden')
    })
  })
})
