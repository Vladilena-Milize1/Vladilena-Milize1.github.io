/**
 * 统计文章有效字数工具函数
 * 
 * 计数规则：
 * 1. 中文字符（及日韩等字符）每一个计为 1 个字；
 * 2. 英文/拉丁字母与阿拉伯数字：每 2 个折算为 1 个字（不足 2 个向上取整，如 3 个字母算 2 个字）；
 * 3. 严格清洗 Markdown 语法标记（如图片链接、标题符号、代码块定界符、LaTeX 语法命令、HTML 标签等），避免非正文字符干扰计数。
 */

export function countWords(content: string): number {
  if (!content) return 0;

  // 1. 规范化 Unicode 字符（例如将全角数字/字母转为半角），并剥离可能存在的 Frontmatter
  let text = content
    .normalize('NFKC')
    .replace(/^---[\s\S]*?---\s*/, '');

  // 2. 清洗 Markdown / LaTeX / HTML 等结构性标记
  text = text
    // 移除图片引用 ![alt](url)
    .replace(/!\[.*?\]\(.*?\)/g, '')
    // 提取链接文本 [text](url) -> text
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    // 移除代码块语言标识与定界符（保留代码具体内容）
    .replace(/```[a-zA-Z0-9_-]*\n?/g, ' ')
    .replace(/```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    // 移除 LaTeX 数学公式中的命令关键字（如 \mathrm, \times, \frac, \mathbf, \rho 等）
    .replace(/\\[a-zA-Z]+/g, ' ')
    // 移除数学公式界定符 ($$, $, \[, \], \(, \))
    .replace(/(\$\$|\\\[|\\\]|\\\(|\\\))/g, ' ')
    .replace(/\$/g, ' ')
    // 移除 HTML 标签
    .replace(/<[^>]+>/g, ' ')
    // 移除 Markdown 标头、引用、分割线符号 (#, >, *, _, ~, =)
    .replace(/[#*_~>=]/g, ' ')
    // 移除行首无序/有序列表标记 (如 "- ", "+ ", "1. ")
    .replace(/^\s*[-+*]\s+/gm, ' ')
    .replace(/^\s*\d+\.\s+/gm, ' ');

  // 3. 匹配汉字及 CJK 字符（含扩展区）、日文假名、韩文字符
  const cjkMatches = text.match(/[\u4e00-\u9fa5\u3400-\u4dbf\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af]/g);
  const cjkCount = cjkMatches ? cjkMatches.length : 0;

  // 4. 匹配字母与数字 [0-9a-zA-Z]
  const alnumMatches = text.match(/[0-9a-zA-Z]/g);
  const alnumCount = alnumMatches ? alnumMatches.length : 0;

  // 5. 按照“数字/字母两个算一个字”进行折算（向上取整）
  const alnumWordCount = Math.ceil(alnumCount / 2);

  return cjkCount + alnumWordCount;
}

/**
 * 格式化字数显示
 * @param count 字数
 * @returns 格式化后的字数字符串，例如 "2,297 字"
 */
export function formatWordCount(count: number): string {
  return `${count.toLocaleString('zh-CN')} 字`;
}

