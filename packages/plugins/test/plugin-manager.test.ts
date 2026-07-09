import { describe, it, expect, vi } from "vitest";
import { PluginManager } from "../src/plugin-manager.js";
import type { PluginDefinition } from "@altrugenix/types";

describe("PluginManager", () => {
  const mockEventBus = { emit: vi.fn() };
  const mockLifecycle = { onShutdown: vi.fn() };
  const mockContext = {
    config: {} as never,
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn(), fatal: vi.fn() },
    container: {},
  };

  function createManager() {
    return new PluginManager({
      eventBus: mockEventBus,
      lifecycle: mockLifecycle,
      context: mockContext,
    });
  }

  it("registers a plugin", () => {
    const pm = createManager();
    const plugin: PluginDefinition = {
      slug: "test-plugin",
      name: "Test Plugin",
    };
    pm.register(plugin);
    expect(pm.get("test-plugin")).toBeDefined();
    expect(pm.get("test-plugin")?.plugin.name).toBe("Test Plugin");
    expect(pm.get("test-plugin")?.enabled).toBe(true);
  });

  it("throws when registering duplicate plugin", () => {
    const pm = createManager();
    const plugin: PluginDefinition = { slug: "dup", name: "Dup" };
    pm.register(plugin);
    expect(() => pm.register(plugin)).toThrow('Plugin "dup" is already registered');
  });

  it("unregisters a plugin", () => {
    const pm = createManager();
    pm.register({ slug: "test", name: "Test" });
    pm.unregister("test");
    expect(pm.get("test")).toBeUndefined();
  });

  it("gets all registered plugins", () => {
    const pm = createManager();
    pm.register({ slug: "a", name: "A" });
    pm.register({ slug: "b", name: "B" });
    expect(pm.getAll()).toHaveLength(2);
  });

  it("filters enabled plugins", () => {
    const pm = createManager();
    pm.register({ slug: "a", name: "A" });
    pm.register({ slug: "b", name: "B" });
    pm.disable("a");
    expect(pm.getEnabled()).toHaveLength(1);
    expect(pm.getEnabled()[0]?.plugin.slug).toBe("b");
  });

  it("enable/disable toggles plugin state", () => {
    const pm = createManager();
    pm.register({ slug: "test", name: "Test" });
    pm.disable("test");
    expect(pm.get("test")?.enabled).toBe(false);
    pm.enable("test");
    expect(pm.get("test")?.enabled).toBe(true);
  });

  it("emits plugin:registered event", () => {
    const pm = createManager();
    pm.register({ slug: "audit", name: "Audit" });
    expect(mockEventBus.emit).toHaveBeenCalledWith("plugin:registered", { slug: "audit" });
  });

  it("registers shutdown hook", () => {
    const pm = createManager();
    pm.register({ slug: "test", name: "Test" });
    expect(mockLifecycle.onShutdown).toHaveBeenCalled();
  });

  it("runs beforeSchemaLoad hooks", async () => {
    const pm = createManager();
    const beforeSchemaLoad = vi.fn();
    pm.register({
      slug: "test",
      name: "Test",
      hooks: { beforeSchemaLoad },
    });
    await pm.runHook("beforeSchemaLoad");
    expect(beforeSchemaLoad).toHaveBeenCalledWith(mockContext);
  });

  it("runs afterSchemaLoad hooks", async () => {
    const pm = createManager();
    const afterSchemaLoad = vi.fn();
    pm.register({
      slug: "test",
      name: "Test",
      hooks: { afterSchemaLoad },
    });
    await pm.runHook("afterSchemaLoad");
    expect(afterSchemaLoad).toHaveBeenCalledWith(mockContext);
  });

  it("skips hooks for disabled plugins", async () => {
    const pm = createManager();
    const hook = vi.fn();
    pm.register({ slug: "test", name: "Test", hooks: { beforeSchemaLoad: hook } });
    pm.disable("test");
    await pm.runHook("beforeSchemaLoad");
    expect(hook).not.toHaveBeenCalled();
  });

  it("collects custom fields from plugins", () => {
    const pm = createManager();
    pm.register({
      slug: "seo",
      name: "SEO",
      fields: {
        posts: [{ name: "metaTitle", type: "text" }],
      },
    });
    pm.register({
      slug: "audit",
      name: "Audit",
      fields: {
        posts: [{ name: "lastReviewed", type: "date" }],
      },
    });
    const fields = pm.getCustomFields();
    expect(fields.posts).toHaveLength(2);
    expect(fields.posts[0]).toEqual({ name: "metaTitle", type: "text" });
    expect(fields.posts[1]).toEqual({ name: "lastReviewed", type: "date" });
  });

  it("collects admin panels from plugins", () => {
    const pm = createManager();
    pm.register({
      slug: "analytics",
      name: "Analytics",
      adminPanels: [
        { slug: "analytics-dash", label: "Analytics Dashboard", component: "AnalyticsDashboard" },
      ],
    });
    const panels = pm.getAdminPanels();
    expect(panels).toHaveLength(1);
    expect(panels[0]?.plugin).toBe("analytics");
    expect(panels[0]?.slug).toBe("analytics-dash");
  });

  it("initPlugins runs beforeSchemaLoad hooks", async () => {
    const pm = createManager();
    const hook = vi.fn();
    pm.register({ slug: "test", name: "Test", hooks: { beforeSchemaLoad: hook } });
    await pm.initPlugins();
    expect(hook).toHaveBeenCalled();
  });
});
