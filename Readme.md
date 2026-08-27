# 知识路线图（V-Bahn）项目交接说明

## 1. 项目是什么

静态前端 SPA：选角页 → 地铁知识路线图。


| 项      | 说明                                                                                                   |
| ------ | ---------------------------------------------------------------------------------------------------- |
| 线上地址   | [https://academy.vectoryun.cn/v-bahn/](https://academy.vectoryun.cn/v-bahn/)                         |
| Git 仓库 | [https://github.com/mrw918/subway-web](https://github.com/mrw918/subway-web)                         |
| 构建发布   | [http://106.15.237.121:8080/job/academy.webbuild/](http://106.15.237.121:8080/job/academy.webbuild/) |
| 技术栈    | HTML + CSS + JS + SVG（无构建工具、无 npm）                                                                   |
| 默认分支   | `main`                                                                                               |


---



## 2. 打开项目（本地开发）



### 2.1 拉取代码

```bash
git clone https://github.com/mrw918/subway-web.git
cd subway-web
```

若已有本地目录：

```bash
git checkout main
git pull origin main
```



### 2.2 本地预览

必须用 HTTP 服务打开（不要直接双击 `index.html`，否则 SVG `fetch` 会失败）。

任选一种：

```bash
# Python
python -m http.server 8080
```

```bash
# Node（若已安装）
npx serve -p 8080
```

浏览器访问：

```text
http://localhost:8080/index.html
```

---



## 3. 目录结构（改哪里）

```text
├── index.html                 # 入口页、地铁图工具栏样式
├── css/
│   ├── role-select.css        # 选角页样式（含移动端抽屉）
│   ├── roadmap-interactions.css
│   └── node-hover-card.css
├── js/
│   ├── roadmaps.js            # 7 个角色目录（标题、图片、details、svg 映射）
│   ├── role-select.js         # 选角页逻辑
│   ├── app.js                 # 路由：选角 ↔ 地铁图
│   ├── node-data*.js          # 各职业站点悬停文案
│   ├── svg-roadmap-*.js       # 地铁图交互 / 构图
│   └── route-presets.js       # 路线预设文案
├── 素材/                      # 选角大图 / 小图 PNG（勿删）
└── 知识路线图 新ci 1-*.svg    # 各角色地铁图 SVG
```



### 常见修改对照


| 需求                                  | 改这些文件                                                                   |
| ----------------------------------- | ----------------------------------------------------------------------- |
| 角色中英文名、详情 ROLE/FOCUS/SKILLS/MISSION | `js/roadmaps.js`                                                        |
| 选角页布局 / 抽屉 / 头像间距                   | `js/role-select.js`、`css/role-select.css`                               |
| 换角色主图 / 头像                          | 替换 `素材/` 下对应 PNG，必要时改 `roadmaps.js` 路径或 `heroVersion` / `avatarVersion` |
| 站点说明文案                              | 对应 `js/node-data-*.js`                                                  |
| 地铁图视觉                               | 对应 `知识路线图 新ci 1-*.svg`                                                  |
| 地铁图交互（悬停、搜索）                        | `js/svg-roadmap-interactions.js` 等                                      |


改完静态资源后，建议在 `index.html` 里把对应 `?v=` 版本号 +1，避免线上缓存旧文件。

---



## 4. 修改 → 推 Git → 构建发布（完整流程）



### 4.1 本地改完自测

1. 起本地服务，打开 `index.html`
2. 检查：选角切换、ENTRE 进地铁图、返回选择、搜索、移动端详情抽屉



### 4.2 提交并推送到 GitHub

目标仓库：[https://github.com/mrw918/subway-web](https://github.com/mrw918/subway-web)

改完并自测通过后，在项目根目录执行：

```bash
# 1. 自动追踪本地的删除和修改
git add -A

# 2. 提交（按本次改动改 commit 说明）
git commit -m "change"

# 3. 推送到 GitHub（绕过本机失效代理，避免 push 失败）
git -c http.proxy= -c https.proxy= push -u origin main --progress
```

说明：

- `git add -A`：把新增、修改、删除的文件一并暂存
- `git commit -m "..."`：提交说明按实际改动改写即可
- 本机若配置了 `http.proxy` / `https.proxy`（常见如 `http://127.0.0.1:7890`），代理未开时 `git push` 会失败；用上面的 `-c http.proxy= -c https.proxy=` 仅本次推送清空代理，**不必改全局 git config**
- 若仍失败，可检查：网络、GitHub 登录 / Token、是否有该仓库写权限
- 需要有该仓库写权限；首次推送可能要登录 GitHub / Token



### 4.3 Jenkins 点 Build（发布到线上）

1. 打开：[http://106.15.237.121:8080/job/academy.webbuild/](http://106.15.237.121:8080/job/academy.webbuild/)
2. 登录 Jenkins（向负责人要账号）
3. 点 **Build Now**（或页面上的 Build）
4. 等 Job 跑完（绿色成功）
5. 打开线上验证：[https://academy.vectoryun.cn/v-bahn/](https://academy.vectoryun.cn/v-bahn/)
6. 若页面没更新：强制刷新（`Ctrl+F5`），或确认 `index.html` 里 `?v=` 已加版本号

**顺序务必记住：**

```text
本地改代码 → commit → push 到 GitHub → Jenkins Build → 打开线上验收
```

不要只改本地不推仓；也不要未 push 就点 Build（Build 拉的是仓库代码）。

---



## 5. 角色与文件映射（速查）


| 角色 ID          | 中文名         | SVG                 | 节点数据                        |
| -------------- | ----------- | ------------------- | --------------------------- |
| `diagnostic`   | 诊断工程师       | `知识路线图 新ci 1-7.svg` | `node-data-diagnostic.js`   |
| `mbse`         | MBSE系统设计工程师 | `知识路线图 新ci 1-3.svg` | `node-data-mbse.js`         |
| `soa`          | SOA工程师      | `知识路线图 新ci 1-1.svg` | `node-data-soa.js`          |
| `calibration`  | 标定工程师       | `知识路线图 新ci 1-2.svg` | `node-data-calibration.js`  |
| `network-dev`  | 网络开发工程师     | `知识路线图 新ci 1-5.svg` | `node-data.js`              |
| `network-test` | 网络测试工程师     | `知识路线图 新ci 1-4.svg` | `node-data-network-test.js` |
| `embedded`     | 嵌入式软件开发工程师  | `知识路线图 新ci 1-6.svg` | `node-data-embedded.js`     |


配置入口：`js/roadmaps.js`（`ROADMAP_CATALOG`）。

---



## 6. 注意事项

1. **不要删** `素材/`：选角页主图与头像都依赖它。
2. **路径含中文**：本地/服务器需支持 UTF-8 路径；`role-select.js` 会对资源路径做 `encodeURIComponent`。
3. **发布链路**：GitHub `main` → Jenkins `academy.webbuild` → 线上 `/v-bahn/`。
4. **缓存**：改 CSS/JS 后请递增 `index.html` 中的 `?v=`。
5. **Jenkins / 线上权限**：账号找项目负责人开通。

---



## 7. 一页纸 checklist

- [ ] `git pull` 最新 `main`
- [ ] 本地 `http.server` 验证通过
- [ ] `git add -A` → `git commit -m "..."` → `git -c http.proxy= -c https.proxy= push -u origin main --progress`
- [ ] Jenkins：[http://106.15.237.121:8080/job/academy.webbuild/](http://106.15.237.121:8080/job/academy.webbuild/) → **Build**
- [ ] 线上：[https://academy.vectoryun.cn/v-bahn/](https://academy.vectoryun.cn/v-bahn/) → 强制刷新验收