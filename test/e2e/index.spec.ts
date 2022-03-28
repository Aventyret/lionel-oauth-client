import { test, expect } from '@playwright/test'

test('should render and it does not do anything when clicking "Login"', async ({
  page
}) => {
  await page.goto('')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Lionel/)

  await page.click('text=Login')
  // Expect some text to be visible on the page.
  await expect(page.locator('h1').first()).toContainText('Sign in')
})
