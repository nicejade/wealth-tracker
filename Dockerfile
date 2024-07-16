# 使用官方 Node.js 镜像
FROM node:20.5.1-alpine

# 全局安装 tsx
RUN npm install -g tsx

# 设置工作目录
WORKDIR /app

# 复制 package.json 文件
COPY ./server/package.json ./

# 安装生产依赖
RUN npm install

# 复制 server 代码到工作目录
COPY ./server /app/server

# 暴露应用的端口
EXPOSE 8888

# 定义数据库文件路径
VOLUME ["/app/data"]

# 启动后端服务
WORKDIR /app
CMD ["npx", "tsx", "server/src/index.ts"]