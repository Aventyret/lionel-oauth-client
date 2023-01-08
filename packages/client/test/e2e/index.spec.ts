import { test as base, expect } from '@playwright/test'
import { OauthClientConfig } from '../../src/createOauthClient'
import 'dotenv/config'

declare global {
  interface Window {
    config: any // eslint-disable-line @typescript-eslint/no-explicit-any,
  }
}

/** Preload bundled lionel source code */
const test = base.extend({
  page: async ({ page }, use) => {
    const config: Partial<OauthClientConfig> = {
      issuer: process.env.ISSUER || 'https://demo.duendesoftware.com',
      authorizationEndpoint:
        process.env.AUTHORIZATION_ENDPOINT || '/connect/authorize',
      tokenEndpoint: process.env.TOKEN_ENDPOINT || '/connect/token',
      clientId: process.env.CLIENT_ID || 'interactive.public'
    }
    await page.addInitScript((config: Partial<OauthClientConfig>) => {
      window.config = {
        issuer: config.issuer,
        authorizationEndpoint: config.authorizationEndpoint,
        tokenEndpoint: config.tokenEndpoint,
        clientId: config.clientId
      }
    }, config)
    await use(page)
  }
})

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
