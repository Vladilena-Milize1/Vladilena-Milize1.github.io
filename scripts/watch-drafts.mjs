#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { processArticle } from './import-post.mjs';

const DRAFTS_DIR = path.resolve(process.cwd(), 'drafts');

if (!fs.existsSync(DRAFTS_DIR)) {
  fs.mkdirSync(DRAFTS_DIR, { recursive: true });
}

console.log('======================================================');
console.log('        博客草稿箱全自动监听服务 (Hot Watcher)       ');
console.log('======================================================');
console.log(`\n👀 正在实时监听草稿目录:`);
console.log(`   👉 ${DRAFTS_DIR}\n`);
console.log('💡 使用方式：');
console.log('   只要你在电脑上往 drafts 文件夹放入或保存任意 .md 文件，');
console.log('   系统将自动完成格式化、图片迁移，并推送到博客 src/content/blog/ 中！\n');
console.log('按 Ctrl + C 可停止监听。\n------------------------------------------------------');

// 首次启动先扫描一次已有草稿
const initialFiles = fs.readdirSync(DRAFTS_DIR);
for (const file of initialFiles) {
  if (file.endsWith('.md') || file.endsWith('.mdx')) {
    processArticle(path.join(DRAFTS_DIR, file));
  }
}

// 监听文件变动
const debounceMap = new Map();
fs.watch(DRAFTS_DIR, (_eventType, filename) => {
  if (!filename) return;
  if (!filename.endsWith('.md') && !filename.endsWith('.mdx')) return;

  if (debounceMap.has(filename)) {
    clearTimeout(debounceMap.get(filename));
  }

  const timer = setTimeout(() => {
    debounceMap.delete(filename);
    const fullPath = path.join(DRAFTS_DIR, filename);
    if (fs.existsSync(fullPath)) {
      console.log(`\n⚡ 检测到草稿更新: [${filename}]，正在自动推送到博客...`);
      processArticle(fullPath);
    }
  }, 400);

  debounceMap.set(filename, timer);
});
