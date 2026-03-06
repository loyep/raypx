import browserCollections from "fumadocs-mdx:collections/browser";
import { DocsLayout } from "@fumadocs/base-ui/layouts/notebook";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "@fumadocs/base-ui/page";
import { generatePageHead } from "@raypx/seo";
import { createFileRoute, notFound, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type * as PageTree from "fumadocs-core/page-tree";
import { type ComponentType, useMemo } from "react";
import { getDocsMdxComponents } from "@/components/docs/mdx-components";
import { siteConfig } from "@/config/site";
import { getDocsLayoutOptions } from "@/lib/docs-layout";
import { docsSource } from "@/lib/docs-source";

const loader = createServerFn({ method: "GET" })
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = docsSource.getPage(slugs);
    if (!page) throw notFound();

    const { title, description } = page.data;

    return {
      path: page.path,
      slugs,
      title,
      description,
      tree: docsSource.pageTree as object,
    };
  });

function DocsPageComponent() {
  const data = Route.useLoaderData();
  const Content = useMemo(() => clientLoader.getComponent(data.path), [data.path]);
  const options = getDocsLayoutOptions();

  return (
    <DocsLayout
      {...options}
      nav={{ ...options.nav, mode: "auto" }}
      sidebar={{
        collapsible: true,
        tabs: [
          {
            title: "Docs",
            url: "/docs/start",
          },
        ],
      }}
      tabMode="sidebar"
      tree={data.tree as PageTree.Folder}
    >
      <Content path={data.path} />
    </DocsLayout>
  );
}

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    {
      toc,
      frontmatter,
      default: MDX,
    }: {
      toc: any[] | undefined;
      frontmatter: { title?: string; description?: string };
      default: ComponentType<{ components?: any }>;
    },
    { path }: { path: string },
  ) {
    return (
      <DocsPage
        editOnGithub={{
          owner: "raypx",
          repo: "raypx",
          sha: "canary",
          path: `apps/web/content/docs/${path}`,
        }}
        tableOfContent={{ enabled: true, style: "clerk" }}
        toc={toc}
      >
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <DocsBody>
          <MDX components={getDocsMdxComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

export const Route = createFileRoute("/docs/$")({
  component: DocsPageComponent,
  loader: async ({ params }) => {
    if (!params._splat) {
      throw redirect({
        to: "/docs/$",
        params: { _splat: "start" },
      });
    }

    const data = await loader({ data: params._splat.split("/").filter(Boolean) });
    await clientLoader.preload(data.path);
    return data;
  },
  head: (props) => {
    const { title, description, path } = props.loaderData ?? {};
    const url = `${siteConfig.url}/docs/${path ?? ""}`;
    const pageTitle = title ? `${title} - ${siteConfig.name}` : siteConfig.title;

    return generatePageHead(siteConfig, {
      title: pageTitle,
      description: description ?? siteConfig.description,
      url,
      ogType: "article",
      publishedTime: new Date(),
    });
  },
});
