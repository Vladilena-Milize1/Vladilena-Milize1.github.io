# 个人技术博客系统 (Personal Tech Blog)

基于 **Astro 5 + TypeScript + Tailwind CSS** 打造的现代化、高可维护性、工业级架构个人技术博客，专为在 GitHub 上长期维护与沉淀知识而设计。

---

## 🌟 核心特性与架构亮点

1. **内容与代码彻底解耦**：日常写字完全不需要触碰 UI 代码，所有博文以标准 Markdown / MDX 格式保存在 `src/content/blog/` 中。
2. **强类型元数据守护（Content Collections + Zod）**：文章标头（Frontmatter）受到严格类型约束，漏填必填项或日期格式错误将在本地和 CI 自动拦截，绝不上线破损页面。
3. **PC 端与移动端深度自适应**：
   - 全局杜绝横向晃动（`overflow-x: hidden`）；
   - 代码块与复杂表格支持触屏独立横向平滑滚动；
   - 触控按钮具备 44px+ 舒适交互热区，适配 iOS 底部安全区域。
4. **无闪烁暗黑模式**：预执行脚本注入，彻底避免暗黑模式刷新时的白屏闪烁，设置自动持久化至 `localStorage`。
5. **GitHub Actions 纯自动化部署**：推送代码至 `main` 分支，GitHub 虚拟云端自动校验、静态构建并发布到 GitHub Pages。

---

## 📂 项目工程目录结构

```text
blog/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions 自动化 CI/CD 部署流水线
├── drafts/                         # 🌟【草稿箱】存放任意未发布的 Markdown 原始草稿
│   └── 示例新文章.md
├── public/                         # 纯静态原生资源
│   ├── favicon.svg                 # 博客矢量图标
│   └── images/                     # 自动迁移的文章本地图片资源库
├── scripts/                        # 自动化工具链引擎
│   ├── import-post.mjs             # 智能文章格式化、图片迁移与规范化引擎
│   └── watch-drafts.mjs            # 草稿箱变动实时热监听守护进程
├── src/
│   ├── components/                 # 模块化 UI 组件
│   │   ├── common/
│   │   │   └── ThemeToggle.astro   # 明暗双色主题切换开关
│   │   └── layout/
│   │       ├── Header.astro        # 双端自适应导航头（含移动端抽屉菜单）
│   │       └── Footer.astro        # 页脚（含年份自动递增与平滑回顶）
│   ├── content/                    # 博客内容核心资产层
│   │   ├── config.ts               # 【重要】Zod 强类型 Frontmatter 校验规则
│   │   └── blog/                   # 【正式博文库】已发布文章归档处
│   │       └── first-post.md
│   ├── layouts/                    # 页面骨架布局
│   │   ├── BaseLayout.astro        # 全站 HTML 骨架、SEO Meta 标签与 OpenGraph
│   │   └── PostLayout.astro        # 文章详情排版（舒适视口限制与边距控制）
│   ├── pages/                      # 文件系统路由
│   │   ├── index.astro             # 首页（博主卡片 + 最新发布文章）
│   │   ├── posts/
│   │   │   ├── index.astro         # 全部文章列表归档页
│   │   │   └── [...slug].astro     # 文章详情动态渲染路由
│   │   ├── about.astro             # 关于我页面
│   │   ├── 404.astro               # 优雅 404 错误页
│   │   └── rss.xml.ts              # 自动化 RSS 2.0 订阅源生成器
│   ├── styles/
│   │   └── global.css              # 全局排版样式、代码块与表格横向滚动补丁
│   └── site.config.ts              # 【全站集中配置】博主名、站点标题、社交链接等
├── astro.config.mjs                # Astro 5 核心插件与 Shiki 代码高亮配置
├── import-to-blog.bat              # 🌟 Windows 双击/拖拽一键文章导入脚本
├── start-watcher.bat               # 🌟 Windows 双击启动草稿箱自动监听服务
├── tailwind.config.mjs             # Tailwind CSS 排版与断点配置
├── tsconfig.json                   # TypeScript 严格模式与模块别名映射
└── package.json                    # 依赖清单与运行指令
```

---

## ⚡ 专属附属功能：本地文章自动推送工具链

为了实现“在本地任意位置写完文章，一键自动推送到博客工程中”，本项目内置了全套智能推送工具：

