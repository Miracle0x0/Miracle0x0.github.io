# Jekyll Docker 本地开发环境

使用 Docker 运行 Jekyll，无需在系统中安装 Ruby 和 Jekyll。

## 快速开始

### 方式一：使用 Makefile（推荐）

```bash
# 查看所有命令
make help

# 首次使用：构建并启动
make build
make up

# 或者一步完成
make rebuild

# 查看日志
make logs

# 停止服务
make down

# 测试服务
make test
```

### 方式二：使用 docker-compose

```bash
# 首次使用：构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

## 访问网站

启动后访问：http://localhost:4000

## 常用命令

### 重启服务

```bash
make restart
# 或
docker-compose restart
```

### 重新构建（清除缓存）

```bash
make rebuild
# 或
docker-compose down --rmi local --volumes
docker-compose build
docker-compose up -d
```

### 更新依赖

修改 `Gemfile` 后需要重新构建：

```bash
make rebuild
```

### 进入容器

```bash
docker exec -it minimal-light-jekyll sh
```

## 说明

- **自动重载**：修改文件后会自动重新构建
- **依赖缓存**：gems 在镜像构建时安装，修改 Gemfile 需重新构建
- **端口映射**：容器的 4000 端口映射到主机的 4000 端口
- **文件同步**：当前目录挂载到容器，修改立即生效
- **国内镜像**：使用清华大学镜像源加速下载

## 故障排查

### 服务无法启动

```bash
# 查看日志
make logs

# 重新构建
make rebuild
```

### 端口被占用

修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "4001:4000"  # 改为其他端口
```

### 文件修改不生效

```bash
# 重启服务
make restart
```
