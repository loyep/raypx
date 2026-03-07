import { remarkMdxFiles } from "fumadocs-core/mdx-plugins";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    async: true,
  },
});

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [remarkMdxFiles],
    remarkImageOptions: {
      onError: "ignore",
    },
    rehypeCodeOptions: {
      themes: {
        light: "github-light",
        dark: "github-dark",
      },
      inline: "tailing-curly-colon",
    },
  },
});
