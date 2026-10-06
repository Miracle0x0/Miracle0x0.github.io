# Astro 博客迁移计划

## 1. 目标与当前工作范围

本次迁移采用 **Astro 官方 Blog 模板，保留现有学术主页风格，并新增博客栏目**。首页继续展示个人介绍、研究方向、教育经历、实习、论文和荣誉；文章通过 Markdown 编写，由 Astro 在构建时生成静态 HTML，最终继续托管在 GitHub Pages。

前端依赖统一使用 **pnpm**。开发工具缺失时优先使用 **mise 的项目级配置**安装，Node.js、pnpm 的版本在仓库中固定。现已在本地分支完成工程改造；第 2 节保留迁移前分析，第 9 节记录实施状态。本次交付范围为本地实现、审查与提交，不推送或发布站点。

| 项目 | 已确认状态 |
| --- | --- |
| 分析日期 | 2026-10-06 |
| 仓库 | `Miracle0x0/Miracle0x0.github.io` |
| 起始提交 | `496772d`，`docs: update internship` |
| 开发分支 | 已从 `main` 创建并切换到本地 `feat/astro-rewrite` |
| 模板方向 | 用户已确认采用官方 Blog 模板，并保留学术主页风格 |
| 工具要求 | pnpm；缺少开发工具时优先通过 mise 安装到项目配置 |
| 当前实施状态 | Astro 工程、Markdown 博客、写作命令、字体配置、README 和 CI 已完成；未推送或变更 Pages 设置 |

## 2. 迁移前技术栈与内容结构

### 2.1 现状判断

当前仓库实际是 **Jekyll 学术个人主页**，还不是具有文章列表和详情页的博客。它已经能够把 Markdown 转成 HTML：`index.md` 提供正文，Liquid 负责插入布局和论文数据，Jekyll 生成静态页面。迁移的价值在于统一内容模型、补齐博客能力和简化开发链路，而不是首次实现 Markdown 渲染。

