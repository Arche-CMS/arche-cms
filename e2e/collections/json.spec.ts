import { test, expect } from "../helpers";

const SLUG = "json";

test.describe(`Collection: ${SLUG}`, () => {
  let id: string;

  test("create entry", async ({ authedRequest }) => {
    const res = await authedRequest.post(`/api/${SLUG}`, {
      data: { field: { key: "value", nested: { a: 1 } }, title: "Test JSON" },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    id = data.id;
    expect(data.field).toEqual({ key: "value", nested: { a: 1 } });
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
    const data = await res.json();
    expect(data.field).toEqual({ key: "value", nested: { a: 1 } });
  });

  test("update entry", async ({ authedRequest }) => {
    const res = await authedRequest.patch(`/api/${SLUG}/${id}`, {
      data: { field: { updated: true } },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.field).toEqual({ updated: true });
  });

  test("delete entry", async ({ authedRequest }) => {
    const res = await authedRequest.delete(`/api/${SLUG}/${id}`);
    expect(res.ok()).toBeTruthy();
  });
});
