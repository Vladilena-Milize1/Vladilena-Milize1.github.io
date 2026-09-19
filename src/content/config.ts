import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().max(100, "标题不能超过100字符"),
    description: z.string(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default(["未分类"]),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog,
};

