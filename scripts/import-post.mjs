#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { execSync } from 'node:child_process';
import matter from 'gray-matter';

const BLOG_CONTENT_DIR = path.resolve(process.cwd(), 'src/content/blog');
const PUBLIC_IMAGES_DIR = path.resolve(process.cwd(), 'public/images');

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

function stripMarkdown(text) {
  return text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\\\[[\s\S]*?\\\]/g, '')
    .replace(/\$\$[\s\S]*?\$\$/g, '')
    .replace(/\\\(([\s\S]*?)\\\)/g, '$1')
    .replace(/\$([^\$]+)\$/g, '$1')
    .replace(/`{1,3}.*?`{1,3}/gs, '')
    .replace(/#{1,6}\s+/g, '')
    .replace(/[*_~>]/g, '')
    .replace(/\r?\n+/g, ' ')
    .trim();
}

function generateSlug(filename, title) {
  const baseName = path.parse(filename).name;
  let raw = (baseName || title || 'untitled').trim();
  raw = raw
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\.+$/g, '')
    .replace(/\s+/g, '-')
    .trim();
  return raw || 'post-' + Date.now();
}

export function processArticle(sourceFilePath) {
  const cleanPath = sourceFilePath.replace(/^["']|["']$/g, '').trim();

  if (!fs.existsSync(cleanPath)) {
    console.error(`❌ 未找到文件或目录: ${cleanPath}`);
    return false;
  }

  const stat = fs.statSync(cleanPath);
  if (stat.isDirectory()) {
    console.log(`\n📁 正在扫描目录: ${cleanPath}`);
    const files = fs.readdirSync(cleanPath);
    let count = 0;
    for (const file of files) {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
        if (processArticle(path.join(cleanPath, file))) count++;
      }
    }
    return count > 0;
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

  // 1. 标题提取
  if (!data.title) {
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      data.title = h1Match[1].trim();
      content = content.replace(/^#\s+.+$/m, '').trimStart();
    } else {
      const parsedName = path.parse(cleanPath).name.replace(/\.+$/g, '').trim();
      data.title = parsedName || '未命名博文';
    }
  }

  // 2. Slug
  const slug = generateSlug(cleanPath, data.title);

  // 3. 摘要
  if (!data.description) {
    const paragraphs = content
      .split(/\n\s*\n/)
      .map((p) => stripMarkdown(p))
      .filter((p) => p.length > 5);

    if (paragraphs.length > 0) {
      const summary = paragraphs[0];
      data.description = summary.length > 120 ? summary.slice(0, 117) + '...' : summary;
    } else {
      data.description = `${data.title} - 技术与日常记录`;
    }
  }

  // 4. 日期
  if (!data.date) {
    data.date = formatDate(stat.mtime || new Date());
  } else {
    data.date = formatDate(data.date);
  }

  // 5. 标签
  if (!data.tags || !Array.isArray(data.tags) || data.tags.length === 0) {
    if (typeof data.tags === 'string') {
      data.tags = data.tags.split(/[,，\s]+/).filter(Boolean);
    } else {
      data.tags = ['技术'];
    }
  }

  // 6. 草稿状态
  if (typeof data.draft !== 'boolean') {
    data.draft = false;
  }

  // 7. 图片迁移
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
    }
    return match;
  });

  // 8. 写入文件
  const formattedMarkdown = matter.stringify(content, data);
  const targetFilePath = path.join(BLOG_CONTENT_DIR, `${slug}.md`);

  fs.writeFileSync(targetFilePath, formattedMarkdown, 'utf-8');

  console.log(`✅ 成功导入文章: [${data.title}]`);
  console.log(`   📌 存储位置: src/content/blog/${slug}.md`);
  console.log(`   🏷️  文章标签: ${data.tags.join(', ')} | 📅 标记日期: ${data.date}`);
  return true;
}

// 弹出 Windows 原生文件选择对话框
function openWindowsFileDialog() {
  try {
    const psCmd = `powershell -NoProfile -Sta -Command "Add-Type -AssemblyName System.Windows.Forms; $f = New-Object System.Windows.Forms.OpenFileDialog; $f.Filter = 'Markdown 文件 (*.md;*.mdx)|*.md;*.mdx|所有文件 (*.*)|*.*'; $f.Title = '请选择要导入博客的 Markdown 文章'; if ($f.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { Write-Output $f.FileName }"`;
    const selected = execSync(psCmd, { encoding: 'utf-8' }).trim();
    return selected || null;
  } catch (err) {
    return null;
  }
}

import { fileURLToPath } from 'node:url';

// 仅当作为主脚本直接运行时执行命令行交互
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  const args = process.argv.slice(2);

  if (args.length > 0) {
    for (const arg of args) {
      processArticle(arg);
    }
    console.log('\n🎉 所有文件处理完成！运行 "npm run dev" 即可预览。\n');
  } else {
    console.log('======================================================');
    console.log('              博客文章智能导入工具向导');
    console.log('======================================================');
    console.log('提示：');
    console.log('  1. 你可以直接把 Markdown 文件拖入本控制台窗口按回车');
    console.log('  2. 或者直接按【回车键】，系统将弹出文件选择窗口供你点选\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question('请输入文件路径（或直接按回车浏览选择）：\n> ', (inputPath) => {
      rl.close();
      let target = inputPath.trim().replace(/^["']|["']$/g, '');

      if (!target) {
        console.log('\n正在弹出 Windows 文件选择窗口...');
        target = openWindowsFileDialog();
        if (!target) {
          console.log('⚠️ 未选择任何文件，操作已退出。');
          process.exit(0);
        }
      }

      const success = processArticle(target);
      if (success) {
        console.log('\n🎉 导入完成！运行 "npm run dev" 即可实时预览。\n');
      }
    });
  }
}

