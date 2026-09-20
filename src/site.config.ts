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
    serverURL: string;
    lang?: string;
    login?: "enable" | "disable" | "force";
    meta?: string[];
    requiredMeta?: string[];
    pageSize?: number;
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
    serverURL: "", // Waline 服务端 URL，如 https://waline.yourdomain.com 或 Vercel 部署地址
    lang: "zh-CN",
    login: "enable", // 支持 GitHub 授权登录，同时支持免登录匿名评论
    meta: ["nick", "mail", "link"],
    requiredMeta: [], // 匿名评论无必填项约束
    pageSize: 10,
  },
};
