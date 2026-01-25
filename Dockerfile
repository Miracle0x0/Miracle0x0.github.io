FROM ruby:3.1-alpine

# 使用国内镜像源
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.tuna.tsinghua.edu.cn/g' /etc/apk/repositories

# 安装构建依赖
RUN apk update && \
    apk add --no-cache \
    build-base \
    gcc \
    g++ \
    make \
    libc-dev

# 设置工作目录
WORKDIR /srv/jekyll

# 配置 Bundler 使用国内镜像
RUN bundle config mirror.https://rubygems.org https://mirrors.tuna.tsinghua.edu.cn/rubygems

# 复制 Gemfile
COPY Gemfile* ./

# 安装 gems
RUN bundle install

# 暴露端口
EXPOSE 4000 35729

# 启动命令
CMD ["bundle", "exec", "jekyll", "serve", "--host", "0.0.0.0", "--watch", "--force_polling", "--livereload"]
