# PGMT project website

Academic project page for **PGMT: Perceptive General Motion Tracking for Humanoid Robots**.

Repository: <https://github.com/LuyiLi/pgmt>

Public URL: <https://luyili.github.io/pgmt/>

## 本地预览

需要 Node.js 20 或更高版本；无需安装 npm 依赖。

```powershell
node scripts/serve.mjs
```

打开 <http://127.0.0.1:4173/pgmt/>。预览服务器支持视频 Range 请求，可正常拖动进度条。

## 填写论文与视频链接

只需修改 `site-config.js`：

```js
window.PGMT_CONFIG = Object.freeze({
  paper: "assets/paper/pgmt.pdf",
  arxiv: "",
  youtube: "https://youtu.be/nXjA07c3eBc",
  bilibili: "https://www.bilibili.com/video/BV1dzbx6kEhQ/",
  siteUrl: "https://luyili.github.io/pgmt/",
});
```

顶部 Video 按钮通过 `youtube` 配置在新标签页打开 YouTube；Bilibili 按钮通过 `bilibili` 配置打开 B 站。两个视频链接均已接入。首屏保留短预览，Watch the full video 按钮播放本站的完整视频。

arXiv 发布后，把空字符串替换为公开 URL，首页会启用对应按钮。留空时显示 soon，不会跳转到无关页面。

arXiv 发布后，也请在 `index.html` 的 BibTeX 中补上真实标识。当前使用 `@misc` 项目引用，未声称论文已被会议或期刊接收。

## 发布到 GitHub Pages

仓库 `LuyiLi/pgmt` 已启用 Pages，发布来源为 **GitHub Actions**。

1. 将网页修改提交并推送到 `main`，自动触发 **Deploy PGMT to GitHub Pages**。
2. 也可在 Actions 中选择该工作流，点击 **Run workflow**，分支选择 `main`。
3. 等待工作流成功，即可访问 <https://luyili.github.io/pgmt/>。

若在其他仓库首次部署，需要先进入 **Settings → Pages → Build and deployment → Source** 选择 **GitHub Actions**。`Configure Pages` 返回 404 通常表示该仓库还未启用 Pages；完成设置后重新运行工作流即可。

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
- `assets/images/affiliations.png`：提供的“图片4.png”学校、机构与实验室标识，保持原图比例。
- `assets/media/hero.mp4`：从最新版 `终稿3.mp4`（2026-09-07 导出）截取开头 0–13.7 秒，与原网页 preview 时长一致；封面同步取自该版本。1440 × 810、30 fps、H.264，静音循环。
- `assets/media/overview.mp4`：同一版 `终稿3.mp4` 的完整压缩版，保留原声。
- 其他片段选自“筛选素材”，以原速展示，不加速。短演示去掉环境音，在点击后播放；首屏 teaser 静音循环，保留完整画幅。
- 页面参照 [TAGA 学术项目主页](https://marmotlab.github.io/taga-humanoid/) 的信息组织方式，使用白底、无衬线完整论文标题、作者与机构标识、摘要、方法图、实机视频和 BibTeX。
- 根据作者要求，页面不展示实验完成率、百分比对比、基线柱状图或基线数据表；论文 PDF 保持原文件。
- 演示区默认展示六段精选视频，采用两列布局；可按 locomotion、motion tracking、teleoperation 和 recovery 筛选。点击新视频时会暂停其他视频。

### 视频选段

| 网页素材 | 原文件 | 时间段 |
| --- | --- | --- |
| hero | 终稿3.mp4 | 0–13.7 s |
| stairs | Locomotion stair up.mp4 | 全长，约 28.8 s |
| bridge | Locomotion stair up down turn.mp4 | 全长，约 12.1 s |
| box | Locomotion Box.mp4 | 全长 |
| grass | Locomotion Grass Run.mp4 | 全长 |
| cartwheel | Track side flip.mp4 | 全长 |
| dance | Stairs Dance.mp4 | 全长 |
| teleop-stairs | Teleop stairs.mp4 | 全长 |
| teleop-punch | Teleop Punch.mp4 | 全长 |
| teleop-recovery | Teleop laydown and getup.mp4 | 全长 |
| recovery | Track Fall.MP4 | 25–75 s |
| overview | 终稿3.mp4 | 全长 |

页面支持响应式页内导航、键盘方向键切换视频分类、架构图放大、原生视频全屏、BibTeX 复制、减少动态效果偏好和后台视频暂停。所有资源均本地托管，无统计追踪或外部字体请求。

### GitHub 素材大小

网站只包含压缩后的 MP4，不包含约 647 MiB 的原始终稿。所有网站文件均低于 GitHub 普通 Git 提交的 100 MiB 单文件限制，无需 Git LFS；视频使用 H.264 / yuv420p，并启用 faststart，适合网页播放。

完整视频 `overview.mp4` 约 29.6 MiB，因此请按上方说明通过 Git 推送网站。GitHub 网页上传另有 25 MiB 单文件限制；参见 [GitHub 文件大小文档](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)。

## 文件与授权

论文、图片和视频的权利归原作者所有；此仓库不额外授予素材再利用许可。当前页面仅使用 DM Sans 字体（通过 Fontsource 获取，SIL Open Font License）；字体资源与许可证包含在 `assets/fonts/`。本网站不包含训练代码。
