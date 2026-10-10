import { test, expect } from '@playwright/test'

// Real student credentials for the success test (E2E-05).
// Set them when running, e.g. in Git Bash:
//   E2E_STUDENT_REGNO=EG/2020/123 E2E_STUDENT_PASSWORD=yourpass npx playwright test
// Use a student that has ALREADY completed the first-login password change.
const REG_NO = process.env.E2E_STUDENT_REGNO
const PASSWORD = process.env.E2E_STUDENT_PASSWORD

test.describe('Student portal - end-to-end flows (real backend + database)', () => {
  test('E2E-01: login page loads with all fields', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Ruhuna EngRMS')).toBeVisible()
    await expect(page.getByText('Student Portal')).toBeVisible()
    await expect(page.getByPlaceholder('EG/XXXX/XXXX')).toBeVisible()
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible()
    await page.screenshot({ path: 'e2e/screenshots/E2E-01-login-page.png' })
  })

  test('E2E-02: password visibility toggle works', async ({ page }) => {
    await page.goto('/')
    const passwordInput = page.getByPlaceholder('••••••••')
    await expect(passwordInput).toHaveAttribute('type', 'password')

    await page.locator('button[type="button"]').first().click()
    await expect(passwordInput).toHaveAttribute('type', 'text')
    await page.screenshot({ path: 'e2e/screenshots/E2E-02-password-visible.png' })
  })

  test('E2E-03: login with unknown registration number shows the backend error', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('EG/XXXX/XXXX').fill('ZZ/9999/999')
    await page.getByPlaceholder('••••••••').fill('wrongpass1')
    await page.getByRole('button', { name: /sign in/i }).click()

    // This exact message comes from the real backend (401 response)
    await expect(page.getByText('Invalid registration number or password')).toBeVisible({ timeout: 20000 })
    await expect(page).toHaveURL('http://localhost:5174/')
    await page.screenshot({ path: 'e2e/screenshots/E2E-03-invalid-login-error.png' })
  })

  test('E2E-04: visiting /dashboard without a token redirects to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('http://localhost:5174/', { timeout: 15000 })
    await expect(page.getByText('Student Portal')).toBeVisible()
  })

  test('E2E-05: successful login lands on the dashboard with real data', async ({ page }) => {
    test.skip(!REG_NO || !PASSWORD, 'Set E2E_STUDENT_REGNO and E2E_STUDENT_PASSWORD env vars to run this test')

    await page.goto('/')
    await page.getByPlaceholder('EG/XXXX/XXXX').fill(REG_NO)
    await page.getByPlaceholder('••••••••').fill(PASSWORD)
    await page.getByRole('button', { name: /sign in/i }).click()

    // If this student's isFirstLogin is still true, they land on /change-password instead
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 30000 })

    const token = await page.evaluate(() => localStorage.getItem('studentToken'))
    expect(token).toBeTruthy()

    // Wait for real dashboard data to render, then capture full-page evidence
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: 'e2e/screenshots/E2E-05-dashboard.png', fullPage: true })
  })
})
