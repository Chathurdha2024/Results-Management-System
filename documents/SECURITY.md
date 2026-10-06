# 🔐 Security Architecture: JWT Authentication

This document outlines how JSON Web Token (JWT) Authentication is implemented in the Ruhuna EngRMS Backend. 

As the Backend Engineer, implementing secure, stateless authentication is critical for protecting student and faculty data. We chose **JWT (JSON Web Tokens)** because it scales perfectly across our Web and Mobile frontends without needing server-side sessions.

## 1. How the Implementation Works

We utilized `@fastify/jwt` to handle token signing and verification securely inside our Fastify instance.

### Step 1: Token Generation (Login)
When a user (Admin, Examiner, or Student) attempts to log in at `/api/auth/...`, the backend performs the following:
1. Searches the PostgreSQL database (via Prisma) for the user's email/RegNo.
2. Uses `bcrypt` to securely compare the hashed password in the database against the provided password.
3. If successful, the server generates a JWT containing the user's unique ID and **Role**.
4. The token is signed using our private `JWT_SECRET` key.

### Step 2: Protecting Routes (The Security Guard)
Once the user has the token, they must send it in the `Authorization: Bearer <token>` header for all future requests. 

We implemented a global authentication hook in `server.js`:
```javascript
// Global JWT Verification Hook
fastify.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err) // Automatically returns 401 Unauthorized
  }
})
```

### Step 3: Enforcing Security on API Groups
We applied this hook to completely lock down the core API routes. No one can access the Admin, Student, or Examiner data without a valid token.

```javascript
// Auth routes are public (so users can actually log in)
fastify.register(authRoutes, { prefix: '/api/auth' })

// Admin routes are strictly locked behind the JWT hook
fastify.register(async (app) => {
  app.addHook('onRequest', app.authenticate)
  app.register(adminRoutes)
}, { prefix: '/api/admin' })

// Student routes are strictly locked behind the JWT hook
fastify.register(async (app) => {
  app.addHook('onRequest', app.authenticate)
  app.register(studentRoutes)
}, { prefix: '/api/student' })
```

## 2. Security Benefits of this Implementation
1. **Stateless:** The server does not need to store session cookies, saving database memory and allowing infinite scaling.
2. **Cross-Platform:** The exact same JWT token works perfectly for the React Web App and the React Native Mobile App.
3. **Tamper-Proof:** Because the token is cryptographically signed using a secure secret key, if a malicious user tries to change their Role from `Student` to `Admin` inside the token, the signature becomes invalid and our backend instantly rejects it with a `401 Unauthorized` error.
