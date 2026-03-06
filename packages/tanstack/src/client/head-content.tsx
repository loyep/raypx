import { Asset, useRouter, useTags } from "@tanstack/react-router";

/**
 * Render route-managed head tags (title, meta, links, styles, head scripts).
 * Place inside the document head of your app shell.
 * @link https://tanstack.com/router/latest/docs/framework/react/guide/document-head-management
 */
export function HeadContent() {
  const tags = useTags();
  const router = useRouter();
  const nonce = router.options.ssr?.nonce;
  const isModulePreload = (tag: (typeof tags)[number]) =>
    tag.tag === "link" && tag.attrs?.rel === "modulepreload";
  const renderedTags = tags.filter((tag) => !isModulePreload(tag));
  return (
    <>
      {renderedTags.map((tag) => (
        <Asset {...tag} key={`tsr-meta-${JSON.stringify(tag)}`} nonce={nonce} />
      ))}
    </>
  );
}
