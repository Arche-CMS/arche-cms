import { test, expect } from "../helpers";

const SLUG = "datetime";

test.describe(`Global: ${SLUG}`, () => {
  test("get global", async ({ authedRequest }) => {
    const res = await authedRequest.get(`/api/globals/${SLUG}`);
    expect(res.ok()).toBeTruthy();
  });

  test("upsert global", async ({ authedRequest }) => {
    const res = await authedRequest.put(`/api/globals/${SLUG}`, {
      data: { field: "2024-12-25T15:00:00Z" },
    });
    expect(res.ok()).toBeTruthy();
  });
});
