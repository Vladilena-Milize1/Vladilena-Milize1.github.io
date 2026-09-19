#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import matter from 'gray-matter';

const BLOG_CONTENT_DIR = path.resolve(process.cwd(), 'src/content/blog');
const PUBLIC_IMAGES_DIR = path.resolve(process.cwd(), 'public/images');

// 确保目标目录存在
if (!fs.existsSync(BLOG_CONTENT_DIR)) {
  fs.mkdirSync(BLOG_CONTENT_DIR, { recursive: true });
}

function formatDate(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return new Date().toISOString().split('T')[0];
  }
  return d.toISOString().split('T')[0];
}

// 移除 Markdown 标记获取纯文本摘要
function stripMarkdown(text) {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/`{1,3}.*?`{1,3}/gs, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_~>]/g, '')
    .replace(/\r?\n+/g, ' ')
    .trim();
}

// 生成安全的 Slug 文件名（处理中文、空格、连续点等 Windows 特殊命名）
function generateSlug(filename, title) {
  const baseName = path.parse(filename).name;
  let raw = (baseName || title || 'untitled').trim();
  // 移除开头结尾的点和不安全字符
  raw = raw
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\.+$/g, '') // 移除末尾的点（如 "新建 文本文档..md"）
    .replace(/\s+/g, '-') // 将空格转为中划线
    .trim();
  return raw || 'post-' + Date.now();
}

export function processArticle(sourceFilePath) {
  // 清理前后可能存在的双引号或单引号
  const cleanPath = sourceFilePath.replace(/^["']|["']$/g, '').trim();

  if (!fs.existsSync(cleanPath)) {
    console.error(`❌ 未找到文件或目录: ${cleanPath}`);
    return false;
  }

  const stat = fs.statSync(cleanPath);
  if (stat.isDirectory()) {
    console.log(`\n📁 正在扫描目录: ${cleanPath}`);
    const files = fs.readdirSync(cleanPath);
    let successCount = 0;
    for (const file of files) {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        const ok = processArticle(path.join(cleanPath, file));
        if (ok) successCount++;
      }
    }
    return successCount > 0;
  }

  if (!cleanPath.endsWith('.md') && !cleanPath.endsWith('.mdx')) {
    console.warn(`⚠️ 跳过非 Markdown 文件: ${cleanPath}`);
    return false;
  }

  console.log(`\n📄 正在解析: ${cleanPath}`);
  const rawContent = fs.readFileSync(cleanPath, 'utf-8');
  const parsed = matter(rawContent);

  let data = { ...parsed.data };
  let content = parsed.content;

  // 1. 自动提取或补全标题
  if (!data.title) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      data.title = h1Match[1].trim();
      // 移除原正文中的第一个一级标题，防止渲染时和页面标题重复
      content = content.replace(/^#\s+.+$/m, '').trimStart();
    } else {
      const parsedName = path.parse(cleanPath).name.replace(/\.+$/g, '').trim();
      data.title = parsedName || '未命名博文';
    }
  }

  // 2. 自动生成 Slug
  const slug = generateSlug(cleanPath, data.title);

  // 3. 自动生成文章摘要 (description)
  if (!data.description) {
    const paragraphs = content
      .split(/\n\s*\n/)
      .map((p) => stripMarkdown(p))
      .filter((p) => p.length > 5);

    if (paragraphs.length > 0) {
      const summary = paragraphs[0];
      data.description = summary.length > 120 ? summary.slice(0, 117) + '...' : summary;
    } else {
      data.description = `${data.title} - 技术笔记与日常记录`;
    }
  }

  // 4. 自动补齐日期
  if (!data.date) {
    data.date = formatDate(stat.mtime || new Date());
  } else {
    data.date = formatDate(data.date);
  }

  // 5. 自动补齐标签
  if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(/[,，\s]+/).filter(Boolean);
    } else {
      data.tags = ['日常'];
    }
  }

  // 6. 补齐草稿状态
  if (typeof data.draft !== 'boolean') {
    data.draft = false;
  }

  // 7. 处理本地相对路径图片资产迁移
  const sourceDir = path.dirname(cleanPath);
  const targetImageDir = path.join(PUBLIC_IMAGES_DIR, slug);

  content = content.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, imgUrl) => {
    if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://') || imgUrl.startsWith('/') || imgUrl.startsWith('data:')) {
      return match;
    }

    const cleanImgPath = imgUrl.split(/[?#]/)[0];
    const absImgPath = path.resolve(sourceDir, cleanImgPath);

    if (fs.existsSync(absImgPath)) {
      if (!fs.existsSync(targetImageDir)) {
        fs.mkdirSync(targetImageDir, { recursive: true });
      }
      const imgFileName = path.basename(cleanImgPath);
      const destImgPath = path.join(targetImageDir, imgFileName);
      fs.copyFileSync(absImgPath, destImgPath);
      console.log(`  🖼️  图片已迁移: ${cleanImgPath} -> public/images/${slug}/${imgFileName}`);
      return `![${alt}](/images/${slug}/${imgFileName})`;
    } else {
      return match;
    }
  });

  // 8. 输出格式化后的 Markdown
  const formattedMarkdown = matter.stringify(content, data);
  const targetFilePath = path.join(BLOG_CONTENT_DIR, `${slug}.md`);

  fs.writeFileSync(targetFilePath, formattedMarkdown, 'utf-8');

  console.log(`✅ 成功导入文章: [${data.title}]`);
  console.log(`   📌 存储位置: src/content/blog/${slug}.md`);
  console.log(`   🏷️  文章标签: ${data.tags.join(', ')} | 📅 标记日期: ${data.date}`);
  return true;
}

// 主逻辑
const args = process.argv.slice(2);

if (args.length > 0) {
  for (const arg of args) {
    processArticle(arg);
  }
  console.log('\n🎉 所有文件处理完成！运行 "npm run dev" 或刷新网页即可查看。\n');
} else {
  // 无参数时：提供交互式输入提示
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('======================================================');
  console.log('              博客文章智能导入向导');
  console.log('======================================================');
  rl.question('\n请直接把 Markdown 文件拖入本窗口（或粘贴文件完整路径）并按回车：\n> ', (inputPath) => {
    rl.close();
    const target = inputPath.trim();
    if (!target) {
      console.log('⚠️ 未输入任何路径，操作已取消。');
      process.exit(0);
    }
    const success = processArticle(target);
    if (success) {
      console.log('\n🎉 导入完成！运行 "npm run dev" 即可预览。');
    }
  });
}
