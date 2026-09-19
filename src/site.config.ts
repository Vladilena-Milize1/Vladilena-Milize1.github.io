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
  title: "Teerain's Tech Log",
  author: "Teerain",
  description: "全栈开发、系统架构与 Rust 探索的个人数字花园",
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

