import { test as base, type APIRequestContext } from "@playwright/test";

export const test = base.extend<{ authedRequest: APIRequestContext }>({
  authedRequest: async ({ request }, use) => {
    const loginRes = await request.post("/api/auth/login", {
      data: { email: "admin@arche-cms.com", password: "admin123" },
    });
    const { accessToken } = (await loginRes.json()) as { accessToken: string };

    const authed = await base.request.newContext({
      baseURL: "http://localhost:3500",
      extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
    });

    await use(authed);
    await authed.dispose();
  },
});

export { expect } from "@playwright/test";
