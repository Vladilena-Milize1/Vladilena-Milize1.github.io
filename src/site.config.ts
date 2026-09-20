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
  comment?: {
    enable: boolean;
    type?: "giscus";
    repo: string;
    repoId: string;
    category: string;
    categoryId: string;
    mapping?: "pathname" | "url" | "title" | "og:title" | "slug";
    strict?: "0" | "1";
    reactionsEnabled?: "0" | "1";
    emitMetadata?: "0" | "1";
    inputPosition?: "top" | "bottom";
    lang?: string;
    lightTheme?: string;
    darkTheme?: string;
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
  ],
  socials: {
    github: "https://github.com/Vladilena-Milize1",
    twitter: "https://x.com/",
    email: "mailto:3127137302@qq.com",
  },
  footer: {
    sinceYear: 2026,
  },
  comment: {
    enable: true,
    type: "giscus",
    repo: "Vladilena-Milize1/Vladilena-Milize1.github.io",
    repoId: "R_kgDOUhlS9g",
    category: "Announcements",
    categoryId: "DIC_kwDOUhlS9s4DGBlp",
    mapping: "pathname",
    strict: "0",
    reactionsEnabled: "1",
    emitMetadata: "0",
    inputPosition: "bottom",
    lang: "zh-CN",
    lightTheme: "https://vladilena-milize1.github.io/giscus/light.css",
    darkTheme: "https://vladilena-milize1.github.io/giscus/dark.css",
  },
};
