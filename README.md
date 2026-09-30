# Heavenfall

An original roguelike deck-building game set in a xianxia world where the Heavenly Dao has been corrupted by an otherworldly poison.

You play as Lin Jian or Lin Qin, the child of a disgraced Heavenly Sect prodigy. To fulfil your father's last wish, you set out from the mortal realm to find the lost Heavenly Sect and uncover why he was stripped of his cultivation and cast out.

## Chapter 1 Demo (text-based prototype)

- **Play online:** https://sunsetzf2023.github.io/heavenfall/
- **Run locally:** `npm install && npm run dev`，打開終端機顯示的網址即可
- **單檔離線版：** `npm run build:single` 產生 `dist-single/index.html`，雙擊即玩

The demo covers the mortal-realm journey, the martial tournament where you choose your school, and the chapter boss. The game text is in Traditional Chinese. All cards, characters, story and systems are original. The demo is an early prototype and its numbers are not yet balanced.

### Features

- Turn-based card battles in which enemies, like you, have their own HP, qi, action points and decks.
- Two original martial schools:
  - **Liuhen (Lingering Scars):** every strike leaves a scar on the enemy; strike a fully scarred foe and the scars burst.
  - **Fushan (Bearing the Mountain):** armour that endures between turns and can be hurled back as damage.
- Random events, shops, level-ups and a cast of mortal-realm characters.

## 專案結構

```
heavenfall/
├── index.html              # Vite 入口（薄殼，載入 src/main.js）
├── package.json
├── vite.config.js          # base './'（GitHub Pages）；single 模式打包單檔
├── src/
│   ├── main.js             # 入口：titleScreen()
│   ├── style.css
│   ├── config.js           # CFG 可調數值（生命/手牌/經驗表/物價）
│   ├── utils.js            # R/shuffle/pick/v/inst
│   ├── state.js            # 全域狀態 G（整局）/B（戰鬥）/S（畫面）/notice
│   ├── game.js             # newGame 開局
│   ├── cards/              # 卡牌資料（加新卡只動這裡）
│   │   ├── index.js        # CARDS 總表 + 卡池 + cname/cost/stars
│   │   ├── common.js       # 凡人・通用・雜念
│   │   ├── liuhen.js       # 留痕
│   │   ├── fushan.js       # 負山
│   │   └── enemy.js        # 敵人專屬
│   ├── enemies.js          # 敵人資料（牌組/數值/intro/戰後事件 key）
│   ├── schools.js          # 流派與技能
│   ├── engine/
│   │   ├── combat.js       # 規則層：傷害/刻痕/斬崩/反制/兵器掛鉤/出牌
│   │   ├── battle.js       # 回合流程：玩家回合/敵人 AI/勝負判定
│   │   └── aftermath.js    # 戰後：勝利結算/升級/戰敗/道心武魄
│   ├── ui/
│   │   ├── dom.js          # h/btn/show 微型 DOM + 狀態列 + 出牌動畫
│   │   └── battleScreen.js # 戰鬥畫面
│   ├── events.js           # 戰後劇情事件（敵人 after）
│   ├── map.js              # 書頁地圖 PAGES + 設施/商店/事件頁
│   └── story.js            # 標題/祝福/臨行前夜/大比拜師/結局
├── tests/                  # vitest 資料完整性冒煙測試
├── docs/                   # 設計文件
└── .github/workflows/      # CI：test → build → deploy GitHub Pages
```

## 常用指令

| 指令 | 用途 |
|---|---|
| `npm run dev` | 開發伺服器（熱更新） |
| `npm test` | 跑資料完整性測試 |
| `npm run build` | 打包到 `dist/`（CI 部署用） |
| `npm run build:single` | 打包成單一 HTML 到 `dist-single/`（離線分發） |
| `npm run preview` | 預覽 build 結果 |

## 設計文件

- [GDD・已定決策清單](docs/GDD_已定決策.md)
- [第一章・敵人與 NPC](docs/C5_第一章_敵人與NPC_v1.md)

## 歷史版本

- `v0.1-initial-demo`：最初的單檔 demo（`git show v0.1-initial-demo:index.html`）
