export interface NavItem {
  title: string;
  href: string;
}

export interface SiteConfig {
  title: string;
  author: string;
  description: string;
  siteUrl: string;
  navItems: NavItem[];
  socials: {
    github?: string;
    twitter?: string;
    email?: string;
  };
  footer: {
    sinceYear: number;
  };
}

export const SITE: SiteConfig = {
  title: "Yanami's Blog",
  author: "Yanami",
  description: "",
  siteUrl: "https://example.com",
  navItems: [
    { title: "首页", href: "/" },
    { title: "文章", href: "/posts" },
    { title: "关于", href: "/about" },
  ],
  socials: {
    github: "https://github.com",
    twitter: "https://twitter.com",
    email: "mailto:hello@example.com",
  },
  footer: {
    sinceYear: 2026,
  },
};

