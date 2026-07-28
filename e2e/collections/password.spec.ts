import { test, expect } from "../helpers";

const SLUG = "password";

test.describe(`Collection: ${SLUG}`, () => {
  let id: string;

  test("create entry", async ({ authedRequest }) => {
    const res = await authedRequest.post(`/api/${SLUG}`, {
      data: { field: "secret123", title: "Test Password" },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    id = data.id;
  });

  test("list entries", async ({ authedRequest }) => {
    const res = await authedRequest.get(`/api/${SLUG}`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.data).toBeDefined();
  });

  test("get entry by id", async ({ authedRequest }) => {
    const res = await authedRequest.get(`/api/${SLUG}/${id}`);
    expect(res.ok()).toBeTruthy();
  });

  test("update entry", async ({ authedRequest }) => {
    const res = await authedRequest.patch(`/api/${SLUG}/${id}`, {
      data: { field: "newsecret456" },
    });
    expect(res.ok()).toBeTruthy();
  });

  test("delete entry", async ({ authedRequest }) => {
    const res = await authedRequest.delete(`/api/${SLUG}/${id}`);
    expect(res.ok()).toBeTruthy();
  });
});
