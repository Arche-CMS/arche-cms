import { test, expect } from "../helpers";

const SLUG = "rich-text";

test.describe(`Global: ${SLUG}`, () => {
  test("get global", async ({ authedRequest }) => {
    const res = await authedRequest.get(`/api/globals/${SLUG}`);
    expect(res.ok()).toBeTruthy();
  });

  test("upsert global", async ({ authedRequest }) => {
    const res = await authedRequest.put(`/api/globals/${SLUG}`, {
      data: { field: [{ children: [{ text: "rich global" }], type: "paragraph" }] },
    });
    expect(res.ok()).toBeTruthy();
  });
});
