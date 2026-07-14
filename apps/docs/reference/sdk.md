# TypeScript SDK

The auto-generated TypeScript SDK provides a fully-typed client for interacting with the CMS API.

## Usage

```ts
import { createClient } from "@arche-cms/sdk";

const client = createClient({
  baseUrl: "http://localhost:3001/api",
  token: "your-jwt-token",
});

// List posts
const posts = await client.posts.list({ limit: 10 });
//    ^? { data: Post[], total: number }

// Get single post
const post = await client.posts.get("1");
//    ^? Post | null

// Create post
const created = await client.posts.create({
  title: "Hello World",
  status: "published",
});

// Update post
const updated = await client.posts.update("1", {
  title: "Updated Title",
});

// Delete post
await client.posts.delete("1");
```

## Error Handling

```ts
try {
  await client.posts.create({ title: "" });
} catch (error) {
  if (error instanceof ApiError) {
    console.error(error.statusCode, error.body);
  }
}
```
