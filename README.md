# trojan-web

[trojan 管理程序](https://github.com/OnionStark/trojan) 的前端页面。

构建产物会被拷入后端 `trojan/web/templates/` 并通过 `//go:embed` 内嵌进 Go 二进制, 最终由后端提供访问。

## 技术栈

vue 3 + element-plus + vite + vuex + vue-router + vue-i18n

- `axios`：接口请求
- `crypto-js`：密码 SHA224 / base64 处理
- `easyqrcodejs`：分享二维码
- `dayjs`：时间处理
- `nprogress`：顶部加载进度条

## 功能特性

- 仪表盘: 服务器 CPU / 内存 / 硬盘 / 负载 / 网速 / 连接数、trojan 运行状态
- 用户管理: 增删改、流量统计与限额、到期时间、批量操作
- trojan 管理: 启动/停止/重启、日志实时查看、trojan 与 trojan-go 切换、自助注册配置
- 分享: trojan:// 链接与二维码、clash 订阅链接、一键导入 Clash
- 登录 / 首次初始化管理员 / 修改密码 / 中英文切换
- **用户自助注册**: 管理员开启并设置邀请码后, 访客可在登录页凭邀请码自助注册(`/signup`)
- **下载客户端**: 用户页按当前平台推荐常见 clash / trojan 客户端, 并可复制订阅或一键导入 Clash

## 目录结构

```
src/
  api/         接口封装 (permission / user / trojan / data / common)
  views/       页面 (login/signup/register、dashboard、user、trojan、layout、errorPage)
  store/       vuex 状态管理
  router/      路由 (constantRoutes)
  lang/        i18n 中英文与 element-plus 语言包
  utils/       request 拦截器、common、clients(客户端下载配置)
  components/  SvgIcon / Breadcrumb / Hamburger
  icons/       svg 图标
```

## 开发调试

1. 安装依赖:
```bash
npm install
```

2. 配置后端代理地址: 编辑 `vite.config.js` 中的 `proxyTarget`, 指向一台正在运行 trojan-web 后端的服务器(接口 `/api` 与 websocket `/ws` 会被反向代理过去):
```js
const proxyTarget = 'http://127.0.0.1:8080'   // 改成你的后端地址
```

3. 启动开发服务器(热更新, 默认 `http://127.0.0.1:5173`):
```bash
npm run dev
```

> 开发环境下前端由 Vite 提供并热更新, 接口通过 `vite.config.js` 的 proxy 转发到后端; 生产环境接口 baseURL 为 `/`(见 `src/utils/request.js`), 由内嵌前端的后端直接提供。

## 生产构建

```bash
npm run build     # 产出 dist/ (index.html + static/)
```

生产版 `index.html` 通过公共 CDN 加载 vue / element-plus 等依赖(见 `vite.config.js` 的 `rollupOptions.external` 与 `externalGlobals`), 打包体积很小, 但最终用户浏览器需能访问对应 CDN。

## 与后端集成

前端不自带后端, 需配合 [trojan](https://github.com/OnionStark/trojan) 使用。发布时把 `dist/` 拷入后端 `web/templates/` 再编译 Go:

```bash
rm -rf ../trojan/web/templates
cp -r dist ../trojan/web/templates
cd ../trojan && go build -o trojan .
```

完整的构建与部署说明见后端仓库 [trojan](https://github.com/OnionStark/trojan) 的 README。

**欢迎 fork 以改进优化页面**
