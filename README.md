# Human History Atlas · 世界历史交互图谱

可离线运行的交互式世界历史时间线项目。`index.html` 为当前单文件版本，直接用浏览器打开即可。

## 项目文件
- `index.html` — 可交互网站入口（当前完整 HTML）
- `history-data.json` — 从旧版生成流程保留的历史数据快照，供后续模块化重构；目前网站运行**不依赖**它，避免误认为已自动同步
- `ROADMAP.md` — 长期规划及迭代交付验收原则
- `CHANGELOG.md` — 版本与后续提交记录

## 发布
将仓库托管到 GitHub 后，可启用 GitHub Pages（Settings → Pages → Deploy from a branch → main/root），或在 Vercel 中导入该仓库。尚未配置自动部署。

## 数据与编辑
当前网页内新增的记录可能保存在浏览器本地，**不会自动提交回 GitHub**。修改网页或同步用户私有数据前请先导出备份。
