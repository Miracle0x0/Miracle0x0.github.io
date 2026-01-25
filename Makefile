.PHONY: help build up down restart logs clean rebuild test

default: restart

# 默认目标
help:
	@echo "Jekyll Docker 开发环境"
	@echo ""
	@echo "可用命令:"
	@echo "  make build    - 构建 Docker 镜像"
	@echo "  make up       - 启动服务"
	@echo "  make down     - 停止服务"
	@echo "  make restart  - 重启服务"
	@echo "  make logs     - 查看日志"
	@echo "  make clean    - 清理容器和网络"
	@echo "  make rebuild  - 重新构建并启动"
	@echo "  make test     - 测试服务是否正常"

# 构建镜像
build:
	@echo "构建 Docker 镜像..."
	docker-compose build

# 启动服务
up:
	@echo "启动 Jekyll 服务..."
	docker-compose up -d
	@echo "服务已启动，访问 http://localhost:54000"
	@echo "LiveReload 已启用，文件保存后将自动刷新浏览器"

# 停止服务
down:
	@echo "停止服务..."
	docker-compose down

# 重启服务
restart: down up

# 查看日志
logs:
	docker-compose logs -f

# 清理
clean:
	@echo "清理容器、网络和镜像..."
	docker-compose down --rmi local --volumes
	@echo "清理完成"

# 重新构建
rebuild: clean build up

# 测试服务
test:
	@echo "测试服务..."
	@sleep 3
	@curl -s http://localhost:4000 > /dev/null && echo "✓ 服务正常运行" || echo "✗ 服务未响应"
