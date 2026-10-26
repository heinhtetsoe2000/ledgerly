import { execSync } from "node:child_process";
import { defineConfig, devices } from "@playwright/test";

function localSupabaseEnvironment(): Record<string, string> {
  let statusOutput: string;
  try {
    statusOutput = execSync("npx --yes supabase@latest status --output env", {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    });
  } catch {
    throw new Error("Start local Supabase with `npx supabase start` before running E2E tests.");
  }

  const variables = new Map<string, string>();
  for (const line of statusOutput.split(/\r?\n/)) {
    const separator = line.indexOf("=");
    if (separator < 0) continue;
    const name = line.slice(0, separator);
    const value = line.slice(separator + 1).trim().replace(/^"(.*)"$/, "$1");
    variables.set(name, value);
  }

  const url = variables.get("API_URL");
  const publishableKey = variables.get("PUBLISHABLE_KEY");
  if (!url || !publishableKey) {
    throw new Error("Local Supabase did not return an API URL and publishable key.");
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
  };
}

const baseURL = "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    ...devices["Desktop Chrome"],
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: `${baseURL}/sign-in`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: localSupabaseEnvironment(),
  },
});