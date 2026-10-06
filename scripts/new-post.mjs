import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const [id] = process.argv.slice(2);
if (!id) throw new Error('Usage: pnpm new:post <article-id>');

const contentDirectory = fileURLToPath(new URL('../src/content/blog/', import.meta.url));
const target = resolve(contentDirectory, `${id}.md`);
const targetRelative = relative(contentDirectory, target);
if (targetRelative.startsWith(`..${sep}`) || targetRelative === '..') {
  throw new Error('Article paths must stay inside src/content/blog/.');
}

const date = new Date().toISOString().slice(0, 10);
const content = `---
title: ${JSON.stringify(id)}
description: "填写文章摘要"
pubDate: "${date}"
lang: "zh-CN"
tags: []
draft: true
---

## 开始写作

`;

await mkdir(dirname(target), { recursive: true });
await writeFile(target, content, { flag: 'wx' });
console.log(`Created ${targetRelative}. Edit the title, description, and body before publishing.`);
