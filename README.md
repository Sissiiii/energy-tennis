# Nice Shot — Coffee & Tennis

一个咖啡与网球主题的响应式网页小游戏。使用 Vite、原生 JavaScript、SVG 与 Canvas，无后端、无密钥、无外部字体请求。

## 运行

需要 Node.js 20.19+ 或 22.12+。

```sh
npm ci --cache /tmp/energy-npm-cache
npm run dev
```

```sh
npm test        # 游戏状态与规则
npm run build   # 生产构建，输出 dist/
npm run test:e2e # 桌面与手机浏览器完整流程
```

浏览器测试使用 `/usr/bin/chromium`。其他环境可安装 Playwright Chromium，并删除 playwright.config.js 中的 executablePath 覆盖。

## 游戏规则

- 开场选择 Coffee（1 杯）或 No（0 杯）。点击 HIT 或按空格击球。
- 每 12 次 HIT 进入 Break Point / Coffee Break。Coffee 加一杯，No 保持杯数。
- 0 杯灰色、快速失去动能；1–2 杯逐渐有力；3–4 杯加速与星星；4–6 杯绿色、有力撞击四边、持续反弹；7–9 杯更快、抖动、方向随机。
- 1.1 秒内至少 5 次 HIT 触发 Stir × Spin。
- 10 杯亮粉色，LOVE 与爱心出现，此后再 HIT 10 次全屏红色 Game Over。
- Coffee Break 时暂停球；杯数不超过 10；重新开始清空所有状态。
- 网球字样包含 Nice Shot、Ace、Advantage、Deuce、Match Point，以及咖啡双关 Game, Set, Sip。它们是氛围提示，不构成标准网球计分系统。

## 素材与性能

球场来自用户提供的 coffee.ai 的内嵌图像，导出为约 28 KB 的 WebP。咖啡杯、三种球与球拍直接提取原稿矢量路径。颜色使用原稿灰色 #677577、绿色 #bbf76d、亮粉 #ff29d7、浅粉 #edb3f4、黄色 #f9dc80。界面全英文，移除宣传介绍。字体使用原稿 Chalkduster：内嵌用户上传的完整 Chalkduster.ttf 转换得到的 WOFF，所有字母、数字和球拍文字统一使用该字体。原始 AI 不放入仓库。

动画使用 requestAnimationFrame；粒子最多 100 个，尾迹最多 9 个点，Canvas 像素倍率最多 2。支持 prefers-reduced-motion，减少粒子、闪动与抖动。布局适配手机触摸与电脑点击。

运行 `npm run build && node scripts/standalone.js` 可更新 `/workspace/Nice-Shot.html` 离线版。

当前使用原稿 1366:768 横向比例；球放大到桌面最多 120px；7–10 杯持续随机转向与抖动。咖啡轨道固定十格且不溢出。完整字体已接入，不再依赖 Mac 本机字体。

开场先点击 Start 球拍，再显示独立的 Start with a coffee? 选择；首次选择后才显示游戏、咖啡栏与操作。Coffee Break 模糊主界面并设置 inert，选完恢复。训练结束显示 Today’s training is over. / You’re a bad tennis player, but you’re a coffee lover.

LOVE 在 10 杯阶段进入时放大缩小两次。评价提示统一 Chalkduster，随机位置与颜色（相邻提示不重复），带弹出、淡出效果。固定 Nice Shot 标题已移除。

计分：右边 +15、左边 −15、上边 +5、下边 −5；角落碰撞累计两条边的分数，每次碰撞只计一次。球拍手柄上的四个方向键与键盘方向键选择下一次 HIT 的方向。0–2 杯力度弱且方向误差大，4–6 杯方向最准确，7–10 杯随机失控且偏向左侧扣分区。分数可以为负，同时保留本轮最高分。结束显示最终与最高分。只有 HIT 后出现评价；Break Point 只显示在 Coffee Break 弹窗内。

页面根据窗口宽度和剩余高度同时缩放，保持 1366:768 比例，并居中完整显示球场及所有操作。
