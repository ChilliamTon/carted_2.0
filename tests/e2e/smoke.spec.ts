import { test, expect } from '@playwright/test'

test('loads the app shell', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/Wishlist Central/i)
  await expect(page.getByText('Welcome back')).toBeVisible()
  await expect(page.getByPlaceholder('name@example.com')).toBeVisible()
  await expect(page.getByPlaceholder('••••••••')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
})
