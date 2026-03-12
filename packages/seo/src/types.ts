export interface SiteConfig {
  name: string;
  title: string;
  description: string;
  keywords?: string[];
  url: string;
  author: string;
  image: string;
  github?: string;
  twitter?: string;
}

export interface MetaTags {
  charSet?: string;
  title?: string;
  name?: string;
  content?: string;
  property?: string;
  rel?: string;
  type?: string;
  href?: string;
  hreflang?: string;
  sizes?: string;
  color?: string;
}

export interface LinkTag {
  rel?: string;
  type?: string;
  href?: string;
  sizes?: string;
  color?: string;
}

export interface ScriptTag {
  type?: string;
  innerHTML?: string;
}

export interface HeadConfig {
  meta?: MetaTags[];
  links?: LinkTag[];
  scripts?: ScriptTag[];
}
