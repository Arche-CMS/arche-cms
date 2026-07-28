import { test, expect } from "../helpers";

const SLUG = "group";

test.describe(`Collection: ${SLUG}`, () => {
  let id: string;

  test("create entry", async ({ authedRequest }) => {
    const res = await authedRequest.post(`/api/${SLUG}`, {
      data: { field: { nested: "group value" }, title: "Test Group" },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    id = data.id;
    expect(data.field).toEqual({ nested: "group value" });
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
    expect(data.field).toEqual({ nested: "group value" });
  });

  test("update entry", async ({ authedRequest }) => {
    const res = await authedRequest.patch(`/api/${SLUG}/${id}`, {
      data: { field: { nested: "updated" } },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.field).toEqual({ nested: "updated" });
  });

  test("delete entry", async ({ authedRequest }) => {
    const res = await authedRequest.delete(`/api/${SLUG}/${id}`);
    expect(res.ok()).toBeTruthy();
  });
});
