import { test, expect } from "../helpers";

const SLUG = "homepage";

test.describe(`Global: ${SLUG}`, () => {
  test("get global", async ({ authedRequest }) => {
    const res = await authedRequest.get(`/api/globals/${SLUG}`);
    expect(res.ok()).toBeTruthy();
  });

  test("upsert global", async ({ authedRequest }) => {
    const res = await authedRequest.put(`/api/globals/${SLUG}`, {
      data: { content: "Welcome", title: "Homepage" },
    });
    expect(res.ok()).toBeTruthy();
  });
});
