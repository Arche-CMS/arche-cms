import { test, expect } from "../helpers";

const SLUG = "color";

test.describe(`Collection: ${SLUG}`, () => {
  let id: string;

  test("create entry", async ({ authedRequest }) => {
    const res = await authedRequest.post(`/api/${SLUG}`, {
      data: { field: "#ff0000", title: "Test Color" },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    id = data.id;
    expect(data.field).toBe("#ff0000");
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
    expect(data.field).toBe("#ff0000");
  });

  test("update entry", async ({ authedRequest }) => {
    const res = await authedRequest.patch(`/api/${SLUG}/${id}`, {
      data: { field: "#00ff00" },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.field).toBe("#00ff00");
  });

  test("delete entry", async ({ authedRequest }) => {
    const res = await authedRequest.delete(`/api/${SLUG}/${id}`);
    expect(res.ok()).toBeTruthy();
  });
});
