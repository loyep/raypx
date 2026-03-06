import browserCollections from "fumadocs-mdx:collections/browser";
import { DocsLayout } from "@fumadocs/base-ui/layouts/notebook";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "@fumadocs/base-ui/page";
import { generatePageHead } from "@raypx/seo";
import { createFileRoute, notFound, redirect, useLoaderData } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import type * as PageTree from "fumadocs-core/page-tree";
import { type ComponentType, useMemo } from "react";
import { getMdxComponents } from "@/components/layout/mdx-components";
import { githubConfig } from "@/config/docs";
import { siteConfig } from "@/config/site";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

const loader = createServerFn({ method: "GET" })
  .inputValidator((slugs: string[]) => slugs)
  .handler(async ({ data: slugs }) => {
    const page = source.getPage(slugs);
    if (!page) throw notFound();
    const { title, description } = page.data;
    return {
      path: page.path,
      slugs,
      title,
      description,
      tree: source.pageTree as object,
    };
  });

function transformPageTree(tree: PageTree.Folder): PageTree.Folder {
  function transform<T extends PageTree.Item | PageTree.Separator>(item: T) {
    if (typeof item.icon !== "string") return item;
    return {
      ...item,
      icon: (
        <span
          dangerouslySetInnerHTML={{
            __html: item.icon,
          }}
        />
      ),
    };
  }
  return {
    ...tree,
    index: tree.index ? transform(tree.index) : undefined,
    children: tree.children.map((item) => {
      if (item.type === "folder") return transformPageTree(item);
      return transform(item);
    }),
  };
}

export function DocsPageComponent() {
  const data = useLoaderData({ from: "/$" });
  const Content = useMemo(() => clientLoader.getComponent(data.path), [data.path]);
  const options = baseOptions();
  const tree = useMemo(() => transformPageTree(data.tree as PageTree.Folder), [data.tree]);

  return (
    <DocsLayout
      {...options}
      nav={{ ...options.nav, mode: "auto" }}
      sidebar={{
        collapsible: true,
        tabs: [
          {
            title: "Docs",
            url: "/",
          },
        ],
      }}
      tabMode="sidebar"
      tree={tree}
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
          ...githubConfig,
          path: `apps/docs/content/docs/${path}`,
        }}
        tableOfContent={{ enabled: true, style: "clerk" }}
        toc={toc}
      >
        <DocsTitle>{(frontmatter as { title?: string }).title}</DocsTitle>
        <DocsDescription>{(frontmatter as { description?: string }).description}</DocsDescription>
        <DocsBody>
          <MDX components={getMdxComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

export const Route = createFileRoute("/$")({
  component: DocsPageComponent,
  loader: async ({ params }) => {
    if (!params._splat) {
      throw redirect({
        to: "/$",
        params: { _splat: "start" },
      });
    }
    const data = await loader({ data: params._splat?.split("/").filter(Boolean) ?? [] });
    await clientLoader.preload(data.path);
    return data;
  },
  head: async (props) => {
    const { title, description, path } = props.loaderData ?? {};
    const url = `${siteConfig.url}/${path ?? ""}`;
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
