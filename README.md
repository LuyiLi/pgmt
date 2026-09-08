# PGMT project website

Academic project page for **PGMT: Perceptive General Motion Tracking for Humanoid Robots**.

Intended repository: `LuyiLi/pgmt`  
Intended public URL: <https://luyili.github.io/pgmt/>

## 本地预览

需要 Node.js 20 或更高版本；无需安装 npm 依赖。

```powershell
node scripts/serve.mjs
```

打开 <http://127.0.0.1:4173/pgmt/>。预览服务器支持视频 Range 请求，可正常拖动进度条。

## 填写 arXiv、B 站与代码链接

只需修改 `site-config.js`：

```js
window.PGMT_CONFIG = Object.freeze({
  paper: "assets/paper/pgmt.pdf",
  arxiv: "",
  code: "",
  bilibili: "",
  siteUrl: "https://luyili.github.io/pgmt/",
});
```

把空字符串替换为公开 URL，首页和资源区会一起启用对应按钮。留空时显示 Coming soon，不会跳转到无关页面。`code` 指论文实现仓库，不是网页源码仓库。

arXiv 发布后，也请在 `index.html` 的 BibTeX 中补上真实标识。当前使用 `@misc` 项目引用，未声称论文已被会议或期刊接收。

## 发布到 GitHub Pages

1. 用 `LuyiLi` 账号创建公开仓库 `pgmt`，将本文件所在目录的内容提交到 `main`。
2. 仓库 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。
3. 推送到 `main`，或在 Actions 中手动运行 **Deploy PGMT to GitHub Pages**。
4. 等待工作流成功，即可访问 <https://luyili.github.io/pgmt/>。

已提供 `.github/workflows/deploy.yml`，只发布 `_site/` 中的网页文件，不会发布开发脚本。参考 [GitHub 官方 Pages 工作流文档](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

也可选择 **Deploy from a branch → main → /(root)**。本项目是纯静态网页，含 `.nojekyll`，无需 Jekyll。如果使用此模式，可移除 Actions 工作流，避免重复部署。

## 验证与构建

```powershell
node --check app.js
node --check site-config.js
node scripts/check.mjs
node scripts/build.mjs
```

`check.mjs` 验证静态资源、页内锚点、视频与封面对应关系、链接配置和单文件大小；浏览器交互与手机端布局另行实测。

## 内容与素材

- 内容、作者和机构据 2026-09-08 提供的 8 页 PGMT 论文 PDF 整理。
- `assets/paper/pgmt.pdf`：提供的论文副本。
- `assets/images/method.png`：直接从论文 Figure 2 提取的最新版架构图。
- `assets/images/real-world-overview.png`：原始实机拼图，用作社交分享封面。
- `assets/media/hero.mp4`：`Teaser.mp4` 压缩版。
- `assets/media/overview.mp4`：`视频终稿.mp4` 的完整压缩版，保留原声。
- 其他片段选自“筛选素材”，以原速展示，不加速。短演示去掉环境音，仅在点击播放或明确选择后播放；首屏背景视频静音循环。
- 仿真数字来自 Table II。与 Perceptive BFM 的引用结果单独注记，不混入匹配评测图表。
- 保留图中模型名称，并明确 SONIC 使用外部 checkpoint、RGMT 为本文复现。

### 视频选段

| 网页素材 | 原文件 | 时间段 |
| --- | --- | --- |
| hero | Teaser.mp4 | 0–13.7 s |
| stairs | Locomotion stair run up.mp4 | 8–18 s |
| bridge | Locomotion Bridge.mp4 | 8–40 s |
| box | Locomotion Box.mp4 | 全长 |
| grass | Locomotion Grass Run.mp4 | 全长 |
| cartwheel | Track side flip.mp4 | 全长 |
| dance | Stairs Dance.mp4 | 全长 |
| teleop-stairs | Teleop stairs.mp4 | 全长 |
| teleop-punch | Teleop Punch.mp4 | 全长 |
| teleop-recovery | Teleop laydown and getup.mp4 | 全长 |
| recovery | Track Fall.MP4 | 25–75 s |
| overview | 视频终稿.mp4 | 全长 |

页面支持手机导航、键盘方向键切换视频分类、架构图放大、原生视频全屏、BibTeX 复制、减少动态效果偏好和后台视频暂停。所有资源均本地托管，无统计追踪或外部字体请求。

## 文件与授权

论文、图片和视频的权利归原作者所有；此仓库不额外授予素材再利用许可。字体 DM Sans 和 Instrument Serif 通过 Fontsource 获取，使用 SIL Open Font License，许可证包含在 `assets/fonts/`。网页的 Code 链接预留给论文实现；本网站不包含训练代码。
