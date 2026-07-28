import { test, expect } from "../helpers";

const SLUG = "textarea";

test.describe(`Collection: ${SLUG}`, () => {
  let id: string;

  test("create entry", async ({ authedRequest }) => {
    const res = await authedRequest.post(`/api/${SLUG}`, {
      data: { field: "multi-line\ncontent", title: "Test Textarea" },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    id = data.id;
    expect(data.field).toBe("multi-line\ncontent");
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
    expect(data.field).toBe("multi-line\ncontent");
  });

  test("update entry", async ({ authedRequest }) => {
    const res = await authedRequest.patch(`/api/${SLUG}/${id}`, {
      data: { field: "updated textarea" },
    });
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.field).toBe("updated textarea");
  });

  test("delete entry", async ({ authedRequest }) => {
    const res = await authedRequest.delete(`/api/${SLUG}/${id}`);
    expect(res.ok()).toBeTruthy();
  });
});
