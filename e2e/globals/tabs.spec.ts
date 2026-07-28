import { test, expect } from "../helpers";

const SLUG = "tabs";

test.describe(`Global: ${SLUG}`, () => {
  test("get global", async ({ authedRequest }) => {
    const res = await authedRequest.get(`/api/globals/${SLUG}`);
    expect(res.ok()).toBeTruthy();
  });

  test("upsert global", async ({ authedRequest }) => {
    const res = await authedRequest.put(`/api/globals/${SLUG}`, {
      data: { field: { tab1Field: "tab1 value", tab2Field: "tab2 value" } },
    });
    expect(res.ok()).toBeTruthy();
  });
});
