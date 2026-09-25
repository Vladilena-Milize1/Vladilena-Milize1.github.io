import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5\-]/g, '');
}

function cleanMarkdownForSearch(text: string): string {
  if (!text) return '';
  return text
    // 移除 HTML 标签
    .replace(/<[^>]+>/g, ' ')
    // 移除图片
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // 提取链接文本
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // 移除代码块
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    // 移除块级与行内数学公式定界符，保留主要文字
    .replace(/\\\[[\s\S]*?\\\]/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/\\\(([\s\S]*?)\\\)/g, ' $1 ')
    .replace(/\$([^\$]+)\$/g, ' $1 ')
    // 移除标题井号
    .replace(/^#{1,6}\s+/gm, '')
    // 移除引用与列表前缀
    .replace(/^>\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    // 移除加粗/斜体/删除线标记
    .replace(/[*_~]/g, ' ')
    // 规范空白符与换行
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim();
}

function parseMarkdownSections(rawMarkdown: string): { heading: string; id: string; text: string }[] {
  const lines = rawMarkdown.split('\n');
  const sections: { heading: string; id: string; text: string }[] = [];

  let currentHeading = '';
  let currentId = '';
  let currentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      if (currentLines.length > 0 || currentHeading) {
        const text = cleanMarkdownForSearch(currentLines.join('\n'));
        if (text || currentHeading) {
          sections.push({
            heading: currentHeading,
            id: currentId,
            text,
          });
        }
      }
      currentHeading = headingMatch[2].trim();
      currentId = slugifyHeading(currentHeading);
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0 || currentHeading) {
    const text = cleanMarkdownForSearch(currentLines.join('\n'));
    if (text || currentHeading) {
      sections.push({
        heading: currentHeading,
        id: currentId,
        text,
      });
    }
  }

  return sections;
}

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const searchIndex = posts
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((post) => {
      const rawBody = (post as any).body || '';
      const sections = parseMarkdownSections(rawBody);
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
        content: cleanMarkdownForSearch(rawBody),
        sections,
      };
    });

  return new Response(JSON.stringify(searchIndex), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
