# 🍄 超级马里奥 · 像素平台跳跃

一款用**纯原生 HTML5 Canvas + JavaScript** 实现的横版平台跳跃游戏，零依赖、无构建步骤，双击即可游玩，可直接部署到 Vercel / Netlify / GitHub Pages。

## 🎮 玩法

- **移动**：← → 或 `A` / `D`
- **跳跃**：↑ / `W` / 空格（长按跳得更高）
- **火球**：`X` 或 `F`（需先吃到火焰花 🌸）
- **踩敌人**：跳到敌人头顶击败，+100 分
- **金币**：碰到 +200 分；顶「?」问号砖也能弹出金币或道具
- **通关**：一路向右抵达红旗，进入下一关；通过最后一关获胜
- **失败**：被撞 / 掉坑 / 超时损失生命，生命用完游戏结束（可重开或重选关卡）
- **选关**：开始界面自由选择 6 大关卡，无需解锁

## ✨ 特性

- 🎨 **像素风精灵**：马里奥（小/大）、蘑菇怪、金币、道具均为像素绘制，`image-rendering: pixelated` 保证清晰
- 🗺️ **6 大关卡**：两大世界、六种主题（草原 / 丘陵 / 山谷 / 沙漠 / 雪原 / 熔岩），难度递增
- 🍄 **道具系统**：
  - 🍄 **超级蘑菇** → 变大（可多承受一次伤害）
  - 🌸 **火焰花** → 发射火球
  - ⭐ **无敌星** → 限时无敌，碰到敌人直接消灭
- 🔥 **火球攻击**：火焰形态按 `X` 发射，可反弹、击杀敌人
- 🏆 **本地排行榜**：最高分前 5 名持久化保存，每关另有「最佳分」记录（localStorage）
- 🪙 **金币钱包**：捡到的金币在结算时入账，持久化保存
- 🛒 **游戏商城**：用金币购买 8 款马里奥皮肤（换装换色），可随时装备
- ⚙️ **游戏设置**：音效 / 初始生命数 / 屏幕震动 / 时间模式 均可调
- 🧱 **可破坏砖块**：变大后顶砖块可撞碎
- 真实物理（重力 / 加速度 / 可变跳高 / 土狼时间 / 跳跃缓冲）
- 侧滚相机 + 屏幕震动 + 视差背景（云朵 / 远山）
- Web Audio 实时合成音效（跳跃 / 金币 / 踩怪 / 道具 / 死亡 / 通关）
- 移动端触控按钮（方向 + 跳跃 + 火球）

## 📁 文件结构

```
mario-game/
├── index.html    # 画布、HUD、覆盖层、排行榜、触控按钮
├── style.css     # 布局与界面样式
├── game.js       # 全部游戏逻辑（关卡、物理、精灵、道具、音效）
├── .gitignore    # 忽略 .vercel 等本地文件
├── vercel.json   # Vercel 静态站点部署配置
└── README.md
```

## 🚀 本地运行

直接双击 `index.html` 即可；或在目录下：

```bash
python -m http.server 8000
# 访问 http://localhost:8000
```

## ☁️ 部署到 Vercel / Netlify

### 方式一：拖拽部署（最快）
1. 登录 [Vercel](https://vercel.com) 或 [Netlify](https://netlify.com)
2. 把整个 `mario-game` 文件夹拖入网页的部署区域
3. 无需任何配置，几秒后得到线上地址

### 方式二：连接 GitHub（可自动更新）
```bash
cd mario-game
git init
git add .
git commit -m "mario pixel platformer"
# 在 GitHub 新建仓库后：
git remote add origin https://github.com/你的用户名/仓库名.git
git branch -M main
git push -u origin main
```
然后在 Vercel / Netlify 选择 **Import from Git**：
- Framework Preset：`Other`（或留空）
- Build Command：留空
- Output Directory：留空（默认根目录）

## 🛠️ 自定义

- **改关卡**：编辑 `game.js` 里的 `LEVELS` 数组 —— `gaps`（坑洞）、`pipes`（管道）、`blocks`（砖块/问号砖，第三项为 `coin`/`mush`/`flower`/`star`/`brick`）、`coins`、`enemies`、`flagTile`。
- **改手感**：调整 `game.js` 顶部的 `GRAVITY`、`JUMP_VEL`、`MOVE_SPEED` 等常量。
- **改精灵图**：编辑 `game.js` 顶部的像素字符串数组（`MARIO_SMALL`、`MARIO_BIG`、`GOOMBA` 等）与 `PAL` 调色板。

## 📄 说明

本项目仅用于学习与娱乐，灵感致敬任天堂《超级马里奥》系列；不包含任何任天堂的素材或商标内容。
