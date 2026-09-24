import { defineConfig,devices } from '@playwright/test';
export default defineConfig({
  testDir:'./tests',timeout:60000,fullyParallel:true,
  use:{baseURL:'http://127.0.0.1:3110',trace:'retain-on-failure'},
  projects:[{name:'mobile-chromium',use:{...devices['Pixel 7'],channel:process.env.PLAYWRIGHT_CHANNEL||undefined}}],
  webServer:{command:'node design/serve.cjs',url:'http://127.0.0.1:3110',reuseExistingServer:!process.env.CI},
});
