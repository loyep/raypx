import type { BaseLayoutProps } from "@fumadocs/base-ui/layouts/shared";
import { ThemeSwitcher } from "@raypx/design-system/components/theme-switcher";
import { siteConfig } from "@/config/site";

export function getDocsLayoutOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <span className="font-semibold text-lg">{siteConfig.name}</span>,
      url: "/",
    },
    themeSwitch: {
      component: <ThemeSwitcher />,
    },
    githubUrl: siteConfig.github,
    links: [
      { text: "Home", url: "/" },
      { text: "Chat", url: "/chat", active: "nested-url" },
      { text: "Dashboard", url: "/dashboard", active: "nested-url" },
      { text: "GitHub", url: siteConfig.github ?? "" },
    ],
  };
}