| 层次 | 当前实现 | 本地证据 |
| --- | --- | --- |
| 运行时与构建 | Ruby `3.1.7`、Jekyll `4.4.1`、WEBrick `1.9.2` | [Gemfile](https://github.com/Miracle0x0/Miracle0x0.github.io/blob/496772dd1dfab042ef4b8f6612e9486f1fb57685/Gemfile)、[Dockerfile](https://github.com/Miracle0x0/Miracle0x0.github.io/blob/496772dd1dfab042ef4b8f6612e9486f1fb57685/Dockerfile) |
| 主题 | Minimal Light；声明 `remote_theme: yaoyao-liu/minimal-light`，同时维护本地布局和样式 | [_config.yml](https://github.com/Miracle0x0/Miracle0x0.github.io/blob/496772dd1dfab042ef4b8f6612e9486f1fb57685/_config.yml)、[_layouts/homepage.html](https://github.com/Miracle0x0/Miracle0x0.github.io/blob/496772dd1dfab042ef4b8f6612e9486f1fb57685/_layouts/homepage.html) |
| 页面内容 | 一个首页 Markdown 文件，包含 About Me、Research Interests、Recent News、Education、Internship、Selected Honors、Others | [index.md](https://github.com/Miracle0x0/Miracle0x0.github.io/blob/496772dd1dfab042ef4b8f6612e9486f1fb57685/index.md) |
| 论文列表 | YAML 数据经 Liquid 循环渲染；作者和会议字段嵌入 HTML | [_data/publications.yml](https://github.com/Miracle0x0/Miracle0x0.github.io/blob/496772dd1dfab042ef4b8f6612e9486f1fb57685/_data/publications.yml)、[_includes/publications.md](https://github.com/Miracle0x0/Miracle0x0.github.io/blob/496772dd1dfab042ef4b8f6612e9486f1fb57685/_includes/publications.md) |
| 样式 | Sass/CSS、亮暗两套样式文件，按系统配色切换 | [_sass/minimal-light.scss](https://github.com/Miracle0x0/Miracle0x0.github.io/blob/496772dd1dfab042ef4b8f6612e9486f1fb57685/_sass/minimal-light.scss)、[assets/css/publications.css](https://github.com/Miracle0x0/Miracle0x0.github.io/blob/496772dd1dfab042ef4b8f6612e9486f1fb57685/assets/css/publications.css) |
| 字体与图标 | Google Fonts 的 Crimson Pro / Ubuntu Mono，cdnjs 的 Academicons / Font Awesome | [assets/css/font.css](https://github.com/Miracle0x0/Miracle0x0.github.io/blob/496772dd1dfab042ef4b8f6612e9486f1fb57685/assets/css/font.css)、[_layouts/homepage.html](https://github.com/Miracle0x0/Miracle0x0.github.io/blob/496772dd1dfab042ef4b8f6612e9486f1fb57685/_layouts/homepage.html) |
| 浏览器脚本 | favicon 定时检测配色；旧式 iPhone viewport 调整 | [assets/js/favicon-switcher.js](https://github.com/Miracle0x0/Miracle0x0.github.io/blob/496772dd1dfab042ef4b8f6612e9486f1fb57685/assets/js/favicon-switcher.js)、[assets/js/scale.fix.js](https://github.com/Miracle0x0/Miracle0x0.github.io/blob/496772dd1dfab042ef4b8f6612e9486f1fb57685/assets/js/scale.fix.js) |
| 本地开发 | Docker Compose + Makefile，主机 `54000` 映射容器 `4000` | [docker-compose.yml](https://github.com/Miracle0x0/Miracle0x0.github.io/blob/496772dd1dfab042ef4b8f6612e9486f1fb57685/docker-compose.yml)、[Makefile](https://github.com/Miracle0x0/Miracle0x0.github.io/blob/496772dd1dfab042ef4b8f6612e9486f1fb57685/Makefile) |
| 发布 | GitHub Pages，`main` 分支根目录，`build_type: legacy`，当前无自定义域名 | 本次只读调用 GitHub Pages API 的结果 |

当前没有 `package.json`、前端框架、文章集合、博客路由、RSS、站点地图，也没有仓库内的 GitHub Actions 工作流。`Gemfile.lock` 虽存在于本机，但被 `.gitignore` 忽略且未被 Git 跟踪；因此不能将本机锁文件视为其他机器可复现的依赖基线。`Gemfile` 也没有声明 `jekyll-remote-theme`，迁移时应以本地生效的模板和内容为依据，不假定本地构建已经加载远程主题插件。

已通过 `gh api repos/Miracle0x0/Miracle0x0.github.io/pages` 核实：站点地址为 `https://miracle0x0.github.io/`，来源为 `main:/`，状态为 `built`，`cname` 为 `null`。仓库两份 `CNAME` 均只有换行，不代表配置了独立域名。

### 2.2 视觉与布局分析

当前风格是信息密度适中的学术主页：白底、蓝色标题和链接、灰色正文、圆形头像、较多留白，几乎没有装饰性卡片。桌面采用左侧个人资料、右侧正文的两栏布局，论文条目使用缩略图、会议徽标、作者信息和小尺寸资源按钮。

| 视觉维度 | 当前值或行为 | 迁移方向 |
| --- | --- | --- |
| 页面宽度 | `.wrapper` 为 `960px`，资料栏 `232px`，内容栏 `650px` | 保留接近现有的比例，使用 CSS Grid 和弹性宽度 |
| 桌面资料栏 | `float: left` + `position: fixed`，正文向右浮动 | 改为 Grid 内的 `sticky`，保留阅读时可见的资料栏 |
| 正文字体 | Crimson Pro，`16px / 1.5`；邮箱使用 Ubuntu Mono | 保留衬线气质；文章正文单独采用更舒展的字号、行高和行宽 |
| 浅色主题 | 背景 `#fff`，正文 `#595959`，标题 `#043361`，链接 `#39c` | 整理成一组 CSS 变量，统一首页和博客 |
| 深色主题 | 背景 `#20212b`，正文 `#dadbdf`，强调色约 `#3eb7f0` | 保留系统配色切换，统一代码、表格、引用和论文按钮颜色 |
| 响应式 | `960px` 以下取消固定两栏；`480px` 以下论文条目上下排列 | 以实际内容宽度调整断点，重点检查平板及窄屏 |
| 论文缩略图 | 固定高度、裁剪、圆角与阴影 | 保留裁切展示，桌面图片高度接近右侧文字区；窄屏使用固定比例裁切 |
| 文章排版 | 现有 `pre` 最大宽度 `500px`，缺少独立长文布局 | 新增专用文章样式，代码和宽表格在局部滚动 |

视觉核对包括源码审查，以及使用本机 Chrome 对已有 `_site/index.html` 进行 `1280×1100` 和 `390×1100` 预览。该产物时间早于当前源文件，且预览时页面资源加载超时，因此只用于核对整体布局；本次没有重新构建 Jekyll、完成深色模式截图或测量性能，不能据此宣称当前线上站点已通过完整视觉验证。

### 2.3 迁移时应解决的问题

| 问题 | 证据与影响 | 处理方式 |
| --- | --- | --- |
| SEO 仍带模板信息 | canonical 指向 `minimal-light-theme.yliu.me`，description 和 keywords 也是模板文案 | 使用本站域名，按页面生成标题、描述和 canonical |
| 个人身份描述不一致 | 配置与自我介绍写硕士，Education 已列出 `2026.09 - now` 的博士经历 | 已按用户确认，将侧栏与简介统一为 Ph.D. Student |
| 机构链接为空 | 布局引用 `site.affiliation_link`，配置未定义；已有产物输出 `href=""` | 将机构名称和明确的机构 URL 放入个人资料配置 |
| 模板与内容耦合 | Markdown 内含 Liquid include，论文 YAML 内含 `<strong>` 等 HTML | Markdown 保存正文，Astro 组件保存布局，论文改为结构化数据 |
| 路径仅适合首页 | 多处 `./assets/...`、`assets/...` 放到嵌套文章页后会指向错误目录 | 静态资源使用站点根路径，文章图片使用 Astro 支持的相对导入 |
| 外部资源影响展示 | 字体和整套图标通过外部域名加载，预览时资源加载未全部完成 | 核心字体本地托管并保留许可，社交链接使用本地 SVG |
| 样式维护重复 | 亮暗样式分文件复制，论文 CSS 还修改全局 `blockquote` | 单套主题变量，论文样式限定组件范围 |
| 可访问性不足 | 图标链接无可读名称，论文图片无 alt，旧脚本限制缩放 | 使用语义化标签、明确链接名称与图片说明，移除旧缩放脚本 |
| 开发说明与配置不符 | Compose 实际入口 `54000`，`DOCKER.md` 与 `make test` 使用 `4000` | 新 README 统一描述 pnpm 工作流及实际端口 |
| 模板遗留内容 | `html_source_file` 仍是 `Your Name` 示例；首页 `Others` 为 TODO | 不作为真实内容迁移，重写完成后移除未使用的模板文件 |

## 3. 目标技术方案

以 [Astro 官方 Blog starter](https://github.com/withastro/astro/tree/main/examples/blog) 为工程起点，复用文章集合、静态文章路由、RSS 和页面元数据的组织方式，重新实现符合现有学术主页的布局和样式。官方模板是项目初始代码，不是运行时远程主题；引入之后由本仓库维护。

| 项目 | 选择 | 原因 |
| --- | --- | --- |
| 页面框架 | Astro，`output: 'static'` | 首页和文章均可在构建时生成完整 HTML |
| 模板 | 官方 `blog` | 已具备文章内容组织，便于替换视觉层 |
| 开发语言 | Astro 组件 + TypeScript strict | 为配置、论文数据和组件参数提供类型检查 |
| 正文格式 | 普通 `.md` + YAML frontmatter | 日常写作无需编写页面组件 |
| 文章读取 | Content Collections + `glob()` loader | 集中定义元数据并查询文章 |
| 样式 | 原生 CSS、主题变量、组件局部样式 | 当前界面规模不需要额外 CSS 框架 |
| 内容能力 | Astro 内置 Markdown 和代码高亮；`@astrojs/rss`、`@astrojs/sitemap` | 覆盖首版发布需求 |
| 静态检查 | `@astrojs/check` + TypeScript | 检查 `.astro` 与 TS，而不只验证是否能构建 |
| 工具管理 | 项目级 `mise.toml`，pnpm 与 `pnpm-lock.yaml` | 本地与 CI 使用相同工具链 |
| 托管 | GitHub Pages + GitHub Actions | 保留当前站点地址，发布 `dist/` |

本次核对的官方 Blog 模板包含 MDX、RSS、sitemap 和图片处理依赖。首版仅采用普通 Markdown，移除 MDX 集成和示例 `.mdx` 内容；不增加 React、Vue、SSR 适配器、数据库或 CMS。Astro 的 Markdown 支持不要求 MDX。[官方模板依赖](https://github.com/withastro/astro/blob/main/examples/blog/package.json)、[Markdown 文档](https://docs.astro.build/en/guides/markdown-content/)

首版不包含评论、全文搜索、标签聚合页、分页、双语站点路由、手动主题开关或数学公式插件。文章可标注语言并显示标签；需要这些扩展时再按实际写作需求添加，避免把本次迁移变成大型博客平台建设。

## 4. 页面、组件与目录设计

### 4.1 页面结构

| 路由 | 内容与行为 |
| --- | --- |
| `/` | 现有学术主页；保留内容顺序，增加清晰的 Blog 导航入口 |
| `/blog/` | 按发布日期倒序排列的文章列表，显示标题、日期、摘要和标签；没有文章时显示真实空状态 |
| `/blog/<id>/` | 文章详情，包含标题、元数据、正文、按二三级标题生成的目录及返回列表链接 |
| `/rss.xml` | 已发布文章的标题、摘要、日期和绝对链接 |
| `/sitemap-index.xml` | sitemap 集成生成的索引及对应子 sitemap |
| `/404.html` | 静态未找到页面，提供首页和博客入口 |

首页保持双栏学术主页；博客列表和文章页采用更宽松的阅读布局，不在手机上重复展示整块个人简历。共享颜色、字体和导航即可保持视觉一致，无需让所有页面使用相同的两栏结构。

```text
Home (/)
+----------------------+----------------------------------+
| Avatar / Name        | About / Research / News          |
| Affiliation / Email  | Education / Internship           |
| Scholar / CV / GitHub| Publications / Honors            |
| Home / Blog          |                                  |
+----------------------+----------------------------------+

Blog (/blog/<id>/)
+---------------------------------------------------------+
| Name                                      Home / Blog   |
+---------------------------------------------------------+
| Title / Date / Description / Tags                       |
| Contents                                                |
| Markdown body: text / code / tables / images             |
+---------------------------------------------------------+
```

### 4.2 目标目录

```text
.
|-- Makefile
|-- mise.toml
|-- package.json
|-- pnpm-lock.yaml
|-- astro.config.mjs
|-- tsconfig.json
|-- .github/
|   |-- actions/build-site/action.yml
|   `-- workflows/
|       |-- ci.yml
|       `-- deploy.yml
|-- public/
|   |-- assets/
|   |   |-- img/
|   |   |-- files/curriculum_vitae.pdf
|   |   |-- bibtex/atc25-popfetcher.txt
|   |   `-- fonts/
|   `-- robots.txt
|-- src/
|   |-- content.config.ts
|   |-- content/
|   |   |-- home/
|   |   |   |-- overview.md
|   |   |   `-- honors.md
|   |   `-- blog/
|   |       `-- hello-astro.md
|   |-- assets/
|   |   |-- avatar.jpg
|   |   `-- blog/
|   |-- data/
|   |   |-- site.ts
|   |   `-- publications.ts
|   |-- components/
|   |   |-- BaseHead.astro
|   |   |-- SiteNav.astro
|   |   |-- ProfileSidebar.astro
|   |   |-- PublicationList.astro
|   |   |-- PostList.astro
|   |   `-- TableOfContents.astro
|   |-- layouts/
|   |   |-- BaseLayout.astro
|   |   |-- HomeLayout.astro
|   |   `-- BlogPost.astro
|   |-- lib/posts.ts
|   |-- pages/
|   |   |-- index.astro
|   |   |-- blog/
|   |   |   |-- index.astro
|   |   |   `-- [...id].astro
|   |   |-- rss.xml.ts
|   |   `-- 404.astro
|   `-- styles/
|       |-- global.css
|       `-- prose.css
|-- README.md
`-- plan-astro-rewrite.md
```

`BaseLayout` 负责页面外壳与元数据，`HomeLayout` 负责学术主页两栏，`BlogPost` 负责长文布局。`overview.md` 保存论文之前的主页正文，`honors.md` 保存论文之后的荣誉；首页直接导入这两个 Markdown 组件，在中间插入论文组件。首页文案不加入文章集合，避免被误收录到文章列表或 RSS。

`lib/posts.ts` 仅集中文章可见性、排序和链接生成，不建立通用内容平台。文章列表、详情路由、RSS 使用同一规则；从一开始避免各处分别判断草稿造成结果不一致。

## 5. 内容与资源迁移映射

| 当前文件或数据 | 目标 | 迁移内容 |
| --- | --- | --- |
| `_config.yml` 的个人信息 | `src/data/site.ts` | 姓名、机构及 URL、邮箱、Scholar、GitHub、CV、头像和默认页面语言 |
| `_config.yml` 的站点配置 | `astro.config.mjs` + `BaseHead.astro` | 真实站点 URL、页面元数据；主题颜色移入 CSS |
| `index.md` 的介绍到实习 | `src/content/home/overview.md` | 保留现有标题顺序、正文、链接和必要内联 HTML，删除 Liquid include |
| `index.md` 的荣誉 | `src/content/home/honors.md` | 保留真实奖项；不发布 `Others / TODO` 占位内容 |
| `_data/publications.yml` | `src/data/publications.ts` | 保留论文题目、作者顺序、通讯作者标记、会议、年份、PDF、Slides、BibTeX、图片 |
| `_includes/publications.md` | `PublicationList.astro` | 用组件循环代替 Liquid；作者强调、会议徽标、链接按钮由组件生成 |
| `_includes/services.md` | 不进入首版页面 | 当前未启用，不把模板示例作为个人经历发布 |
| `_layouts/homepage.html` | layouts 与 components | 按页面外壳、资料、导航和论文拆分 |
| Sass 与 CSS | `global.css`、`prose.css`、组件样式 | 提取视觉规则，合并主题变量，去掉重复和未使用样式 |
| 真实头像 | `src/assets/avatar.jpg` | 保留原图，构建时生成 128、256、384 像素的 WebP，浏览器按像素密度选择 |
| favicon、论文图片、CV、BibTeX | `public/assets/` 对应子目录 | 仅迁移实际引用的资源；模板图片与头像备份不自动发布 |
| 未来文章图片 | `src/assets/blog/` | 通过 Markdown 相对路径引用，由 Astro 构建处理 |
| `html_source_file/` | 删除 | 这是模板示例副本，不是当前个人主页的权威源码 |
| Gemfile、Docker、Makefile、旧说明 | 完成验证后移除或替换 | 最终仅保留 Astro + pnpm 开发入口 |

论文作者改为带姓名及标记的对象数组，会议名称和年份改为独立字段，不继续把展示用 HTML 存在数据中。主页正文无需为迁移额外转成 JSON；Markdown 继续作为主要文案来源。

资源路径统一明确：例如 CV 使用 `/assets/files/curriculum_vitae.pdf`，论文引用使用 `/assets/bibtex/atc25-popfetcher.txt`。这些文件直接由 `public/` 输出，不引入旧格式解析器、双套模板或重定向兼容层。

## 6. Markdown 自动生成 HTML 的具体流程

### 6.1 内容约定

文章放入 `src/content/blog/`。以下为写作格式示例，实际工程中的演示文章保持草稿状态，不作为真实文章发布：

```markdown
---
title: "用 Astro 管理个人博客"
description: "记录学术主页迁移与 Markdown 写作流程。"
pubDate: "2026-10-06"
lang: "zh-CN"
tags: ["Astro", "Web"]
draft: true
---

## 为什么迁移

这里编写正文，支持链接、列表、表格和带语言标记的代码块。

## 页面结构

![页面结构示意图](../../assets/blog/site-structure.png)
```

示例图片需在实际写作时添加，不能留下不存在的图片路径。文章主标题由布局读取 `title` 生成，正文从二级标题开始。

| 字段 | 约定 |
| --- | --- |
| `title` | 必填，文章标题 |
| `description` | 必填，用于列表摘要和页面描述 |
| `pubDate` | 必填，ISO 日期字符串，构建时解析；显示日期时统一使用 UTC 避免跨时区日期偏移 |
| `updatedDate` | 可选，实际更新日期 |
| `lang` | 必填，按文章内容填写，例如 `en`、`zh-CN`；用于 HTML 语言属性 |
| `tags` | 必填数组，无标签填写 `[]`；首版仅展示标签 |
| `draft` | 必填布尔值，显式区分草稿与公开文章 |
| `heroImage` | 可选本地封面，使用集合的图片 schema；无封面时省略该区域 |
| `heroImageAlt` | 使用封面时提供的图片说明 |

`src/content.config.ts` 使用 `defineCollection()` 和 `glob({ base: './src/content/blog', pattern: '**/*.md' })` 定义文章集合，并通过 schema 校验元数据。实施时以选定 Astro 版本对应的导入方式为准；本次核对的官方模板从 `astro/zod` 导入 `z`，不直接复制旧版本教程中的导入示例。[官方集合定义](https://github.com/withastro/astro/blob/main/examples/blog/src/content.config.ts)

文章 ID 使用 loader 从相对文件路径生成的 `id`，例如 `hello-astro.md` 对应 `/blog/hello-astro/`，子目录对应多段路径。首版不另加自定义 slug 规则；移动或重命名文件会改变文章地址，写作说明中直接说明这一行为。

### 6.2 构建与预览

```text
src/content/blog/*.md
        |
        v
glob loader + frontmatter schema
        |
        v
published posts / local draft preview
        |
        +------> /blog/ + /rss.xml
        |
        v
getStaticPaths() -> /blog/<id>/
        |
        v
render(post) -> Content + headings -> BlogPost layout
        |
        v
astro build -> dist/**/*.html + CSS + assets
        |
        v
GitHub Pages
```

`getStaticPaths()` 枚举文章 ID，`render(post)` 返回正文组件和标题信息，文章布局输出完整 HTML 并使用标题信息生成目录。这些由 Astro 在构建时完成，浏览器不需要下载 Markdown 再进行转换，也无需自己编写 Markdown 转换脚本。[Content Collections](https://docs.astro.build/en/guides/content-collections/)、[官方文章路由](https://github.com/withastro/astro/blob/main/examples/blog/src/pages/blog/%5B...slug%5D.astro)

本地 `pnpm dev` 可预览草稿，并明确显示草稿状态；生产构建只为 `draft: false` 的文章生成详情页，列表、RSS 和 sitemap 中也不包含草稿。发布日期用于展示和排序，首版不提供定时发布；发布动作是修改草稿状态后触发一次构建。

frontmatter 语法错误、必填字段缺失或构建所需图片不存在时，应显示实际错误并修正源文件，不跳过文章、不伪造正文、不静默返回成功。页面本身没有文章时则显示正常空状态，这与构建失败是两种不同情况。

## 7. pnpm 与 mise 开发工具链

当前机器已有 mise `2026.10.2`、Node.js `24.21.0`、pnpm `12.9.1`，本次分析无需安装工具。迁移实施时将 Node 和 pnpm 的这些明确版本写入项目根目录 `mise.toml`；若开始实施时主动升级，则一起更新项目配置、`packageManager` 和锁文件，并重新验证构建。官方当前安装文档要求 Node.js 至少 `22.12.0`。[Astro 安装要求](https://docs.astro.build/en/install-and-setup/)

```toml
[tools]
node = "24.21.0"
pnpm = "12.9.1"
```

项目工具初始化命令明确指定文件路径，防止 mise 选择父目录配置。缺失的其他独立 CLI 也优先使用这种方式加入项目；Astro、TypeScript 等工程依赖仍通过 pnpm 放入 `package.json`，不全局安装。

```bash
# 在仓库根目录执行；属于后续实施步骤
mise use --path ./mise.toml --pin node@24.21.0 pnpm@12.9.1

# 在尚不存在的仓库外临时目录生成模板，再有选择地迁入仓库
mise exec -- pnpm create astro@latest /tmp/profile-astro-starter --template blog --no-install --no-git
```

`mise use` 会安装缺少的工具并记录版本；`--path` 指定项目文件，`--pin` 保存明确版本。项目配置生效后可直接执行 pnpm，未激活 shell 时使用 `mise exec -- pnpm ...`。[mise use 文档](https://mise.jdx.dev/cli/use.html)、[create-astro 参数](https://github.com/withastro/astro/blob/main/packages/create-astro/README.md)

迁入模板时保留当前仓库的 `.git`、计划和真实内容，不将整个模板覆盖到非空仓库。Astro 及官方集成的精确安装结果记录在 `pnpm-lock.yaml`；使用 `@latest` 只发生在初始化选择版本时，CI 不在每次构建时重新选择框架版本。

计划中的日常命令如下，`check` 在实施时定义为 `astro check`，其余使用官方模板脚本：

```bash
mise install
mise exec -- pnpm install --frozen-lockfile
mise exec -- pnpm dev
mise exec -- pnpm run check
mise exec -- pnpm build
mise exec -- pnpm preview
```

首次建立工程和锁文件时运行 `pnpm install`；已有锁文件的日常安装和 CI 使用 `--frozen-lockfile`。设置 `packageManager: "pnpm@12.9.1"`，不引入其他包管理器的锁文件。`.gitignore` 更新为忽略 `node_modules/`、`dist/`、`.astro/`，跟踪 `mise.toml` 与 `pnpm-lock.yaml`。

开发服务器和构建产物预览默认统一使用 Astro 的 `4321` 端口，并在 README 中写明。HTML 生成到 `dist/`，不手工修改和提交构建结果；保存 Markdown 自动更新的是本地预览，线上内容更新仍需要构建与部署。

## 8. SEO 与 GitHub Pages 发布

### 8.1 站点配置

目标站点配置使用 `site: 'https://miracle0x0.github.io'`、`output: 'static'`、`trailingSlash: 'always'`，保留目录式构建输出。当前是用户站点，`base` 使用默认 `/`，不要误配成 `/profile/` 或仓库名路径；后者会使实际资源地址与站点入口不一致。

`BaseHead` 为每页生成独立标题、description、canonical、Open Graph 和 Twitter Card 元数据，canonical 从站点地址和页面路径生成。首页描述替换成真实个人研究介绍，文章页使用文章摘要；社交图片有真实素材时再输出对应字段。`robots.txt` 指向实际 sitemap，404 不进入 sitemap。

现站没有自定义域名，不把空 `CNAME` 复制到 `public/`。若之后新增独立域名，需要同步更新 `site`、Pages 域名设置和 DNS；不在此次迁移中假设一个尚不存在的域名。[Astro GitHub Pages 指南](https://docs.astro.build/en/guides/deploy/github/)

### 8.2 CI 与部署流程

将验证和发布拆成明确的工作流：`ci.yml` 对 PR 和手动触发的分支执行安装、检查、构建；`deploy.yml` 在 `main` 更新时执行相同构建并部署。上线实施时，将仓库 Settings / Pages 的 Source 从分支构建改为 **GitHub Actions**；仅新增 YAML 不会自动完成这个设置变更。

```text
checkout
   |
   v
mise-action -> install project Node + pnpm
   |
   v
pnpm install --frozen-lockfile
   |
   v
pnpm run check -> pnpm build
   |
   +--> branch / PR: report result
   |
   `--> main: configure Pages -> upload dist -> deploy Pages
```

CI 通过共用的 `.github/actions/build-site/action.yml` 使用 `jdx/mise-action` 读取项目工具配置，缓存 pnpm store 与 Astro 已处理图片，再显式执行 pnpm 命令；发布使用 GitHub 官方 Pages 配置、上传 artifact 和部署 actions。这样工具版本来自一处配置，不再叠加另一套 Node/pnpm 安装流程。实施时固定各 action 的版本。[mise CI 文档](https://mise.jdx.dev/continuous-integration.html)、[GitHub 自定义 Pages 工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

验证任务仅需读取仓库；生产构建任务增加 `pages: read` 以读取 Pages 配置，部署任务使用 `pages: write`、`id-token: write` 和 `github-pages` environment，并依赖构建成功。开发分支和 PR 不部署生产站点，上传内容仅为 `dist/`。任何安装、检查或构建错误直接使任务失败；不切回 Jekyll，也不发布占位页面掩盖问题。

## 9. 分阶段实施计划

P1–P5 已完成本地实施，P6 尚未执行。实现使用 Astro 7.3.5、TypeScript 6.0.3；pnpm 所需 esbuild 构建脚本许可保存在 `pnpm-workspace.yaml`。Makefile 已封装安装、开发、生产预览、检查、测试、构建、新建草稿与服务管理命令；README 已包含相应使用说明。

| 阶段与状态 | 工作内容 | 主要产出 | 完成标准 |
| --- | --- | --- | --- |
| P1 工程初始化（已完成） | 项目级 mise；引入官方 Blog starter；确定依赖版本；移除 MDX 示例；配置 pnpm 和静态检查 | `mise.toml`、包配置、锁文件、Astro 配置 | pnpm 安装、check、build 可执行，工程无需 Ruby/Docker |
| P2 学术主页迁移（已完成） | 拆分 Markdown 正文与论文数据；迁移真实资源；用 Grid 与主题变量恢复主页；核实个人资料 | 首页布局、组件、home Markdown、论文数据 | 介绍、研究、动态、教育、实习、论文和荣誉逐项对应原内容，链接可用 |
| P3 博客内容链路（已完成） | 集合 schema、草稿规则、列表、详情、目录、文章样式、RSS | blog 集合、路由、`lib/posts.ts`、RSS | 新增一篇 Markdown 即能生成对应页面；无需修改模板或手动编写 HTML |
| P4 页面质量（已完成） | 页面元数据、sitemap、404、语言属性、字体图标本地化、浅深色与响应式检查 | BaseHead、主题样式、静态资源 | 页面元数据正确；手机、桌面及深色模式均可阅读 |
| P5 工具链收尾（已完成） | 添加 CI/部署文件；替换 README；移除 Jekyll 与模板遗留文件 | 工作流、项目说明、清理后的目录 | 干净检出后可复现构建，仓库内只有一套实际开发入口 |
| P6 上线切换（待发布） | 在获得推送与发布授权后切换 Pages Source，部署并检查公网路由 | Astro 生产站点 | 首页、文章直达、静态资源、RSS、sitemap 和 404 行为符合验收标准 |

清理在对应内容迁移并验证后进行：移除 `_layouts/`、`_includes/`、`_sass/`、旧 `_data/`、旧根目录 `assets/`、`index.md`、`_config.yml`、`Gemfile`、旧 Docker/Compose 配置、`DOCKER.md`、`html_source_file/`、空 `CNAME` 和未改写的上游多语言模板 README。Makefile 替换为 Astro + mise + pnpm 的常用命令入口。原始许可证保留；新增模板、字体和图标按各自许可保留必要声明，不维护旧格式兼容逻辑。

## 10. 验收标准

| 验收项 | 验证方式与预期 |
| --- | --- |
| 可复现安装 | 在干净检出中使用项目 mise 配置及 pnpm 锁文件完成安装、`pnpm run check`、`pnpm build` |
| 首页完整性 | 对照原文件检查所有真实栏目、论文作者顺序和资源链接；不存在模板身份、空机构链接或 TODO 栏目 |
| Markdown 自动渲染 | 使用临时验收文章覆盖中文、英文、列表、链接、代码、表格、图片、目录锚点；构建后 HTML 中直接包含正文 |
| 草稿隔离 | 同时验证一篇公开文章和一篇草稿；生产 `dist/`、列表、RSS、sitemap 均不包含草稿，开发模式可预览 |
| 错误可见 | 临时移除必填字段或引用不存在的本地图片，验证实际报错；修复源文件后再次成功构建 |
| 路由和资源 | 使用 `pnpm preview` 直接打开并刷新嵌套文章 URL；检查头像、CV、论文图片、BibTeX 和文章图片；上线后复验 |
| SEO | 首页和文章 canonical 指向本站各自地址；description 无模板文案；RSS 使用绝对链接；sitemap 排除草稿与 404 |
| 响应式 | 在 `390px`、`768px`、`1280px` 检查首页、列表和长文，覆盖浅色与深色；页面无整体横向溢出，宽代码和表格可局部滚动 |
| 可访问性 | 键盘导航、可见焦点、图片说明、图标链接名称、正确的标题层级和 `lang`；浏览器缩放可正常使用 |
| 静态站点行为 | 禁用 JavaScript 后仍可阅读首页、文章及导航；生产不依赖常驻 Node 服务 |
| 发布链路 | PR/手动分支检查只验证，`main` 的成功构建发布 `dist/`；GitHub Pages 实际返回预期页面，错误路径进入 404 |
| 文档一致性 | README 中工具安装、写作位置、frontmatter、草稿、图片、预览端口和发布命令与工程一致 |

本地及全新临时工程均已通过 pnpm 锁文件安装、Astro 静态检查（0 错误、0 警告）、静态构建和 5 项自动化测试；浏览器已检查 390px、768px、1280px 下首页、列表、文章的浅色与深色布局，共 18 种组合，未发现页面横向溢出、图片加载失败或浏览器运行错误。生产预览还验证了禁用 JavaScript 后的导航、键盘焦点、附件、空列表、RSS、sitemap 和 404，页面资源不依赖外部服务。公开测试文章仅在临时测试目录中构建；仓库内示例保持草稿。线上工作流与 Pages 发布需在提交、推送及切换发布源后验证。
