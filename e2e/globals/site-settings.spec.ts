import { test, expect } from "../helpers";

const SLUG = "site-settings";

test.describe(`Global: ${SLUG}`, () => {
  test("get global", async ({ authedRequest }) => {
    const res = await authedRequest.get(`/api/globals/${SLUG}`);
    expect(res.ok()).toBeTruthy();
  });

  test("upsert global", async ({ authedRequest }) => {
    const res = await authedRequest.put(`/api/globals/${SLUG}`, {
      data: { siteDescription: "A file-based CMS", siteName: "Arche CMS" },
    });
    expect(res.ok()).toBeTruthy();
  });
});
