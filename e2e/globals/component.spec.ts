import { test, expect } from "../helpers";

const SLUG = "component";

test.describe(`Global: ${SLUG}`, () => {
  test("get global", async ({ authedRequest }) => {
    const res = await authedRequest.get(`/api/globals/${SLUG}`);
    expect(res.ok()).toBeTruthy();
  });

  test("upsert global", async ({ authedRequest }) => {
    const res = await authedRequest.put(`/api/globals/${SLUG}`, {
      data: { field: { title: "component global value" } },
    });
    expect(res.ok()).toBeTruthy();
  });
});
