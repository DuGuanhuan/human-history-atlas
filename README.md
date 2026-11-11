## 编辑完整性审计
运行 `node tests/editorial-integrity.mjs` 生成 `test-results/editorial-integrity.json`，包含八区分层、逐事件来源域名、长度和待复核警告。此工具**不联网、不核验历史事实或许可证**；`complete` 仅表示长文结构草稿，`verifiedComplete: 0` 是保守的核验状态，不等于这些文章事实错误。CI 在静态阶段运行并保留报告。

# Human History Atlas · 世界历史交互图谱

可离线运行的交互式世界历史时间线项目。`index.html` 为当前单文件版本，直接用浏览器打开即可。

## 可重复质量验证
- `node tests/validate.mjs`：不依赖第三方包的静态JS与数据一致性验证。
- `npm install --no-save --package-lock=false @playwright/test@1.56.1 && npx playwright install chromium && npx playwright test tests/explore.spec.mjs`：本地双视口Chromium回归；运行需要Node和浏览器下载权限；CI 固定 ubuntu-24.04，避免 ubuntu-latest 升级到不受 Playwright 1.56.1 支持的 Ubuntu 26.04。
- `.github/workflows/atlas-quality.yml`：在GitHub Actions自动运行并保留失败截图。2026-11-10 已在 GitHub Actions run 42697006602 验证静态检查成功、Chromium 桌面/手机共 12 项通过；后续提交仍须查看各自运行结果。

- `node tests/validate.mjs` 还会生成 `test-results/content-audit.json`：逐条列出121事件的地区、时期、正文等级、篇幅和深读来源条目数；这只是编辑工作量审计，**不代表来源链接已经打开核验**。

- `node tests/validate.mjs` 同时生成 `test-results/evidence-audit.json`：列出全部事件的深读链接、各链接声称支持的范围、域名分布及待核状态。**域名不同不代表机构独立，链接存在不代表已经打开或逐项核实**；报告中的 `claimLevelVerified` 与 `independentOrganizationsVerified` 均保守标记为 false。

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
