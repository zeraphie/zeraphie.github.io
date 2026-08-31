/* ─ flow-data tests — paths in, world state out ─ */

import { describe, expect, it } from "bun:test";

import { collectionLabel, itemPath, resolvePath, type Cluster } from "../src/lib/flow-data";

const world: Cluster[] = [
  {
    id: "dnd",
    label: "d&d",
    key: "1",
    items: [
      { id: "home-rules", label: "My Home Rules", sub: "d&d", post: "dnd/home-rules" },
      { id: "phantom", label: "Phantom", sub: "d&d", post: "dnd/phantom", ghost: true },
    ],
  },
  {
    id: "projects",
    label: "projects",
    key: "2",
    items: [{ id: "pjax", label: "PJAX", sub: "projects", post: "projects/pjax" }],
  },
];

describe("resolvePath", () => {
  it("reads the root as home", () => {
    expect(resolvePath(world, "/")).toEqual({});
  });

  it("reads an empty pathname as home", () => {
    expect(resolvePath(world, "")).toEqual({});
  });

  it("resolves a doc route", () => {
    expect(resolvePath(world, "/sitemap")).toEqual({ doc: "sitemap" });
  });

  it("resolves a cluster", () => {
    expect(resolvePath(world, "/dnd")).toEqual({ cat: "dnd" });
  });

  it("resolves an item to its cluster and id", () => {
    expect(resolvePath(world, "/dnd/home-rules")).toEqual({ cat: "dnd", item: "home-rules" });
  });

  it("ignores trailing slashes, even stacked ones", () => {
    expect(resolvePath(world, "/dnd/")).toEqual({ cat: "dnd" });
    expect(resolvePath(world, "/dnd/home-rules//")).toEqual({ cat: "dnd", item: "home-rules" });
  });

  it("does not resolve ghost items", () => {
    expect(resolvePath(world, "/dnd/phantom")).toBeNull();
  });

  it("returns null for paths this world doesn't know", () => {
    expect(resolvePath(world, "/nope")).toBeNull();
  });
});

describe("itemPath", () => {
  it("round-trips with resolvePath", () => {
    const item = world[1]!.items[0]!;
    expect(resolvePath(world, itemPath(item))).toEqual({ cat: "projects", item: "pjax" });
  });

  it("falls back to the item id without a post", () => {
    expect(itemPath({ id: "standalone", label: "Standalone", sub: "x" })).toBe("/standalone");
  });
});

describe("collectionLabel", () => {
  it("reads dnd as d&d", () => {
    expect(collectionLabel("dnd")).toBe("d&d");
  });

  it("passes other ids through", () => {
    expect(collectionLabel("projects")).toBe("projects");
  });
});
