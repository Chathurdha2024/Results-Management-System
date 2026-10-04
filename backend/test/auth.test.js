import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { fastify } from '../src/server.js'

describe('Authentication API Endpoints', () => {
  // Wait for the fastify instance and its plugins to be fully loaded
  beforeAll(async () => {
    await fastify.ready()
  })

  // Close the server after all tests are done so it doesn't hang the test runner
  afterAll(async () => {
    await fastify.close()
  })

  describe('POST /api/auth/admin/login', () => {
    it('should return 400 Bad Request if missing credentials', async () => {
      const response = await request(fastify.server)
        .post('/api/auth/admin/login')
        .send({}) // Sending empty body
      
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Email and password are required')
    })
    
    it('should return 401 Unauthorized for invalid admin credentials', async () => {
      const response = await request(fastify.server)
        .post('/api/auth/admin/login')
        .send({ email: 'fake@admin.com', password: 'wrongpassword' })
        
      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error', 'Invalid email or password')
    })
  })

  describe('POST /api/auth/student/login', () => {
    it('should return 400 Bad Request if regNo or password is missing', async () => {
      const response = await request(fastify.server)
        .post('/api/auth/student/login')
        .send({ regNo: 'EG/2020/001' }) // Missing password
        
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Registration number and password are required')
    })
  })

  describe('POST /api/auth/examiner/login', () => {
    it('should return 400 Bad Request if email or password is missing', async () => {
      const response = await request(fastify.server)
        .post('/api/auth/examiner/login')
        .send({ email: 'examiner@ruh.ac.lk' }) // Missing password
        
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Email and password are required')
    })
  })

  describe('POST /api/auth/examiner/register', () => {
    it('should return 400 Bad Request if email or password is missing', async () => {
      const response = await request(fastify.server)
        .post('/api/auth/examiner/register')
        .send({ email: 'examiner@ruh.ac.lk' }) // Missing password
        
      expect(response.status).toBe(400)
      expect(response.body).toHaveProperty('error', 'Email and password are required')
    })
  })

  describe('POST /api/auth/student/change-password', () => {
    it('should return 401 Unauthorized if token is not provided', async () => {
      const response = await request(fastify.server)
        .post('/api/auth/student/change-password')
        .send({ newPassword: 'newpassword123' })
        
      expect(response.status).toBe(401)
      expect(response.body).toHaveProperty('error', 'Unauthorized')
    })
  })
})
