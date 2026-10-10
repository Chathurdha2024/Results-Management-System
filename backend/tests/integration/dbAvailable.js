import prisma from '../../src/lib/prisma.js'

// Probe the database once at load time. Integration tests that need a live
// database are skipped when it is unreachable (e.g. CI supplies a dummy
// DATABASE_URL). Locally, against the real Neon database, this is true.
const DB_PROBE_TIMEOUT_MS = 5000

async function probe() {
  let timer
  try {
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('db probe timeout')), DB_PROBE_TIMEOUT_MS)
      }),
    ])
    return true
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

export const dbAvailable = await probe()
