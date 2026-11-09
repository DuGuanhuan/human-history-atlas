# Human History Atlas · 世界历史交互图谱

可离线运行的交互式世界历史时间线项目。`index.html` 为当前单文件版本，直接用浏览器打开即可。

## 项目文件
- `index.html` — 可交互网站入口（当前完整 HTML）
- `history-data.json` — 从旧版生成流程保留的历史数据快照，供后续模块化重构；目前网站运行**不依赖**它，避免误认为已自动同步
- `ROADMAP.md` — 长期规划及迭代交付验收原则
- `CHANGELOG.md` — 版本与后续提交记录

## 在线网站与自动部署
- **正式网站**：https://human-history-atlas.vercel.app
- **部署平台**：Vercel（项目 `human-history-atlas`，团队 `duguanhuans-projects`）
- **源代码**：GitHub `DuGuanhuan/human-history-atlas`，生产分支 `main`
- **发布流程**：向 `main` 提交变更 → Vercel Git 集成自动发起生产构建 → 构建成功后更新正式网站；非生产分支可产生预览部署（默认受 Vercel Authentication 保护）。
- **构建方式**：静态 HTML，无需 npm、服务器后端或打包器；入口为仓库根目录 `index.html`。
- **状态检查**：[Vercel 项目控制台](https://vercel.com/duguanhuans-projects/human-history-atlas) → Deployments。构建失败时检查对应部署的日志与提交号。
- **安全提示**：不要将 API 密钥写入 `index.html` 或提交到 GitHub；站内笔记/用户自定义事件仍只保存在用户本机，不会自动同步到线上。
- **回滚方法**：Vercel Deployments 中选择已验证的历史版本并恢复；也可通过 GitHub revert 后重新触发自动部署。

**部署与内容版本相互独立**：Vercel 自动发布 GitHub 代码，不能替代浏览器测试、历史事实核验或图片版权检查。

## 数据与编辑
当前网页内新增的记录可能保存在浏览器本地，**不会自动提交回 GitHub**。修改网页或同步用户私有数据前请先导出备份。
