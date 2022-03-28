// https://playwright.dev/docs/test-configuration
import { PlaywrightTestConfig, devices } from '@playwright/test'
// import http from 'http'

const PORT = 3002
const BASE_URL = `http://${
  process.env.IP ? process.env.IP : 'localhost'
}:${PORT}`

const config: PlaywrightTestConfig = {
  testDir: 'test/e2e',
  testIgnore: '**/unit/**',
  forbidOnly: !!process.env.CI, // Whether to exit with an error if any tests are marked as test.only (https://playwright.dev/docs/test-annotations#focus-a-test)
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: 'on-first-retry',
    baseURL: BASE_URL
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: `yarn serve:e2e -p ${PORT}`,
    port: PORT,
    timeout: 120 * 1000
    // reuseExistingServer: !process.env.CI
  }
}
export default config
