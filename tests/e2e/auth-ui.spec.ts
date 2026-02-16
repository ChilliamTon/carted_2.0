import { test, expect } from '@playwright/test'

test('toggles between sign-in and sign-up states', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()

  await page.getByRole('button', { name: 'Sign up for free' }).click()

  await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
  await expect(page.getByText('Must be at least 6 characters long')).toBeVisible()

  await page.getByRole('button', { name: 'Sign in' }).click()

  await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
})

test('shows current brand footer copy', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('© 2026 Wishlist Central')).toBeVisible()
})

test.describe('mobile auth layout', () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test('keeps primary auth controls visible without horizontal scrolling', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()

    const hasNoHorizontalOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
    expect(hasNoHorizontalOverflow).toBe(true)
  })
})
