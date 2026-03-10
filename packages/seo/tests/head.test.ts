import { describe, expect, it } from "vitest";

import { generatePageHead, generateRootHead } from "../src/head";
import {
  generateArticleSchema,
  generateSoftwareSchema,
  generateWebSiteSchema,
} from "../src/schema";
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

describe("seo head helpers", () => {
  it("builds root head with canonical link and website schema", () => {
    const head = generateRootHead(siteConfig);

    expect(head.links).toContainEqual({ rel: "canonical", href: "https://raypx.com" });
    expect(head.scripts).toHaveLength(1);
    expect(head.scripts?.[0]?.innerHTML).toContain('"@type":"WebSite"');
  });

  it("omits canonical links for localhost page urls and adds robots on noindex", () => {
    const head = generatePageHead(siteConfig, {
      title: "Local Preview",
      url: "http://localhost:3000/docs",
      noindex: true,
    });

    expect(head.links).toEqual([]);
    expect(head.meta).toContainEqual({ name: "robots", content: "noindex, nofollow" });
    expect(head.meta).toContainEqual({ property: "og:url", content: "https://raypx.com" });
  });

  it("adds article-specific metadata when ogType is article", () => {
    const head = generatePageHead(siteConfig, {
      ogType: "article",
      publishedTime: "2026-03-10T00:00:00.000Z",
      tags: ["release", "engineering"],
    });

    expect(head.meta).toContainEqual({
      name: "article:published_time",
      content: "2026-03-10T00:00:00.000Z",
    });
    expect(head.meta).toContainEqual({ name: "article:tag", content: "release" });
    expect(head.meta).toContainEqual({ name: "article:tag", content: "engineering" });
  });
});

describe("seo schema helpers", () => {
  it("serializes website and software schema payloads", () => {
    expect(generateWebSiteSchema(siteConfig).innerHTML).toContain('"@type":"WebSite"');
    expect(generateSoftwareSchema(siteConfig).innerHTML).toContain('"@type":"SoftwareSourceCode"');
  });

  it("serializes article schema payloads", () => {
    const schema = generateArticleSchema(
      "Post",
      "Desc",
      "https://raypx.com/blog/post",
      "2026-03-10T00:00:00.000Z",
      "Raypx Team",
    );

    expect(schema.innerHTML).toContain('"@type":"Article"');
    expect(schema.innerHTML).toContain('"headline":"Post"');
  });
});
