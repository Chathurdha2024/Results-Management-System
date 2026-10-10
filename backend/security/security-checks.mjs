// Automated security checks against the RUNNING backend (http://localhost:3000).
// Run: node security/security-checks.mjs   (backend must be running)
// These complement the OWASP ZAP scan; they test things ZAP cannot know
// about this specific API (JWT role logic, SQL injection on real fields).

const BASE = 'http://localhost:3000'
const results = []

function record(id, name, pass, detail) {
  results.push({ id, name, pass, detail })
  console.log(`${pass ? 'PASS' : 'FAIL'}  ${id}: ${name}\n      ${detail}`)
}

async function checkSecurityHeaders() {
  const res = await fetch(`${BASE}/api/auth/student/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
  const h = res.headers
  const missing = []
  if (!h.get('content-security-policy')) missing.push('Content-Security-Policy')
  if (!h.get('x-content-type-options')) missing.push('X-Content-Type-Options')
  if (!h.get('x-frame-options')) missing.push('X-Frame-Options')
  if (!h.get('strict-transport-security')) missing.push('Strict-Transport-Security')
  record('SEC-01', 'Backend sends standard security headers',
    missing.length === 0,
    missing.length ? `Missing headers: ${missing.join(', ')}` : 'All present')
}

async function checkCorsWildcard() {
  const res = await fetch(`${BASE}/api/auth/student/login`, { method: 'OPTIONS', headers: { Origin: 'http://evil.example.com', 'Access-Control-Request-Method': 'POST' } })
  const acao = res.headers.get('access-control-allow-origin')
  record('SEC-02', 'CORS does not allow arbitrary origins',
    acao !== '*' && acao !== 'http://evil.example.com',
    `Access-Control-Allow-Origin for http://evil.example.com = ${acao}`)
}

async function checkSqlInjectionLogin() {
  const payloads = [
    { regNo: "' OR '1'='1' --", password: 'anything' },
    { regNo: "admin'; DROP TABLE Student; --", password: 'x' },
    { regNo: 'EG/2020/123', password: "' OR '1'='1" },
  ]
  const outcomes = []
  for (const body of payloads) {
    const res = await fetch(`${BASE}/api/auth/student/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    outcomes.push(res.status)
  }
  // Prisma uses parameterized queries, so injection should never succeed:
  // every attempt must be rejected with 401 (never 200, never 500).
  record('SEC-03', 'SQL injection payloads on login are rejected',
    outcomes.every(s => s === 401),
    `Status codes for 3 injection payloads: ${outcomes.join(', ')} (expected all 401)`)
}

async function checkNoTokenAccess() {
  const endpoints = ['/api/student/dashboard', '/api/admin/batches', '/api/examiner/schedules']
  const outcomes = []
  for (const ep of endpoints) {
    const res = await fetch(`${BASE}${ep}`)
    outcomes.push(`${ep}=${res.status}`)
  }
  record('SEC-04', 'Protected endpoints reject requests without a token',
    outcomes.every(o => o.endsWith('=401')),
    outcomes.join('  '))
}

async function checkAlgNoneJwt() {
  // A classic JWT attack: forge a token with algorithm "none"
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
  const forged = `${b64({ alg: 'none', typ: 'JWT' })}.${b64({ id: 1, role: 'ADMIN' })}.`
  const res = await fetch(`${BASE}/api/admin/batches`, { headers: { Authorization: `Bearer ${forged}` } })
  record('SEC-05', 'Forged "alg:none" JWT is rejected',
    res.status === 401,
    `GET /api/admin/batches with alg:none token -> ${res.status} (expected 401)`)
}

async function checkGarbageToken() {
  const res = await fetch(`${BASE}/api/admin/batches`, { headers: { Authorization: 'Bearer not.a.jwt' } })
  record('SEC-06', 'Garbage token is rejected', res.status === 401, `-> ${res.status} (expected 401)`)
}

try {
  await checkSecurityHeaders()
  await checkCorsWildcard()
  await checkSqlInjectionLogin()
  await checkNoTokenAccess()
  await checkAlgNoneJwt()
  await checkGarbageToken()
} catch (e) {
  console.error('Could not reach the backend at', BASE, '-', e.message)
  process.exit(2)
}

const passed = results.filter(r => r.pass).length
console.log(`\nSECURITY SUMMARY: ${passed}/${results.length} checks passed`)
process.exit(0)
