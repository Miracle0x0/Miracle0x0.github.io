import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: ({ image }) => z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    lang: z.enum(['en', 'zh-CN']),
    tags: z.array(z.string()),
    draft: z.boolean(),
    heroImage: image().optional(),
    heroImageAlt: z.string().optional(),
  }).refine(
    (post) => !post.heroImage || Boolean(post.heroImageAlt?.trim()),
    { message: 'Provide heroImageAlt when using heroImage.', path: ['heroImageAlt'] },
  ),
});

export const collections = { blog };
