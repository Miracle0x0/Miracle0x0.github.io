---
title: "Markdown 写作示例"
description: "用于本地预览的草稿，展示文章结构、代码和表格。"
pubDate: "2026-10-06"
lang: "zh-CN"
tags: ["Astro", "写作"]
draft: true
---

这是一篇本地草稿，不会出现在生产站点。创建自己的文章后可以删除此文件。

## 编写正文

在 Markdown 中直接编写段落、**重点文字**和[链接](https://docs.astro.build/)。页面标题来自文件顶部的 `title`，正文从二级标题开始，目录自动生成。

### 代码块

为代码块标注语言即可获得语法高亮。

```python
def greet(name: str) -> str:
    return f"Hello, {name}!"
```

### 列表与表格

- `pnpm dev`：本地预览，保存后自动更新。
- `pnpm build`：生成用于发布的静态网页。

| 内容 | 编辑位置 |
| --- | --- |
| 文章正文 | `src/content/blog/*.md` |
| 首页简介 | `src/content/home/overview.md` |
| 字体与颜色 | `src/styles/global.css` |

> 图片、字体和模板与正文分开维护；日常发文只需要修改 Markdown。

## 发布文章

完成真实内容后，将 `draft` 改为 `false`。文章合并或推送到 `main` 后，GitHub Actions 会构建并发布网站。
