import { test, expect } from '@playwright/test'

test('should render and it goes to oauth page when clicking "Sign in with oAuth"', async ({
  page
}) => {
  await page.goto('')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Lionel/)

  await page.click('text=Sign in with oAuth')
  // Expect some text to be visible on the page.
  await expect(page.locator('h2').first()).toContainText(
    'Using Lionel OAuth Client'
  )
})

test('should render and it goes to oidc page when clicking "Sign in with OpenID Connect"', async ({
  page
}) => {
  await page.goto('')

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Lionel/)

  await page.click('text=Sign in with OpenID Connect')
  // Expect some text to be visible on the page.
  await expect(page.locator('h2').first()).toContainText(
    'Using Lionel Oidc Client'
  )
})
