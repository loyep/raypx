import { describe, expect, it } from "vitest";

import { generatePageHead, generateRootHead } from "../src/head";
import type { SiteConfig } from "../src/types";

const siteConfig: SiteConfig = {
  name: "Raypx",
  title: "Raypx",
  description: "A modern fullstack app",
  keywords: ["raypx", "fullstack"],
  url: "https://raypx.com",
  author: "Raypx Team",
  image: "/og.png",
  github: "https://github.com/raypx/raypx",
  twitter: "raypxhq",
};

describe("generateRootHead", () => {
  it("includes canonical link and website schema", () => {
    const head = generateRootHead(siteConfig);

    expect(head.links).toContainEqual({ rel: "canonical", href: "https://raypx.com" });
    expect(head.scripts).toHaveLength(1);
    expect(head.scripts?.[0]?.innerHTML).toContain('"@type":"WebSite"');
  });

  it("includes og:site_name and twitter:site", () => {
    const head = generateRootHead(siteConfig);

    expect(head.meta).toContainEqual({ property: "og:site_name", content: "Raypx" });
    expect(head.meta).toContainEqual({ name: "twitter:site", content: "raypxhq" });
  });

  it("skips keywords meta when keywords is omitted", () => {
    const { keywords: _, ...configWithoutKeywords } = siteConfig;
    const head = generateRootHead(configWithoutKeywords);

    expect(head.meta?.some((m) => m.name === "keywords")).toBe(false);
  });
});

describe("generatePageHead", () => {
  it("omits canonical for localhost urls and adds robots on noindex", () => {
    const head = generatePageHead(siteConfig, {
      title: "Local Preview",
      url: "http://localhost:3000/docs",
      noindex: true,
    });

    expect(head.links).toEqual([]);
    expect(head.meta).toContainEqual({ name: "robots", content: "noindex, nofollow" });
    expect(head.meta).toContainEqual({ property: "og:url", content: "https://raypx.com" });
  });

  it("includes og:site_name", () => {
    const head = generatePageHead(siteConfig, { title: "Blog" });

    expect(head.meta).toContainEqual({ property: "og:site_name", content: "Raypx" });
  });

  it("adds article-specific metadata when ogType is article", () => {
    const head = generatePageHead(siteConfig, {
      ogType: "article",
      publishedTime: "2026-03-10T00:00:00.000Z",
      tags: ["release", "engineering"],
    });

    expect(head.meta).toContainEqual({
      property: "article:published_time",
      content: "2026-03-10T00:00:00.000Z",
    });
    expect(head.meta).toContainEqual({ property: "article:tag", content: "release" });
    expect(head.meta).toContainEqual({ property: "article:tag", content: "engineering" });
  });

  it("normalizes Date objects to ISO strings for article times", () => {
    const head = generatePageHead(siteConfig, {
      ogType: "article",
      publishedTime: new Date("2026-03-10T00:00:00.000Z"),
      modifiedTime: new Date("2026-03-11T00:00:00.000Z"),
    });

    expect(head.meta).toContainEqual({
      property: "article:published_time",
      content: "2026-03-10T00:00:00.000Z",
    });
    expect(head.meta).toContainEqual({
      property: "article:modified_time",
      content: "2026-03-11T00:00:00.000Z",
    });
  });
});
