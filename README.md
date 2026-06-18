# 开发者速算台

一个纯 HTML/CSS/JavaScript 的静态小工具网站，包含 JSON 格式化、URL 编解码、时间戳转换、UUID 生成和密码生成。生产环境使用 nginx 容器托管。

## 本地预览

直接打开 `index.html`，或使用 Docker Compose：

```bash
docker compose up --build
```

默认访问地址：

```text
http://localhost:8080
```

如需修改端口：

```bash
APP_PORT=3000 docker compose up --build
```

## 使用 GHCR 镜像部署

GitHub Actions 会在推送到 `main` 或 `master` 分支、推送 `v*.*.*` 标签、手动触发时构建镜像，并上传到 GHCR。

镜像地址格式：

```text
ghcr.io/<github-owner>/<repo>:latest
ghcr.io/<github-owner>/<repo>:sha-<commit-sha>
ghcr.io/<github-owner>/<repo>:<branch-or-tag>
```

服务器上可使用同一份 `compose.yaml`：

```bash
IMAGE_NAME=ghcr.io/<github-owner>/<repo>:latest docker compose up -d
```

如果 GHCR 包是私有的，需要先登录：

```bash
echo <github-token> | docker login ghcr.io -u <github-username> --password-stdin
```

## CI/CD

工作流文件位于 `.github/workflows/docker-ghcr.yml`，使用 GitHub 默认的 `GITHUB_TOKEN` 推送当前仓库的容器包。仓库需要启用 Actions，并允许 workflow 具备 `packages: write` 权限。
