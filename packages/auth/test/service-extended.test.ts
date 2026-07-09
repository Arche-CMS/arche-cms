import { describe, it, expect, beforeEach } from "vitest";
import type { DatabaseAdapter } from "@altrugenix/database";
import { AuthService } from "../src/service.js";
import { hashPassword } from "../src/password.js";
import { randomBytes } from "node:crypto";

const config = {
  secret: "test-secret-at-least-32-chars-long-for-security!!",
  accessTokenExpiresIn: "15m",
  refreshTokenExpiresIn: "7d",
};

function createMockAdapter(): DatabaseAdapter {
  const users = new Map<string, Record<string, unknown>>();
  const resetTokens: Record<string, unknown>[] = [];
  let nextId = 1;

  return {
    findOne: async (collection, id) => {
      if (collection === "__cms_users") return users.get(id) ?? null;
      return null;
    },
    findMany: async (collection, options) => {
      if (collection === "__cms_users") {
        const all = [...users.values()];
        const email = options?.where?.email;
        const filtered = email ? all.filter((r) => r.email === email) : all;
        return { data: filtered.slice(0, options?.limit ?? 100), total: filtered.length };
      }
      if (collection === "__cms_password_resets") {
        return { data: [...resetTokens], total: resetTokens.length };
      }
      return { data: [], total: 0 };
    },
    create: async (collection, data) => {
      if (collection === "__cms_users") {
        const id = String(nextId++);
        const record = { id, ...data };
        users.set(id, record);
        return record;
      }
      if (collection === "__cms_password_resets") {
        const record = { id: String(nextId++), ...data };
        resetTokens.push(record);
        return record;
      }
      return data;
    },
    update: async (_collection, id, data) => {
      const existing = users.get(id);
      if (!existing) return null;
      const updated = { ...existing, ...data };
      users.set(id, updated);
      return updated;
    },
    delete: async (_collection, id) => {
      const existed = users.has(id);
      users.delete(id);
      return existed;
    },
    deleteMany: async () => 0,
    connect: async () => {},
    disconnect: async () => {},
    transaction: async <T>(fn: () => Promise<T>) => fn(),
    raw: async () => [],
    createTable: async () => {},
    dropTable: async () => {},
    runMigration: async () => {},
    getExecutedMigrations: async () => [],
  };
}

describe("AuthService extended", () => {
  let service: AuthService;
  let adapter: DatabaseAdapter;

  beforeEach(() => {
    adapter = createMockAdapter();
    service = new AuthService(adapter, config);
  });

  describe("forgotPassword", () => {
    it("returns generic message for any email", async () => {
      await service.register({ email: "test@example.com", password: "pass123" });
      const result = await service.forgotPassword({ email: "test@example.com" });
      expect(result.message).toContain("reset link");
      expect(result).not.toHaveProperty("resetToken");
    });

    it("returns generic message for unregistered email", async () => {
      const result = await service.forgotPassword({ email: "unknown@example.com" });
      expect(result.message).toContain("reset link");
      expect(result).not.toHaveProperty("resetToken");
    });
  });

  describe("resetPassword", () => {
    it("resets password with a valid token", async () => {
      await service.register({ email: "reset@example.com", password: "oldpass" });

      const rawToken = randomBytes(32).toString("hex");
      const hashedToken = await hashPassword(rawToken);
      await adapter.create("__cms_password_resets", {
        email: "reset@example.com",
        token: hashedToken,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      });

      const result = await service.resetPassword({ token: rawToken, password: "newpass" });
      expect(result.message).toContain("reset");
      await expect(
        service.login({ email: "reset@example.com", password: "newpass" }),
      ).resolves.toBeTruthy();
    });

    it("throws for invalid token", async () => {
      await expect(
        service.resetPassword({ token: "invalid-token", password: "newpass" }),
      ).rejects.toThrow("Invalid or expired reset token");
    });

    it("throws for expired token", async () => {
      await service.register({ email: "expired@example.com", password: "oldpass" });

      const rawToken = randomBytes(32).toString("hex");
      const hashedToken = await hashPassword(rawToken);
      await adapter.create("__cms_password_resets", {
        email: "expired@example.com",
        token: hashedToken,
        expiresAt: new Date(Date.now() - 3600000).toISOString(),
      });

      await expect(service.resetPassword({ token: rawToken, password: "newpass" })).rejects.toThrow(
        "Reset token has expired",
      );
    });

    it("throws if user is deleted before reset", async () => {
      await service.register({ email: "deleted@example.com", password: "oldpass" });

      const rawToken = randomBytes(32).toString("hex");
      const hashedToken = await hashPassword(rawToken);
      await adapter.create("__cms_password_resets", {
        email: "deleted@example.com",
        token: hashedToken,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      });

      const users = await service.listUsers();
      await service.deleteUser(users[0].id);

      await expect(service.resetPassword({ token: rawToken, password: "newpass" })).rejects.toThrow(
        "User not found",
      );
    });
  });

  describe("listUsers", () => {
    it("returns all public users without passwords", async () => {
      await service.register({ email: "a@example.com", password: "pass" });
      await service.register({ email: "b@example.com", password: "pass" });

      const users = await service.listUsers();
      expect(users).toHaveLength(2);
      expect(users[0]).not.toHaveProperty("password");
      expect(users.map((u) => u.email).sort()).toEqual(["a@example.com", "b@example.com"]);
    });

    it("returns empty array when no users exist", async () => {
      const users = await service.listUsers();
      expect(users).toEqual([]);
    });
  });

  describe("getUser", () => {
    it("returns a public user by id", async () => {
      const { user } = await service.register({ email: "get@example.com", password: "pass" });
      const found = await service.getUser(user.id);
      expect(found).not.toBeNull();
      expect(found?.email).toBe("get@example.com");
      expect(found).not.toHaveProperty("password");
    });

    it("returns null for unknown id", async () => {
      const found = await service.getUser("nonexistent");
      expect(found).toBeNull();
    });
  });

  describe("updateUser", () => {
    it("updates user email", async () => {
      const { user } = await service.register({ email: "old@example.com", password: "pass" });
      const updated = await service.updateUser(user.id, { email: "new@example.com" });
      expect(updated?.email).toBe("new@example.com");
    });

    it("updates user role", async () => {
      const { user } = await service.register({ email: "role@example.com", password: "pass" });
      const updated = await service.updateUser(user.id, { role: "admin" });
      expect(updated?.role).toBe("admin");
    });

    it("returns null for unknown user", async () => {
      const updated = await service.updateUser("nonexistent", { email: "x@example.com" });
      expect(updated).toBeNull();
    });
  });

  describe("deleteUser", () => {
    it("deletes a user and returns true", async () => {
      const { user } = await service.register({ email: "delete@example.com", password: "pass" });
      const deleted = await service.deleteUser(user.id);
      expect(deleted).toBe(true);
      const found = await service.getUser(user.id);
      expect(found).toBeNull();
    });

    it("returns false for unknown user", async () => {
      const deleted = await service.deleteUser("nonexistent");
      expect(deleted).toBe(false);
    });
  });
});
