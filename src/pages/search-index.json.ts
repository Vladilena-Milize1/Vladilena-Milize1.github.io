import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function cleanMarkdownForSearch(text: string): string {
  if (!text) return '';
  return text
    // 移除图片
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // 提取链接文本
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // 移除代码块
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    // 移除块级数学公式定界符，行内公式保留主要文本
    .replace(/\\\[[\s\S]*?\\\]/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\\\(([\s\S]*?)\\\)/g, ' $1 ')
    .replace(/\$([^\$]+)\$/g, ' $1 ')
    // 移除标题标记
    .replace(/#{1,6}\s+/g, ' ')
    // 移除加粗/斜体/引用标记
    .replace(/[*_~>]/g, ' ')
    // 合并多余空白换行
    .replace(/\s+/g, ' ')
    .trim();
}

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const searchIndex = posts
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((post) => {
      const rawBody = (post as any).body || '';
      return {
        title: post.data.title,
        slug: post.slug,
        date: new Intl.DateTimeFormat('zh-CN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).format(post.data.date),
        tags: post.data.tags || [],
        description: post.data.description || '',
        content: cleanMarkdownForSearch(rawBody).slice(0, 25000),
      };
    });

  return new Response(JSON.stringify(searchIndex), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
