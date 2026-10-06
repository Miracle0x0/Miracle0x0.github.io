SHELL := /bin/bash
.DEFAULT_GOAL := help

PNPM := mise exec -- pnpm
# HOST ?= 127.0.0.1
HOST ?= 0.0.0.0
PORT ?= 4321
export HOST PORT SLUG

.PHONY: help install dev preview build check test verify new-post status stop logs preview-logs clean

help:
	@printf '%s\n' \
	  '常用命令：' \
	  '  make install                   安装项目工具和锁定的依赖' \
	  '  make dev                       启动开发预览（含草稿）' \
	  '  make preview                   构建并启动生产预览' \
	  '  make build                     构建静态网页到 dist/' \
	  '  make check                     检查 Astro 和 TypeScript' \
	  '  make test                      运行自动化测试' \
	  '  make verify                    依次执行检查、测试、构建' \
	  '  make new-post SLUG=my-post      新建 Markdown 草稿' \
	  '  make status                    查看开发与预览服务状态' \
	  '  make stop                      停止开发与预览服务' \
	  '  make logs                      查看开发服务日志' \
	  '  make preview-logs              查看生产预览日志' \
	  '  make clean                     删除 dist/ 和 .astro/' \
	  '' \
	  "预览参数：HOST=$$HOST PORT=$$PORT，可在命令后覆盖。"

install:
	mise install node pnpm
	$(PNPM) install --frozen-lockfile

dev:
	$(PNPM) dev --host "$$HOST" --port "$$PORT"

preview: build
	$(PNPM) preview --host "$$HOST" --port "$$PORT"

build:
	$(PNPM) build

check:
	$(PNPM) run check

test:
	$(PNPM) test

verify:
	$(PNPM) run check
	$(PNPM) test
	$(PNPM) build

new-post:
	$(PNPM) new:post "$$SLUG"

status:
	$(PNPM) exec astro dev status
	$(PNPM) exec astro preview status

stop:
	$(PNPM) exec astro dev stop
	$(PNPM) exec astro preview stop

logs:
	$(PNPM) exec astro dev logs

preview-logs:
	$(PNPM) exec astro preview logs

clean:
	rm -rf -- dist .astro
