import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Integration tests call the real Neon database over the network,
    // so they need more than the default 5s timeout.
    testTimeout: 30000,
    hookTimeout: 30000
  }
})