### 1. 草稿箱全自动监听服务 (Hot Watcher) —— 【推荐：最省心】
把文章保存到草稿箱，系统就会自动完成格式化并推送到正式博客库中，适合日常高频写作。
- **启动方式**：直接双击根目录下的 **`start-watcher.bat`**（或在终端运行 `npm run post:watch`）；
- **工作机制**：
  只要你往 `drafts/` 目录中放入、新建或用任何编辑器（Typora / Obsidian / VS Code）保存 `.md` 文件，后台会在 **400 毫秒内**自动捕获并完成格式化、图片迁移，直接推送到 `src/content/blog/`！

### 2. 单篇/批量一键导入工具 (One-Click Importer)
适合将存放在电脑其他任意文件夹（如桌面、笔记库）中的文章随时收录进博客。
- **启动方式**：直接双击根目录下的 **`import-to-blog.bat`**（或在终端运行 `npm run post:import`）；
- **操作方式**：
  - **图形点选**：双击打开后直接按【回车键】，自动弹出 Windows 原生文件选择对话框，直接选中要导入的文章即可；
  - **窗口拖拽**：双击打开后，直接将电脑里的任意 `.md` 文件用鼠标拖入控制台黑框按回车；
  - **图标拖拽**：直接把 `.md` 文件拖拽并松开在 `import-to-blog.bat` 文件图标上。

### 3. 工具底层执行的自动化流水线
无论通过哪种方式导入，底层均会自动完成：
- **标题智能提取与去重**：自动提取文章首行 `# 标题` 作为博文标题，并在正文中移除重复的标题，防止页面双标题冲突；
- **SEO 摘要生成**：自动提取正文前 100 字并剔除 Markdown 符号，自动填入 `description`；
- **日期与标签自动补齐**：自动提取文件修改日期，默认补齐标签与 `draft: false` 标记；
- **相对图片资产自动迁移**：若文章中包含本地相对路径图片（如 `![](./assets/pic.png)`），会自动将图片迁移至 `public/images/<文章名>/`，并自动修正正文中的链接；
- **Windows 特殊命名净化**：自动处理文件名中的空格、多余句点（如 `新建 文本文档..md` 自动规范化为 `新建-文本文档.md`），保证 Astro 路由 100% 编译成功。

---

## 💻 常用开发与维护指令

在项目根目录打开终端，可使用以下指令：

| 指令 | 作用说明 |
| :--- | :--- |
| **`npm run dev`** | 启动本地实时开发预览服务（默认端口 `http://localhost:4321`） |
| **`npm run build`** | 执行 TypeScript 严格类型检查并打包输出生产级静态 HTML 文件（在 `dist/` 目录） |
| **`npm run preview`** | 本地预览生产构建后的静态站点产物 |
| **`npm run post:import`** | 交互式终端导入外部 Markdown 文章 |
| **`npm run post:watch`** | 启动草稿箱目录变动监听服务 |

---

## 🎨 如何进行个人信息定制

你只需要修改单个文件：**`src/site.config.ts`**：
```typescript
export const SITE = {
  title: "你的博客名称",
  author: "你的名字",
  description: "你的个人简介或博客副标题",
  siteUrl: "https://yourdomain.github.io", // 你的实际域名
  navItems: [
    { title: "首页", href: "/" },
    { title: "文章", href: "/posts" },
    { title: "关于", href: "/about" },
  ],
  socials: {
    github: "https://github.com/你的用户名",
    twitter: "https://twitter.com/你的用户名",
    email: "mailto:your-email@example.com",
  },
};
```
保存后，全站所有页面的页眉、页脚、SEO 元标签、社交链接将全局自动同步生效！

---

## 🚀 部署到 GitHub Pages

1. **在 GitHub 上新建仓库**（如 `my-blog`）；
2. **推送本地代码到 GitHub**：
   ```bash
   git remote add origin https://github.com/你的用户名/你的仓库名.git
   git push -u origin main
   ```
3. **开启 GitHub Pages 权限**：
   - 进入你的 GitHub 仓库 -> **Settings** -> **Pages**；
   - 在 **Build and deployment** 下方的 **Source** 选择：`GitHub Actions`；
4. 随后每次你在本地 `git push`，项目中的 `.github/workflows/deploy.yml` 就会自动构建并上线你的个人博客！
