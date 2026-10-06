import assert from 'node:assert/strict';
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const project = fileURLToPath(new URL('../', import.meta.url));
const astroManifest = JSON.parse(await readFile(join(project, 'node_modules/astro/package.json'), 'utf8'));
const astro = join(project, 'node_modules/astro', astroManifest.bin.astro);

function build(root) {
  return spawnSync(process.execPath, [astro, 'build', '--root', root], {
    cwd: root, encoding: 'utf8', env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' },
  });
}

async function workspace() {
  const root = await mkdtemp(join(tmpdir(), 'profile-astro-test-'));
  for (const name of ['src', 'public', 'package.json', 'astro.config.mjs', 'tsconfig.json']) {
    await cp(join(project, name), join(root, name), { recursive: true });
  }
  await symlink(join(project, 'node_modules'), join(root, 'node_modules'), 'dir');
  return root;
}

test('Markdown publishing generates real HTML and excludes drafts', async (t) => {
  const root = await workspace();
  try {
    const articles = join(root, 'src/content/blog/research');
    await mkdir(articles, { recursive: true });
    await mkdir(join(root, 'src/assets/blog'), { recursive: true });
    await cp(join(project, 'public/assets/img/avatar.png'), join(root, 'src/assets/blog/fixture.png'));
    const article = `---
title: "Rendering & images"
description: "A build verification article."
pubDate: "2026-01-02"
lang: "zh-CN"
tags: ["Systems"]
draft: false
heroImage: "../../../assets/blog/fixture.png"
heroImageAlt: "Fixture cover"
---

## Rendering

真实 Markdown 正文。A real static page with **emphasis**.

### Code

\`\`\`python
print("static html")
\`\`\`

| Name | Value |
| --- | --- |
| Sample | 42 |

![Inline fixture](../../../assets/blog/fixture.png)
`;
    await writeFile(join(articles, 'published.md'), article);
    await writeFile(join(articles, 'draft.md'), article.replace('draft: false', 'draft: true').replace('Rendering & images', 'Private draft marker'));
    await writeFile(join(articles, 'older.md'), article.replace('2026-01-02', '2025-01-01').replace('Rendering & images', 'Older article'));

    await t.test('builds nested articles, images, metadata, feeds and sitemap', async () => {
      const result = build(root);
      assert.equal(result.status, 0, result.stdout + result.stderr);
      const html = await readFile(join(root, 'dist/blog/research/published/index.html'), 'utf8');
      assert.match(html, /<html lang="zh-CN"/);
      assert.match(html, /真实 Markdown 正文/);
      assert.match(html, /<strong>emphasis<\/strong>/);
      assert.match(html, /<table>/);
      assert.match(html, /class="astro-code/);
      assert.match(html, /href="#rendering"/);
      assert.match(html, /id="rendering"/);
      assert.match(html, /alt="Inline fixture"/);
      assert.match(html, /alt="Fixture cover"/);
      assert.match(html, /https:\/\/miracle0x0.github.io\/blog\/research\/published\//);
      assert.doesNotMatch(html, /<script\b/);
      const list = await readFile(join(root, 'dist/blog/index.html'), 'utf8');
      assert.ok(list.indexOf('/blog/research/published/') < list.indexOf('/blog/research/older/'));
      assert.doesNotMatch(list, /Private draft marker|hello-astro/);
      await assert.rejects(readFile(join(root, 'dist/blog/research/draft/index.html')), { code: 'ENOENT' });
      await assert.rejects(readFile(join(root, 'dist/blog/hello-astro/index.html')), { code: 'ENOENT' });
      const rss = await readFile(join(root, 'dist/rss.xml'), 'utf8');
      assert.match(rss, /https:\/\/miracle0x0.github.io\/blog\/research\/published\//);
      assert.doesNotMatch(rss, /Private draft marker|hello-astro/);
      const sitemap = await readFile(join(root, 'dist/sitemap-0.xml'), 'utf8');
      assert.match(sitemap, /\/blog\/research\/published\//);
      assert.doesNotMatch(sitemap, /\/404|\/draft\/|hello-astro/);
      const home = await readFile(join(root, 'dist/index.html'), 'utf8');
      assert.match(home, /Ph.D. Student/);
      assert.match(home, /PopFetcher/);
      assert.match(home, /href="https:\/\/hust.edu.cn\/"/);
      const notFound = await readFile(join(root, 'dist/404.html'), 'utf8');
      assert.match(notFound, /noindex, nofollow/);
    });

    await t.test('missing required metadata fails the build', async () => {
      await writeFile(join(articles, 'published.md'), article.replace('description: "A build verification article."\n', ''));
      const result = build(root);
      assert.notEqual(result.status, 0);
      assert.match(result.stdout + result.stderr, /description/);
    });

    await t.test('missing local images fail the build', async () => {
      await writeFile(join(articles, 'published.md'), article.replace('![Inline fixture](../../../assets/blog/fixture.png)', '![Missing image](../../../assets/blog/missing.png)'));
      const result = build(root);
      assert.notEqual(result.status, 0);
      assert.match(result.stdout + result.stderr, /missing\.png/);
    });
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('new:post creates a draft without replacing existing content', async () => {
  const root = await mkdtemp(join(tmpdir(), 'profile-new-post-test-'));
  try {
    await mkdir(join(root, 'scripts'));
    await cp(join(project, 'scripts/new-post.mjs'), join(root, 'scripts/new-post.mjs'));
    const run = (id) => spawnSync(process.execPath, [join(root, 'scripts/new-post.mjs'), id], { encoding: 'utf8' });
    assert.equal(run('research/new-article').status, 0);
    const path = join(root, 'src/content/blog/research/new-article.md');
    const content = await readFile(path, 'utf8');
    assert.match(content, /draft: true/);
    assert.match(content, /pubDate: "\d{4}-\d{2}-\d{2}"/);
    assert.notEqual(run('research/new-article').status, 0);
    assert.equal(await readFile(path, 'utf8'), content);
    assert.notEqual(run('../outside').status, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
