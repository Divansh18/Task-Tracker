import { test, expect } from "@playwright/test";

function createTestUser(projectName: string) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return {
    email: `playwright-${projectName}-${suffix}@example.com`,
    password: `Password!${suffix}`,
    displayName: "Playwright User",
  };
}

test.describe("Authentication flow", () => {
  test.describe.configure({ mode: "serial" });

  const user = { email: "", password: "", displayName: "Playwright User" };

  test.beforeAll(async ({}, testInfo) => {
    const generated = createTestUser(testInfo.project.name);
    user.email = generated.email;
    user.password = generated.password;
  });

  test("shows validation feedback when submitting empty login form", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("Password must be at least 6 characters")).toBeVisible();
  });

  test("registers a new account and reaches the tasks dashboard", async ({ page }) => {
    await page.goto("/signup");

    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByLabel("Display name", { exact: false }).fill(user.displayName);

    await page.getByRole("button", { name: "Create account" }).click();

    await page.waitForURL("**/tasks");

    await expect(page.getByRole("button", { name: "New task" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Logout" })).toBeVisible();
    await expect(page.getByText(user.displayName)).toBeVisible();
  });
});

