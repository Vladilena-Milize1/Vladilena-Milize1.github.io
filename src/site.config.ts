export interface NavItem {
  title: string;
  href: string;
}

export interface SiteConfig {
  title: string;
  author: string;
  handle: string;
  avatar: string;
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
  title: "Vladilena-Milize1",
  author: "Yanami",
  handle: "Vladilena-Milize1",
  avatar: "/avatar.jpg",
  description: "",
  siteUrl: "https://vladilena-milize1.github.io",
  navItems: [
    { title: "首页", href: "/" },
    { title: "文章", href: "/posts" },
    { title: "关于", href: "/about" },
  ],
  socials: {
    github: "https://github.com/Vladilena-Milize1",
    twitter: "https://x.com/",
    email: "3127137302@qq.com",
  },
  footer: {
    sinceYear: 2026,
  },
};
