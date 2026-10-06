# Junyi Zhang 的个人主页与博客

基于 Astro 官方 Blog 模板的静态站点，首页展示学术经历和论文，博客使用 Markdown 写作。页面在构建时生成 HTML，发布到 [GitHub Pages](https://miracle0x0.github.io/)。

## 首次运行

准备好 [mise](https://mise.jdx.dev/getting-started.html) 和 GNU Make 后，在仓库根目录执行：

```bash
make install
make dev
```

打开 `http://127.0.0.1:4321`。保存 Markdown 或样式后，开发预览自动更新。Makefile 通过 `mise exec -- pnpm` 调用项目工具，无需先激活 shell。项目通过 `mise.toml` 固定 Node.js 和 pnpm；新增开发工具优先记录到项目级 `mise.toml`，工程依赖使用 pnpm 安装。

## 常用命令

直接运行 `make` 或 `make help` 查看帮助。

| 命令 | 用途 |
| --- | --- |
| `make install` | 安装 mise 项目工具，按锁文件安装依赖 |
| `make dev` | 启动开发预览，包含草稿 |
| `make preview` | 先构建，再启动生产预览 |
| `make build` | 生成静态网站到 `dist/` |
| `make check` | 检查 Astro 和 TypeScript |
| `make test` | 运行自动化测试 |
| `make verify` | 依次执行检查、测试和构建，失败即停止 |
| `make new-post SLUG=my-first-post` | 新建 Markdown 草稿 |
| `make status` / `make stop` | 查看 / 停止当前项目的开发及预览服务 |
| `make logs` / `make preview-logs` | 查看开发 / 生产预览服务日志 |
| `make clean` | 删除 `dist/` 和 `.astro/` 构建产物，保留源码与依赖 |

开发与生产预览默认监听 `0.0.0.0:4321`，本机通过 `http://127.0.0.1:4321` 访问。需要更换端口时执行 `make dev PORT=4323` 或 `make preview PORT=4323`；仅允许本机访问时使用 `HOST=127.0.0.1`。底层 pnpm 命令仍可直接使用，例如 `mise exec -- pnpm build`。

## 写文章

创建一篇草稿：

```bash
make new-post SLUG=my-first-post
```

命令生成 `src/content/blog/my-first-post.md`，填入当天的 UTC 日期并标记 `draft: true`；已有同名文件时会报错，不覆盖内容。也可以直接新建 Markdown 文件：

```markdown
---
title: "我的第一篇文章"
description: "用一两句话介绍文章内容。"
pubDate: "2026-10-06"
lang: "zh-CN"
tags: ["Systems"]
draft: true
---

## 开始

在这里写正文，支持 **强调**、链接、列表、表格和代码块。
```

标题由 `title` 生成，正文从 `##` 开始；二级、三级标题自动进入目录。代码块注明语言（如 `python`、`cpp`、`bash`），即可获得浅色和深色语法高亮。

| 字段 | 用途 |
| --- | --- |
| `title` | 必填，标题 |
| `description` | 必填，文章列表摘要和页面描述 |
| `pubDate` | 必填，`YYYY-MM-DD`；日期按 UTC 显示 |
| `updatedDate` | 可选，最后更新日期 |
| `lang` | 必填，`zh-CN` 或 `en` |
| `tags` | 必填，标签数组；没有标签填写 `[]` |
| `draft` | 必填，`true` 为草稿，`false` 为公开文章 |
| `heroImage` | 可选，封面图片相对 Markdown 文件的路径 |
| `heroImageAlt` | 使用封面时必填，说明图片内容 |

`make dev` 中可预览草稿，页面会显示草稿标记。生产构建不会生成草稿详情页，草稿也不会进入文章列表、RSS 或 sitemap。仓库自带的 `hello-astro.md` 是可删除的写作示例，默认保持草稿状态。

文章地址由文件路径决定：`my-first-post.md` 对应 `/blog/my-first-post/`，`research/moe.md` 对应 `/blog/research/moe/`。移动或重命名文件会改变 URL。`pubDate` 只用于日期显示和排序，未来日期不会自动安排发布。

## 添加图片与附件

把文章图片放入 `src/assets/blog/`，使用相对于当前 Markdown 文件的路径。例如 `src/content/blog/my-first-post.md` 引用 `src/assets/blog/diagram.png`：

```markdown
![专家预取流程图](../../assets/blog/diagram.png)
```

封面使用同样的相对路径：

```yaml
heroImage: "../../assets/blog/diagram.png"
heroImageAlt: "专家预取流程图"
```

嵌套目录中的文章需要相应调整 `../` 层级。本地图片由 Astro 处理，缺失图片会使构建报错。

PDF、BibTeX 等原样下载的附件放在 `public/assets/`，在文章中使用以 `/` 开头的站点路径，例如 `[下载附件](/assets/files/report.pdf)`；使用前先添加对应文件。

## 修改主页和模板

| 修改内容 | 编辑位置 |
| --- | --- |
| 姓名、身份、机构、邮箱、社交链接 | `src/data/site.ts` |
| 简介、研究方向、动态、教育、实习 | `src/content/home/overview.md` |
| 荣誉 | `src/content/home/honors.md` |
| 论文及作者、会议、资源链接 | `src/data/publications.ts` |
| 头像原图 | `src/assets/avatar.jpg`，构建时生成适配不同像素密度的 WebP |
| CV、论文图片和 BibTeX | `public/assets/` |
| 首页布局 | `src/layouts/HomeLayout.astro` |
| 文章模板 | `src/layouts/BlogPost.astro` |
| 字体、主题颜色与全局样式 | `src/styles/global.css`；桌面首页预加载字体位于 `src/components/BaseHead.astro` |
| Markdown 排版 | `src/styles/prose.css` |

日常发文只需要 Markdown；调整页面结构时才编辑 Astro 模板。首页正文与博客文章分开管理，论文使用结构化数据，其中可选的 `titleUrl` 用于设置论文标题链接，`links` 用于设置 PDF、Slides、BibTeX 等资源按钮。全站跟随操作系统的浅色或深色偏好。

## 自定义字体

将有权使用的字体文件放入 `public/assets/fonts/`，优先使用 WOFF2。在 `src/styles/global.css` 添加字体声明，并修改对应变量：

```css
@font-face {
  font-family: 'My Font';
  src: url('/assets/fonts/my-font.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

:root {
  --font-body: 'My Font', serif;
  --font-heading: var(--font-body);
  --font-code: 'Ubuntu Mono', monospace;
}
```

分别为实际提供的粗体、斜体添加声明；可变字体将 `font-weight` 写成支持的范围。桌面首页预加载正文字体，更换字体时同步修改 `src/components/BaseHead.astro` 中的预加载路径；其他页面和字体按实际使用加载。默认 Crimson Pro 和 Ubuntu Mono 文件只包含拉丁字符，中文使用系统中文字体；要统一中文外观，需要自行提供覆盖中文字符的字体。字体变量应用于所有页面，文章不需要单独设置字体。

## 检查与构建

```bash
make verify
make preview
```

`make verify` 顺序执行 `check`、`test` 和 `build`，也可以单独运行对应的 make 目标。`check` 检查 Astro 和 TypeScript；`test` 在临时目录构建真实文章，验证 Markdown、图片、草稿隔离、RSS、sitemap 和错误报告，并检查草稿创建命令；`build` 输出 `dist/`。`make preview` 会先构建，再启动生产预览，其中不包含草稿。开发与预览使用同一默认端口 `4321`，切换前可执行 `make stop`，或为另一个服务指定不同端口。

通过 `make status` 查看当前项目的后台服务状态，`make logs` 和 `make preview-logs` 分别查看开发与生产预览日志。安装、内容校验或构建报错时直接修正终端指出的源文件，不手工修改生成的 HTML。`dist/` 不提交到 Git。

## 发布到 GitHub Pages

首次启用时，在仓库 **Settings → Pages → Build and deployment → Source** 中选择 **GitHub Actions**。站点配置位于 `astro.config.mjs`，当前使用 `https://miracle0x0.github.io`，这是用户站点，不需要仓库名 `base` 前缀。

完成文章后将 `draft` 改为 `false`，检查改动，再提交并推送到工作分支，通过 PR 合并到 `main`。也可以按仓库协作规则直接推送到 `main`。不需要运行单独的上传脚本。

```text
Write Markdown -> Local preview -> Push / merge to main
                                         |
                                         v
                              mise + pnpm install
                                         |
                                         v
                                Check -> Test -> Build
                                         |
                                         v
                               dist -> GitHub Pages
```

| 工作流 | 触发方式 | 行为 |
| --- | --- | --- |
| `Check site` | 面向 `main` 的 PR，或在 Actions 页面手动运行 | 安装依赖、检查、测试和构建，不更新生产站点 |
| `Deploy site` | `main` 推送，或在 Actions 页面选择 `main` 手动运行 | 完成相同验证后，将 `dist/` 发布到 Pages |

两个工作流共用 `.github/actions/build-site/action.yml`，按工具版本和锁文件缓存 pnpm 依赖，并按图片及组件内容缓存 Astro 图片处理结果。普通分支推送不重复触发 PR 检查；没有 PR 的分支可手动运行 `Check site`。合并到 `main` 后仍完整检查、测试和构建，再发布产物。

在仓库 **Actions** 页面查看构建日志与部署结果；成功后可打开首页、文章直达链接和 `/rss.xml`。失败时工作流停止，生产站点不会被本次失败的构建替换。更换域名时同步更新 Astro 的 `site`、`public/robots.txt`、Pages 自定义域名设置和 DNS。

## 许可与来源

原项目使用 [CC0](LICENSE)。Astro Blog 模板和本地字体的来源及许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。
