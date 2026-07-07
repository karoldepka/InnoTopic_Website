import {defineConfig, devices} from '@playwright/test'

// Node 20.6+ built-in - loads E2E_TEST_EMAIL/E2E_TEST_PASSWORD without adding a dotenv
// dependency. The file is gitignored (see .gitignore's `.env.*` pattern) - never commit it.
try {
  process.loadEnvFile('.env.e2e')
} catch {
  // Missing locally (e.g. a fresh CI runner without the secret wired up yet) - tests that need
  // E2E_TEST_EMAIL/E2E_TEST_PASSWORD fail fast with a clear message instead, see e2e/fixtures.ts.
}

const PORT = 4207
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  timeout: 45_000,
  expect: {timeout: 10_000},
  fullyParallel: false, // all tests share one real account/dataset - avoid cross-test interference
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', {open: 'never'}]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    // Chrome's fake audio device produces a real (silent-tone) MediaStream so getUserMedia()/
    // MediaRecorder actually capture something, without needing a real mic or an OS permission
    // prompt (fake-ui-for-media-stream auto-grants it).
    launchOptions: {
      args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
    },
  },
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome']}},
  ],
  webServer: {
    command: 'pnpm start',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
