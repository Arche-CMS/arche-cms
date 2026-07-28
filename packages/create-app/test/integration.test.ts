import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

import { scaffold } from "../src/index.js";

const PORT = 3599;
const BASE = `http://localhost:${PORT}`;
const ADMIN_EMAIL = "admin@arche-cms.com";
const ADMIN_PASSWORD = "testpassword123";

let tmpDir: string;
let projectDir: string;
let serverProc: ReturnType<typeof import("node:child_process").spawn> | null = null;

function waitForServer(url: string, timeoutMs = 30_000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = async () => {
      try {
        const res = await fetch(url);
        if (res.ok || res.status === 404) {
          resolve();
          return;
        }
      } catch {
        // server not ready yet
      }
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Server did not start within ${timeoutMs}ms`));
        return;
      }
      setTimeout(check, 500);
    };
    void check();
  });
}

async function api(
  method: string,
  path: string,
  body?: Record<string, unknown>,
  token?: string,
): Promise<{ status: number; json: () => Promise<Record<string, unknown>> }> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    body: body ? JSON.stringify(body) : undefined,
    headers,
    method,
  });
  return {
    json: () => res.json() as Promise<Record<string, unknown>>,
    status: res.status,
  };
}

beforeAll(async () => {
  tmpDir = mkdtempSync(resolve(tmpdir(), "arche-cms-integration-"));
  projectDir = resolve(tmpDir, "test-cms");

  scaffold(projectDir, { backendMode: "rest", dbAdapter: "sqlite", defaultLocale: "en" });

  // Add pnpm onlyBuiltDependencies to avoid interactive prompt
  const pkg = JSON.parse(readFileSync(resolve(projectDir, "package.json"), "utf-8"));
  pkg.pnpm = { onlyBuiltDependencies: ["esbuild"] };
  writeFileSync(resolve(projectDir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");

  // Link to local workspace packages instead of npm
  const monorepoRoot = resolve(import.meta.dirname, "../../..");
  pkg.dependencies["@arche-cms/cms"] = `link:${resolve(monorepoRoot, "packages/cms")}`;
  pkg.dependencies["@arche-cms/schema"] = `link:${resolve(monorepoRoot, "packages/schema")}`;
  writeFileSync(resolve(projectDir, "package.json"), JSON.stringify(pkg, null, 2) + "\n");

  // Install dependencies
  execSync("pnpm install --no-frozen-lockfile", {
    cwd: projectDir,
    stdio: "pipe",
    timeout: 120_000,
  });

  // Start the server
  const { spawn } = await import("node:child_process");
  serverProc = spawn("pnpm", ["run", "dev"], {
    cwd: projectDir,
    env: {
      ...process.env,
      ADMIN_PASSWORD,
      AUTH_SECRET: "test-secret-for-integration-tests",
      PORT: String(PORT),
    },
    stdio: "pipe",
  });

  // Wait for server to be ready
  await waitForServer(`${BASE}/health`);
}, 180_000);

afterAll(async () => {
  if (serverProc) {
    const proc = serverProc;
    proc.kill("SIGTERM");
    await new Promise<void>((resolve) => {
      proc.on("exit", () => resolve());
      setTimeout(() => {
        proc.kill("SIGKILL");
        resolve();
      }, 5000);
    });
  }
  if (tmpDir && existsSync(tmpDir)) {
    rmSync(tmpDir, { force: true, recursive: true });
  }
});

describe("create-app integration", () => {
  it("scaffolds project with correct files", () => {
    expect(existsSync(projectDir)).toBe(true);
    expect(existsSync(resolve(projectDir, "package.json"))).toBe(true);
    expect(existsSync(resolve(projectDir, ".env"))).toBe(true);
    expect(existsSync(resolve(projectDir, "arche-cms.config.ts"))).toBe(true);
    expect(existsSync(resolve(projectDir, "cms/collections/posts.ts"))).toBe(true);
    expect(existsSync(resolve(projectDir, "cms/globals/site-settings.ts"))).toBe(true);
  });

  it("health endpoint returns ok", async () => {
    const res = await api("GET", "/health");
    expect(res.status).toBe(200);
  });

  it("login with default admin credentials", async () => {
    const res = await api("POST", "/api/auth/login", {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty("accessToken");
    expect(typeof body.accessToken).toBe("string");
  });

  it("login rejects wrong password", async () => {
    const res = await api("POST", "/api/auth/login", {
      email: ADMIN_EMAIL,
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });

  it("protected routes require auth", async () => {
    const res = await api("GET", "/api/posts");
    expect(res.status).toBe(401);
  });

  it("list collections with auth", async () => {
    const loginRes = await api("POST", "/api/auth/login", {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    const { accessToken } = await loginRes.json();

    const res = await api("GET", "/api/collections", undefined, accessToken);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThanOrEqual(1);
  });

  it("CRUD on posts collection", async () => {
    const loginRes = await api("POST", "/api/auth/login", {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    const { accessToken } = await loginRes.json();

    // Create
    const createRes = await api(
      "POST",
      "/api/posts",
      { content: "Hello world", slug: "test-post", status: "draft", title: "Test Post" },
      accessToken,
    );
    expect(createRes.status).toBe(201);
    const created = await createRes.json();
    expect(created).toHaveProperty("id");
    const id = created.id as string;

    // Read
    const getRes = await api("GET", `/api/posts/${id}`, undefined, accessToken);
    expect(getRes.status).toBe(200);
    const got = await getRes.json();
    expect(got.title).toBe("Test Post");

    // Update
    const updateRes = await api(
      "PATCH",
      `/api/posts/${id}`,
      { title: "Updated Post" },
      accessToken,
    );
    expect(updateRes.status).toBe(200);
    const updated = await updateRes.json();
    expect(updated.title).toBe("Updated Post");

    // List
    const listRes = await api("GET", "/api/posts", undefined, accessToken);
    expect(listRes.status).toBe(200);
    const list = await listRes.json();
    expect(list.data.length).toBeGreaterThanOrEqual(1);

    // Delete
    const deleteRes = await api("DELETE", `/api/posts/${id}`, undefined, accessToken);
    expect(deleteRes.status).toBe(200);
  });

  it("upsert and get global", async () => {
    const loginRes = await api("POST", "/api/auth/login", {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    const { accessToken } = await loginRes.json();

    // Upsert
    const upsertRes = await api(
      "PUT",
      "/api/globals/site-settings",
      { description: "A test site", siteName: "My Test Site" },
      accessToken,
    );
    expect(upsertRes.status).toBe(200);

    // Get
    const getRes = await api("GET", "/api/globals/site-settings", undefined, accessToken);
    expect(getRes.status).toBe(200);
    const body = await getRes.json();
    expect(body.siteName).toBe("My Test Site");
  });

  it("homepage returns 200 (admin UI served)", async () => {
    const res = await api("GET", "/");
    expect(res.status).toBe(200);
  });

  it("swagger docs are accessible", async () => {
    const res = await api("GET", "/docs");
    expect(res.status).toBe(200);
  });
});
