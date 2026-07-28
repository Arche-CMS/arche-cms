import { test, expect } from "../helpers";

const SLUG = "object";

test.describe(`Global: ${SLUG}`, () => {
  test("get global", async ({ authedRequest }) => {
    const res = await authedRequest.get(`/api/globals/${SLUG}`);
    expect(res.ok()).toBeTruthy();
  });

  test("upsert global", async ({ authedRequest }) => {
    const res = await authedRequest.put(`/api/globals/${SLUG}`, {
      data: { field: { nested: "global value" } },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.field).toEqual({ nested: "global value" });
  });
});
