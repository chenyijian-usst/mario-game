/* ============================================================
   超级马里奥风格 · 平台跳跃 · 完整版
   像素风精灵 / 3 关卡 / 道具(蘑菇·火焰花·无敌星) / 火球 / 本地排行榜
   纯原生 JS + Canvas，零依赖
   ============================================================ */
(function () {
  'use strict';

  /* ================= 常量 ================= */
  const VIEW_W = 960;
  const VIEW_H = 480;
  const TILE = 32;
  const ROWS = 15;               // 480 / 32
  const GROUND_TOP = 12;

  const GRAVITY = 2200;
  const MAX_FALL = 980;
  const JUMP_VEL = 780;
  const MOVE_SPEED = 275;
  const ACCEL = 2400;
  const AIR_ACCEL = 1500;
  const FRICTION = 2600;
  const AIR_DRAG = 900;
  const COYOTE = 0.09;
  const JUMP_BUFFER = 0.12;

  const T = { EMPTY: 0, GROUND: 1, DIRT: 2, BRICK: 3, QBLOCK: 4, USED: 5, PIPE: 6 };
  const SOLID = new Set([T.GROUND, T.DIRT, T.BRICK, T.QBLOCK, T.USED, T.PIPE]);

  /* ================= 调色板 & 像素精灵 ================= */
  const PAL = {
    R: '#e52521', B: '#2b59c3', H: '#f8c878', K: '#1a1a1a',
    N: '#7a3b12', Y: '#ffd23f', W: '#ffffff', G: '#4ec24a',
    O: '#ff9d3b', C: '#ffe0b0', E: '#b5532a', D: '#6f4420',
    S: '#8a5a2b', P: '#f5d9a8',
  };

  // 小马里奥 12×16
  const MARIO_SMALL = [
    '....RRRR....',
    '..RRRRRRRR..',
    '..HHHHRRR...',
    '.HHHHHHRRR..',
    '.HHKHHHHR...',
    '.HHHHHHHH...',
    '.HHKKKKKK...',
    '..RRRRRR....',
    '.RRRRRRRRR..',
    '.RRBBBBRRR..',
    '.RRRBBBBBR..',
    '..BBYBBYB...',
    '..BBBBBBB...',
    '.BBBBBBBBB..',
    '.KKK...KKK..',
    '.KKK...KKK..',
  ];
  // 大马里奥 12×24
  const MARIO_BIG = [
    '....RRRR....',
    '..RRRRRRRR..',
    '..HHHHRRR...',
    '.HHHHHHRRR..',
    '.HHKHHHHR...',
    '.HHHHHHHH...',
    '.HHKKKKKK...',
    '..RRRRRR....',
    '.RRRRRRRRR..',
    '.RRBBBBRRR..',
    '.RRRBBBBBR..',
    '.RRBBYBBYBR.',
    '.RRBBBBBBBR.',
    '.RRBBBBBBBR.',
    '..BBBBBBBB..',
    '..BBBBBBBB..',
    '..BBBBBBBB..',
    '..BBBBBBBB..',
    '.BBBBBBBBBB.',
    '.BBBBBBBBBB.',
    '.BBB....BBB.',
    '.BBB....BBB.',
    '.KKK....KKK.',
    '.KKK....KKK.',
  ];
  // 蘑菇怪 16×16
  const GOOMBA = [
    '....RRRRRR....',
    '...RRRRRRRR...',
    '..RRRRRRRRRR..',
    '.RRRRRRRRRRRR.',
    '.RPHHHHHHHHPR.',
    '.RHHHHHHHHHHR.',
    '.RHWWKKWWKKHR.',
    '.RHWWKKWWKKHR.',
    '.RHHHHHHHHHHR.',
    '.RRHHHHHHHHRR.',
    '..RRRRRRRRRR..',
    '..RRRRRRRRRR..',
    '..KKKK..KKKK..',
    '..KKKK..KKKK..',
    '...KK....KK...',
    '................',
  ];
  // 超级蘑菇（变大）16×16
  const MUSHROOM = [
    '.....RRRRRR....',
    '....RRRRRRRR...',
    '...RRWWRRRWWR..',
    '..RRWWRRRRRWWR.',
    '.RRWRRRRRRRRRR.',
    '.RRRRRRRRRRRRR.',
    '.RHHHHHHHHHHHR.',
    '.RHHHHHHHHHHHR.',
    '.HHHHKKHHKKHHH.',
    '.HHHHHHHHHHHHH.',
    '.HHHHHKKHHHHHH.',
    '.HHHHHHHHHHHHH.',
    '..CCCCCCCCCCCC.',
    '..CCCCCCCCCCCC.',
    '...CCCCCCCCCC..',
    '....CCCCCCCC...',
  ];
  // 火焰花 16×16
  const FLOWER = [
    '.....RRRR......',
    '...RRRYYRRR....',
    '..RRYYYYYYRR...',
    '..RYYWWWWYYR...',
    '.RRYWWYYWWYRR..',
    '.RYYWYYYYWYYR..',
    '.RYWWYYYYWWYR..',
    '.RYYWYYYYWYYR..',
    '.RRYWWYYWWYRR..',
    '..RYYWWWWYYR...',
    '..RRYYYYYYRR...',
    '...RRRYYRRR....',
    '.....RRRR......',
    '......GG.......',
    '.....GGGG......',
    '....GG.GG......',
  ];
  // 无敌星 16×16
  const STAR = [
    '.......YY.......',
    '.......YY.......',
    '.......YY.......',
    '......YYYY......',
    '......YYYY......',
    '.YYYYYYYYYYYYYY.',
    '..YYYYYYYYYYYY..',
    '...YYYYYYYYYY...',
    '....YYYYYYYY....',
    '...YYYYYYYYYY...',
    '...YYYKYYYYYY...',
    '..YYYYKYYYYYYY..',
    '.YYYYYYYYYYYYYY.',
    'YYYYY......YYYYY',
    'YY............YY',
    'Y..............Y',
  ];
  // 金币 8×8（两帧，旋转）
  const COIN_1 = [
    '..YYYY..',
    '.YYYYYY.',
    '.YYWWYY.',
    '.YWWWWY.',
    '.YWWWWY.',
    '.YYWWYY.',
    '.YYYYYY.',
    '..YYYY..',
  ];
  const COIN_2 = [
    '........',
    '...YY...',
    '..YYYY..',
    '..YWWY..',
    '..YWWY..',
    '..YYYY..',
    '...YY...',
    '........',
  ];

  /* ================= DOM ================= */
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const hudScore = document.getElementById('hud-score');
  const hudBest = document.getElementById('hud-best');
  const hudCoins = document.getElementById('hud-coins');
  const hudLevel = document.getElementById('hud-level');
  const hudLives = document.getElementById('hud-lives');
  const hudTime = document.getElementById('hud-time');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayLevels = document.getElementById('overlay-levels');
  const overlaySettings = document.getElementById('overlay-settings');
  const overlayShop = document.getElementById('overlay-shop');
  const overlayPause = document.getElementById('overlay-pause');
  const overlayWin = document.getElementById('overlay-win');
  const overlayOver = document.getElementById('overlay-over');
  const lbList = document.getElementById('lb-list');
  const levelsList = document.getElementById('levels-list');
  const settingsList = document.getElementById('settings-list');
  const shopList = document.getElementById('shop-list');
  const ALL_OVERLAYS = [overlayTitle, overlayLevels, overlaySettings, overlayShop, overlayPause, overlayWin, overlayOver];

  /* ================= 关卡数据 ================= */
  const LEVELS = [
    {
      name: '1-1', cols: 210, time: 300, flagTile: 193,
      title: '草原漫步', desc: '新手起步，道具齐全，熟悉踩怪与顶砖。', diff: '简单', diffClass: 'easy',
      theme: { skyTop: '#3a6ff0', skyMid: '#5c94fc', skyBot: '#bfe8ff', hill1: '#4fae5a', hill2: '#3f9c4a' },
      gaps: [[50, 53], [104, 107], [158, 161]],
      pipes: [[36, 2], [86, 3], [144, 2]],
      blocks: [
        [22, 8, 'coin'], [23, 8, 'coin'], [24, 8, 'mush'],
        [46, 8, 'brick'], [47, 8, 'flower'], [48, 8, 'brick'],
        [66, 8, 'coin'], [67, 8, 'star'], [68, 8, 'coin'],
        [80, 8, 'coin'], [81, 8, 'coin'], [82, 8, 'flower'],
        [112, 8, 'brick'], [113, 8, 'mush'], [114, 8, 'brick'],
        [130, 8, 'coin'], [131, 8, 'flower'], [132, 8, 'coin'],
        [150, 8, 'coin'], [151, 8, 'coin'],
        [172, 8, 'brick'], [173, 8, 'coin'], [174, 8, 'flower'],
      ],
      coins: [[14, 9], [15, 9], [16, 9], [17, 9], [18, 9], [56, 7], [57, 7], [58, 7], [92, 7], [93, 7], [120, 7], [121, 7], [122, 7], [154, 7], [155, 7], [182, 8], [183, 8], [184, 8]],
      enemies: [16, 42, 62, 96, 126, 166, 180],
    },
    {
      name: '1-2', cols: 240, time: 300, flagTile: 222,
      title: '丘陵飞驰', desc: '坑洞连绵，节奏加快，考验跳跃精准度。', diff: '中等', diffClass: 'normal',
      theme: { skyTop: '#f97b1f', skyMid: '#ffb84d', skyBot: '#ffe3a3', hill1: '#d98a3d', hill2: '#b26b2a' },
      gaps: [[38, 41], [74, 77], [110, 114], [146, 149], [182, 185]],
      pipes: [[26, 2], [60, 3], [96, 2], [132, 3], [166, 2], [200, 2]],
      blocks: [
        [20, 8, 'mush'], [22, 8, 'coin'],
        [48, 8, 'flower'], [50, 8, 'brick'],
        [70, 8, 'coin'], [71, 8, 'brick'], [72, 8, 'star'],
        [88, 8, 'coin'], [89, 8, 'flower'], [90, 8, 'coin'],
        [120, 8, 'brick'], [121, 8, 'mush'], [122, 8, 'brick'],
        [140, 8, 'coin'], [141, 8, 'coin'],
        [156, 8, 'flower'], [158, 8, 'brick'],
        [172, 8, 'coin'], [173, 8, 'star'], [174, 8, 'coin'],
        [190, 8, 'brick'], [191, 8, 'flower'], [192, 8, 'brick'],
        [210, 8, 'mush'], [212, 8, 'coin'],
      ],
      coins: [[30, 7], [31, 7], [32, 7], [55, 7], [56, 7], [92, 7], [93, 7], [116, 7], [117, 7], [138, 7], [139, 7], [162, 7], [163, 7], [178, 7], [179, 7], [204, 7], [205, 7], [216, 7], [217, 7]],
      enemies: [12, 34, 52, 66, 84, 102, 124, 152, 176, 196, 214],
    },
    {
      name: '1-3', cols: 260, time: 300, flagTile: 242,
      title: '暮色山谷', desc: '山谷幽深，节奏再升级，跳跃与走位并重。', diff: '中等', diffClass: 'normal',
      theme: { skyTop: '#2e2a5e', skyMid: '#6b5a9e', skyBot: '#c9aef0', hill1: '#7a5c9e', hill2: '#5f4780' },
      gaps: [[28, 31], [60, 63], [92, 96], [126, 129], [158, 161], [190, 193]],
      pipes: [[46, 3], [78, 2], [112, 3], [142, 2], [174, 3], [206, 2]],
      blocks: [
        [18, 8, 'star'], [20, 8, 'coin'],
        [38, 8, 'flower'], [40, 8, 'brick'],
        [54, 9, 'coin'], [55, 9, 'mush'], [56, 9, 'brick'],
        [70, 8, 'coin'], [71, 8, 'brick'], [72, 8, 'flower'],
        [84, 8, 'coin'], [85, 8, 'star'], [86, 8, 'coin'],
        [102, 8, 'brick'], [103, 8, 'flower'], [104, 8, 'brick'],
        [118, 8, 'mush'], [119, 8, 'coin'],
        [134, 8, 'coin'], [135, 8, 'flower'], [136, 8, 'coin'],
        [150, 8, 'brick'], [151, 8, 'star'], [152, 8, 'brick'],
        [166, 8, 'coin'], [167, 8, 'flower'],
        [182, 8, 'brick'], [183, 8, 'coin'], [184, 8, 'flower'],
        [214, 8, 'mush'], [216, 8, 'coin'],
        [230, 8, 'star'], [232, 8, 'coin'],
      ],
      coins: [[24, 7], [25, 7], [52, 7], [53, 7], [88, 6], [89, 6], [90, 6], [108, 7], [109, 7], [122, 7], [123, 7], [146, 7], [147, 7], [154, 7], [155, 7], [170, 7], [171, 7], [198, 7], [199, 7], [210, 7], [211, 7], [236, 7], [237, 7]],
      enemies: [12, 42, 68, 90, 106, 130, 152, 184, 200, 220],
    },
    {
      name: '2-1', cols: 250, time: 300, flagTile: 232,
      title: '沙漠绿洲', desc: '黄沙漫漫，视野开阔，保持节奏稳步推进。', diff: '中等', diffClass: 'normal',
      theme: { skyTop: '#f5a623', skyMid: '#ffcf6b', skyBot: '#ffe9b8', hill1: '#e0a03c', hill2: '#c07a2f' },
      gaps: [[34, 37], [68, 71], [102, 106], [138, 141], [172, 175], [206, 209]],
      pipes: [[52, 3], [86, 2], [120, 3], [156, 2], [190, 3]],
      blocks: [
        [20, 8, 'mush'], [22, 8, 'coin'],
        [46, 8, 'coin'], [47, 8, 'flower'], [48, 8, 'coin'],
        [62, 8, 'brick'], [63, 8, 'star'], [64, 8, 'brick'],
        [80, 8, 'coin'], [81, 8, 'coin'],
        [94, 8, 'flower'], [96, 8, 'brick'],
        [112, 8, 'mush'], [114, 8, 'coin'],
        [128, 8, 'coin'], [129, 8, 'flower'], [130, 8, 'coin'],
        [148, 8, 'brick'], [149, 8, 'star'], [150, 8, 'brick'],
        [164, 8, 'coin'], [165, 8, 'flower'],
        [182, 8, 'brick'], [183, 8, 'coin'], [184, 8, 'brick'],
        [198, 8, 'mush'], [200, 8, 'coin'],
        [214, 8, 'coin'], [215, 8, 'flower'], [216, 8, 'coin'],
      ],
      coins: [[26, 7], [27, 7], [28, 7], [56, 7], [57, 7], [90, 7], [91, 7], [110, 7], [111, 7], [124, 7], [125, 7], [144, 7], [145, 7], [160, 7], [161, 7], [178, 7], [179, 7], [194, 7], [195, 7], [220, 7], [221, 7]],
      enemies: [12, 44, 60, 78, 98, 116, 134, 152, 168, 186, 202, 224],
    },
    {
      name: '2-2', cols: 270, time: 300, flagTile: 252,
      title: '冰封雪原', desc: '冰天雪地，沟壑交错，滑行般的挑战。', diff: '困难', diffClass: 'hard',
      theme: { skyTop: '#3a8fd4', skyMid: '#7cc4f0', skyBot: '#e6f7ff', hill1: '#6fa8d8', hill2: '#4f86b8' },
      gaps: [[30, 33], [62, 65], [96, 100], [130, 133], [162, 165], [194, 198], [226, 229]],
      pipes: [[46, 3], [80, 2], [114, 3], [148, 2], [180, 3], [210, 2]],
      blocks: [
        [18, 8, 'mush'], [20, 8, 'coin'],
        [40, 8, 'coin'], [41, 8, 'flower'], [42, 8, 'coin'],
        [56, 8, 'brick'], [57, 8, 'star'], [58, 8, 'brick'],
        [72, 8, 'coin'], [73, 8, 'flower'], [74, 8, 'coin'],
        [90, 8, 'brick'], [91, 8, 'coin'], [92, 8, 'brick'],
        [106, 8, 'flower'], [108, 8, 'coin'],
        [122, 8, 'coin'], [123, 8, 'mush'], [124, 8, 'coin'],
        [140, 8, 'brick'], [141, 8, 'star'], [142, 8, 'brick'],
        [156, 8, 'coin'], [157, 8, 'flower'],
        [172, 8, 'brick'], [173, 8, 'coin'], [174, 8, 'brick'],
        [188, 8, 'mush'], [190, 8, 'coin'],
        [204, 8, 'coin'], [205, 8, 'flower'], [206, 8, 'coin'],
        [220, 8, 'star'], [222, 8, 'coin'],
        [240, 8, 'coin'], [241, 8, 'flower'], [242, 8, 'coin'],
      ],
      coins: [[24, 7], [25, 7], [52, 7], [53, 7], [86, 7], [87, 7], [110, 7], [111, 7], [118, 7], [119, 7], [136, 7], [137, 7], [144, 7], [145, 7], [168, 7], [169, 7], [184, 7], [185, 7], [200, 7], [201, 7], [216, 7], [217, 7], [234, 7], [235, 7], [246, 7], [247, 7]],
      enemies: [10, 40, 70, 88, 108, 126, 154, 178, 202, 224, 244],
    },
    {
      name: '2-3', cols: 280, time: 300, flagTile: 262,
      title: '熔岩城堡', desc: '最终试炼，机关重重，一鼓作气冲到底。', diff: '困难', diffClass: 'hard',
      theme: { skyTop: '#3a0d0d', skyMid: '#7a1f1f', skyBot: '#e8a16a', hill1: '#8a3a2a', hill2: '#6a2a1a' },
      gaps: [[26, 29], [56, 59], [88, 92], [122, 125], [154, 157], [186, 190], [218, 221], [244, 247]],
      pipes: [[40, 3], [72, 2], [104, 3], [136, 2], [168, 3], [200, 2], [230, 3]],
      blocks: [
        [16, 8, 'star'], [18, 8, 'coin'],
        [34, 8, 'coin'], [35, 8, 'mush'], [36, 8, 'coin'],
        [50, 8, 'brick'], [51, 8, 'flower'], [52, 8, 'brick'],
        [66, 8, 'coin'], [67, 8, 'coin'],
        [82, 8, 'flower'], [84, 8, 'brick'],
        [98, 8, 'coin'], [99, 8, 'star'], [100, 8, 'coin'],
        [114, 8, 'brick'], [115, 8, 'flower'], [116, 8, 'brick'],
        [130, 8, 'mush'], [132, 8, 'coin'],
        [146, 8, 'coin'], [147, 8, 'flower'], [148, 8, 'coin'],
        [162, 8, 'brick'], [163, 8, 'star'], [164, 8, 'brick'],
        [180, 8, 'coin'], [181, 8, 'flower'],
        [194, 8, 'brick'], [195, 8, 'mush'], [196, 8, 'brick'],
        [210, 8, 'coin'], [211, 8, 'flower'], [212, 8, 'coin'],
        [224, 8, 'star'], [226, 8, 'coin'],
        [236, 8, 'coin'], [237, 8, 'flower'], [238, 8, 'coin'],
        [250, 8, 'brick'], [251, 8, 'star'], [252, 8, 'brick'],
      ],
      coins: [[22, 7], [23, 7], [46, 7], [47, 7], [78, 7], [79, 7], [94, 7], [95, 7], [110, 7], [111, 7], [142, 7], [143, 7], [150, 7], [151, 7], [174, 7], [175, 7], [192, 7], [193, 7], [206, 7], [207, 7], [214, 7], [215, 7], [240, 7], [241, 7], [256, 7], [257, 7], [258, 7]],
      enemies: [10, 32, 62, 80, 96, 128, 150, 176, 202, 226, 240, 254],
    },
  ];

  /* ================= 游戏状态 ================= */
  let state = 'title';          // title | levels | settings | shop | playing | clear | over | win
  let paused = false;
  let levelIdx = 0;
  let grid = [];
  let blockContent = new Map();
  let coins = [], goombas = [], items = [], fireballs = [], popCoins = [], particles = [], bumps = [];
  let clouds = [], hills = [];
  let player, cameraX, flagX, castleX;
  let score = 0, coinCount = 0, lives = 3, timeLeft = 300;
  let levelStartScore = 0;
  let shakeTime = 0, shakeMag = 0, invuln = 0, starTimer = 0;
  let coyoteTimer = 0, jumpBuffer = 0, fireCooldown = 0;
  let clearTimer = 0, frame = 0, banner = null;
  const input = { left: false, right: false, jumpHeld: false };

  /* ================= 设置 ================= */
  const SETTINGS_KEY = 'mario-settings-v1';
  let settings = { sound: true, lives: 3, shake: true, timeMode: true };
  function loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem(SETTINGS_KEY));
      if (s && typeof s === 'object') settings = Object.assign(settings, s);
    } catch (e) {}
  }
  function saveSettings() {
    try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) {}
  }

  /* ================= 皮肤 ================= */
  const SKINS = [
    { id: 'classic', name: '经典红帽',   price: 0,  override: {} },
    { id: 'blue',    name: '海洋蓝',     price: 20, override: { R: '#3a7bd5' } },
    { id: 'green',   name: '森林绿',     price: 20, override: { R: '#2f9e44' } },
    { id: 'pink',    name: '樱花粉',     price: 30, override: { R: '#ff6b9d' } },
    { id: 'purple',  name: '暗夜紫',     price: 30, override: { R: '#8e44ad' } },
    { id: 'cyan',    name: '冰晶蓝',     price: 45, override: { R: '#00c2c7', B: '#0a7f8a' } },
    { id: 'gold',    name: '黄金战衣',   price: 60, override: { R: '#ffd23f', B: '#b8860b' } },
    { id: 'dark',    name: '暗影黑',     price: 80, override: { R: '#3a3a3a', B: '#1a1a1a' } },
  ];
  const SKINS_KEY = 'mario-skins-v1';
  let skinState = { owned: ['classic'], equipped: 'classic' };
  function loadSkins() {
    try {
      const s = JSON.parse(localStorage.getItem(SKINS_KEY));
      if (s && typeof s === 'object') {
        skinState.owned = Array.isArray(s.owned) && s.owned.length ? s.owned : ['classic'];
        skinState.equipped = SKINS.some((k) => k.id === s.equipped) ? s.equipped : 'classic';
      }
    } catch (e) {}
  }
  function saveSkins() {
    try { localStorage.setItem(SKINS_KEY, JSON.stringify(skinState)); } catch (e) {}
  }
  function playerPalette() {
    const skin = SKINS.find((s) => s.id === skinState.equipped) || SKINS[0];
    if (!skin.override || !Object.keys(skin.override).length) return PAL;
    return Object.assign({}, PAL, skin.override);
  }

  /* ================= 金币钱包 / 关卡最佳分 ================= */
  const WALLET_KEY = 'mario-wallet-v1';
  const LEVEL_BEST_KEY = 'mario-level-best-v1';
  let wallet = 0;
  let levelBest = {};
  function loadWallet() {
    try { wallet = Math.max(0, parseInt(localStorage.getItem(WALLET_KEY), 10) || 0); } catch (e) {}
  }
  function saveWallet() {
    try { localStorage.setItem(WALLET_KEY, String(wallet)); } catch (e) {}
  }
  function loadLevelBest() {
    try { levelBest = JSON.parse(localStorage.getItem(LEVEL_BEST_KEY)) || {}; } catch (e) { levelBest = {}; }
  }
  function saveLevelBest() {
    try { localStorage.setItem(LEVEL_BEST_KEY, JSON.stringify(levelBest)); } catch (e) {}
  }
  function recordLevelBest(levelScore) {
    const name = LEVELS[levelIdx].name;
    if (levelScore > (levelBest[name] || 0)) { levelBest[name] = levelScore; saveLevelBest(); }
  }
  function bankCoins() {
    wallet += coinCount;
    saveWallet();
    updateWalletUI();
  }
  function updateWalletUI() {
    const els = document.querySelectorAll('.wallet-val');
    Array.prototype.forEach.call(els, (el) => { el.textContent = wallet; });
  }

  /* ================= 音效 ================= */
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; } }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }
  function beep(freq, dur, type, vol, slideTo) {
    if (!settings.sound) return;
    if (!audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type || 'square';
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol || 0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(t); osc.stop(t + dur);
  }
  const sfx = {
    jump: () => beep(300, 0.18, 'square', 0.1, 660),
    coin: () => { beep(988, 0.08, 'square', 0.12); setTimeout(() => beep(1319, 0.22, 'square', 0.12), 70); },
    stomp: () => beep(220, 0.16, 'square', 0.14, 80),
    bump: () => beep(120, 0.1, 'square', 0.1, 90),
    sprout: () => beep(440, 0.35, 'triangle', 0.14, 880),
    powerup: () => { [392, 523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.12, 'square', 0.12), i * 70)); },
    shoot: () => beep(900, 0.12, 'square', 0.1, 300),
    die: () => beep(500, 0.5, 'sawtooth', 0.12, 90),
    clear: () => { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 0.15, 'square', 0.12), i * 90)); },
    win: () => { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => setTimeout(() => beep(f, 0.18, 'square', 0.12), i * 110)); },
  };

  /* ================= 工具 ================= */
  function tileAt(px, py) {
    const tx = Math.floor(px / TILE), ty = Math.floor(py / TILE);
    if (tx < 0 || tx >= grid[0].length || ty < 0 || ty >= ROWS) return T.EMPTY;
    return grid[ty][tx];
  }
  function isSolidAt(px, py) { return SOLID.has(tileAt(px, py)); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  function drawSprite(spr, x, y, flip, scale, palette) {
    const pal = palette || PAL;
    const w = (spr[0] ? spr[0].length : 0) * scale;
    ctx.save();
    ctx.translate(x + w / 2, y);
    ctx.scale(flip ? -1 : 1, 1);
    for (let r = 0; r < spr.length; r++) {
      const row = spr[r];
      for (let c = 0; c < row.length; c++) {
        const col = pal[row[c]];
        if (!col) continue;
        ctx.fillStyle = col;
        ctx.fillRect(c * scale - w / 2, r * scale, scale, scale);
      }
    }
    ctx.restore();
  }

  /* ================= 关卡构建 ================= */
  function buildLevel(idx) {
    const L = LEVELS[idx];
    levelIdx = idx;
    levelStartScore = score;
    grid = [];
    for (let y = 0; y < ROWS; y++) grid.push(new Array(L.cols).fill(T.EMPTY));
    for (let x = 0; x < L.cols; x++) {
      grid[GROUND_TOP][x] = T.GROUND;
      grid[GROUND_TOP + 1][x] = T.DIRT;
      grid[GROUND_TOP + 2][x] = T.DIRT;
    }
    L.gaps.forEach(([a, b]) => {
      for (let x = a; x <= b; x++) {
        grid[GROUND_TOP][x] = T.EMPTY;
        grid[GROUND_TOP + 1][x] = T.EMPTY;
        grid[GROUND_TOP + 2][x] = T.EMPTY;
      }
    });
    L.pipes.forEach(([x, h]) => {
      for (let y = GROUND_TOP - h; y < GROUND_TOP; y++) { grid[y][x] = T.PIPE; grid[y][x + 1] = T.PIPE; }
    });

    blockContent = new Map();
    L.blocks.forEach(([x, y, c]) => {
      if (c === 'brick') grid[y][x] = T.BRICK;
      else { grid[y][x] = T.QBLOCK; blockContent.set(x + ',' + y, c); }
    });

    coins = L.coins.map(([x, y]) => ({ x: x * TILE + TILE / 2, y: y * TILE + TILE / 2, r: 11, taken: false, phase: Math.random() * 6 }));
    goombas = L.enemies.map((x) => ({ x: x * TILE + 2, y: GROUND_TOP * TILE - 30, w: 28, h: 28, vx: -60, vy: 0, onGround: false, alive: true, dead: false, squashTimer: 0 }));

    flagX = L.flagTile * TILE;
    castleX = (L.flagTile + 3) * TILE;
    items = []; fireballs = []; popCoins = []; particles = []; bumps = [];

    clouds = [];
    for (let i = 0; i < Math.ceil(L.cols * 32 / 520); i++) clouds.push({ x: i * 520 + Math.random() * 200, y: 30 + Math.random() * 90, s: 0.6 + Math.random() * 0.7 });
    hills = [];
    for (let i = 0; i < Math.ceil(L.cols * 32 / 760); i++) hills.push({ x: i * 760 + Math.random() * 200, s: 0.7 + Math.random() * 0.9 });

    player = { x: 3 * TILE, y: GROUND_TOP * TILE - 32, w: 24, h: 32, vx: 0, vy: 0, onGround: false, facing: 1, runFrame: 0, power: 0 };
    cameraX = 0;
    timeLeft = L.time;
    invuln = 0; starTimer = 0; coyoteTimer = 0; jumpBuffer = 0; fireCooldown = 0; shakeTime = 0;
  }

  function setPower(p) {
    const bottom = player.y + player.h;
    player.power = p;
    player.h = (p === 0) ? 32 : 48;
    player.y = bottom - player.h;
    // 头顶空间不足则向下压
    let guard = 0;
    while (guard++ < 3) {
      const ty0 = Math.floor(player.y / TILE), ty1 = Math.floor((player.y + player.h - 1) / TILE);
      const tx0 = Math.floor(player.x / TILE), tx1 = Math.floor((player.x + player.w - 1) / TILE);
      let hit = false;
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) {
        if (SOLID.has(grid[ty][tx])) { hit = true; }
      }
      if (hit) { player.y += TILE; } else break;
    }
  }

  function spawnItem(type, bx, by) {
    const h = 30;
    const it = { type, x: bx + 1, y: by - h, w: 28, h, vx: 0, vy: 0, onGround: false, alive: true };
    if (type === 'flower') { it.static = true; }
    items.push(it);
    sfx.sprout();
  }

  function spawnPopCoin(cx, cy) { popCoins.push({ x: cx, y: cy, vy: -320, t: 0 }); }
  function burst(x, y, color, n) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, sp = 60 + Math.random() * 160;
      particles.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, life: 0.4 + Math.random() * 0.3, color, size: 4 });
    }
  }
  function burstBricks(bx, by) {
    for (let i = 0; i < 4; i++) {
      particles.push({ x: bx + TILE / 2, y: by + TILE / 2, vx: (i % 2 ? 1 : -1) * (80 + Math.random() * 120), vy: -200 - Math.random() * 200, life: 0.8, color: '#b5532a', size: 8 });
    }
  }

  /* ================= 物理 / 碰撞 ================= */
  function moveEntity(e, dt, bounceX) {
    e.x += e.vx * dt;
    if (e.vx > 0) {
      const right = e.x + e.w;
      const ty0 = Math.floor(e.y / TILE), ty1 = Math.floor((e.y + e.h - 1) / TILE);
      const tx = Math.floor(right / TILE);
      for (let ty = ty0; ty <= ty1; ty++) {
        if (isSolidAt(right, ty * TILE + TILE / 2)) { e.x = tx * TILE - e.w - 0.01; e.vx = bounceX ? -Math.abs(e.vx) : 0; break; }
      }
    } else if (e.vx < 0) {
      const ty0 = Math.floor(e.y / TILE), ty1 = Math.floor((e.y + e.h - 1) / TILE);
      const tx = Math.floor(e.x / TILE);
      for (let ty = ty0; ty <= ty1; ty++) {
        if (isSolidAt(e.x, ty * TILE + TILE / 2)) { e.x = (tx + 1) * TILE + 0.01; e.vx = bounceX ? Math.abs(e.vx) : 0; break; }
      }
    }
    e.y += e.vy * dt;
    if (e.vy > 0) {
      const bottom = e.y + e.h;
      const tx0 = Math.floor(e.x / TILE), tx1 = Math.floor((e.x + e.w - 1) / TILE);
      const ty = Math.floor(bottom / TILE);
      for (let tx = tx0; tx <= tx1; tx++) {
        if (isSolidAt(tx * TILE + TILE / 2, bottom)) { e.y = ty * TILE - e.h - 0.01; e.vy = 0; e.onGround = true; break; }
      }
    } else if (e.vy < 0) {
      const top = e.y;
      const tx0 = Math.floor(e.x / TILE), tx1 = Math.floor((e.x + e.w - 1) / TILE);
      const ty = Math.floor(top / TILE);
      for (let tx = tx0; tx <= tx1; tx++) {
        if (isSolidAt(tx * TILE + TILE / 2, top)) {
          e.y = (ty + 1) * TILE + 0.01; e.vy = 0;
          if (e === player) hitBlockAbove(tx, ty);
          break;
        }
      }
    }
  }

  function hitBlockAbove(tx, ty) {
    if (ty < 0 || ty >= ROWS) return;
    const t = grid[ty][tx];
    if (t === T.QBLOCK) {
      const content = blockContent.get(tx + ',' + ty) || 'coin';
      grid[ty][tx] = T.USED;
      blockContent.delete(tx + ',' + ty);
      bumps.push({ x: tx * TILE, y: ty * TILE, t: 0 });
      if (content === 'coin') { coinCount++; score += 200; spawnPopCoin(tx * TILE + TILE / 2, ty * TILE - 14); sfx.coin(); }
      else spawnItem(content, tx * TILE, ty * TILE);
    } else if (t === T.BRICK) {
      if (player.power >= 1) {
        grid[ty][tx] = T.EMPTY;
        score += 50;
        burstBricks(tx * TILE, ty * TILE);
        shakeTime = 0.1; shakeMag = 3;
        sfx.bump();
      } else {
        bumps.push({ x: tx * TILE, y: ty * TILE, t: 0 });
        sfx.bump();
      }
    }
  }

  /* ================= 玩家 ================= */
  function updatePlayer(dt) {
    const p = player;
    const move = (input.right ? 1 : 0) - (input.left ? 1 : 0);

    if (move !== 0) {
      const a = p.onGround ? ACCEL : AIR_ACCEL;
      p.vx += move * a * dt;
      p.vx = clamp(p.vx, -MOVE_SPEED, MOVE_SPEED);
      p.facing = move;
    } else {
      const f = p.onGround ? FRICTION : AIR_DRAG;
      if (Math.abs(p.vx) < f * dt) p.vx = 0;
      else p.vx -= Math.sign(p.vx) * f * dt;
    }

    p.vy += GRAVITY * dt;
    if (p.vy > MAX_FALL) p.vy = MAX_FALL;

    if (jumpBuffer > 0 && (p.onGround || coyoteTimer > 0)) {
      p.vy = -JUMP_VEL; p.onGround = false; coyoteTimer = 0; jumpBuffer = 0; sfx.jump();
    }

    const wasGround = p.onGround;
    moveEntity(p, dt);
    if (wasGround && !p.onGround && p.vy >= 0) coyoteTimer = COYOTE;
    else if (coyoteTimer > 0) coyoteTimer -= dt;
    if (jumpBuffer > 0) jumpBuffer -= dt;

    p.x = clamp(p.x, 0, castleX - p.w);
    if (p.y > VIEW_H + 60) loseLife();

    if (Math.abs(p.vx) > 20 && p.onGround) p.runFrame += dt * Math.abs(p.vx) / 16;
    else p.runFrame = 0;

    if (fireCooldown > 0) fireCooldown -= dt;
  }

  function shootFire() {
    if (player.power < 2 || fireCooldown > 0) return;
    fireCooldown = 0.4;
    const fx = player.facing > 0 ? player.x + player.w : player.x - 14;
    fireballs.push({ x: fx, y: player.y + player.h / 2 - 5, r: 8, vx: player.facing * 400, vy: -120, life: 2 });
    sfx.shoot();
  }

  function hurtPlayer() {
    if (invuln > 0 || state !== 'playing') return;
    if (starTimer > 0) return;                 // 无敌星状态不受伤
    if (player.power > 0) {
      setPower(player.power - 1);              // 变大→变小，火焰→变大
      invuln = 2;
      sfx.bump();
      return;
    }
    loseLife();
  }

  function loseLife() {
    if (state !== 'playing') return;
    lives--;
    sfx.die();
    if (lives <= 0) { gameOver(); return; }
    respawn();
  }

  function gameOver() {
    state = 'over';
    bankCoins();
    saveScore(score, levelIdx);
    document.getElementById('over-score').textContent = score;
    document.getElementById('over-best').textContent = getBest();
    document.getElementById('over-coins').textContent = coinCount;
    renderLeaderboard();
    showOverlay(overlayOver);
  }

  function respawn() {
    player.x = 3 * TILE; player.y = GROUND_TOP * TILE - 32;
    player.vx = 0; player.vy = 0; player.power = 0; player.h = 32;
    cameraX = 0; invuln = 2; starTimer = 0;
    timeLeft = LEVELS[levelIdx].time;
  }

  function stomp(g) {
    g.dead = true; g.squashTimer = 0.4;
    player.vy = -380; score += 100;
    shakeTime = 0.12; shakeMag = 3;
    burst(g.x + g.w / 2, g.y + g.h / 2, '#c58a4b', 8);
    sfx.stomp();
  }

  /* ================= 敌人 ================= */
  function updateGoombas(dt) {
    goombas.forEach((g) => {
      if (!g.alive) return;
      g.vy += GRAVITY * dt;
      if (g.vy > MAX_FALL) g.vy = MAX_FALL;
      g.onGround = false;
      moveEntity(g, dt, true);

      // 悬崖检测：在地面上时，前方脚下一格若没有地面就掉头，避免摔下悬崖
      if (g.onGround && !g.dead) {
        const dir = g.vx >= 0 ? 1 : -1;
        const frontX = dir > 0 ? g.x + g.w : g.x;
        if (!isSolidAt(frontX + dir * 2, GROUND_TOP * TILE + TILE / 2)) {
          g.vx = -g.vx;
        }
      }

      if (!g.dead && overlap(player, g)) {
        if (starTimer > 0) stomp(g);
        else if (player.vy > 0 && (player.y + player.h - g.y) < 18) stomp(g);
        else if (invuln <= 0) hurtPlayer();
      }
    });
  }

  /* ================= 道具 ================= */
  function updateItems(dt) {
    items.forEach((it) => {
      if (!it.alive) return;
      if (it.static) {                       // 火焰花固定
        if (overlap(player, it)) collectItem(it);
        return;
      }
      it.vy += GRAVITY * dt;
      if (it.vy > MAX_FALL) it.vy = MAX_FALL;
      it.onGround = false;
      moveEntity(it, dt, true);
      if (it.onGround) {
        if (it.vx === 0) it.vx = (it.type === 'star') ? 80 : 60;
        if (it.type === 'star') it.vy = -430;
      }
      if (overlap(player, it)) collectItem(it);
    });
    items = items.filter((it) => it.alive && it.y < VIEW_H + 100);
  }

  function collectItem(it) {
    it.alive = false;
    score += 1000;
    if (it.type === 'mush') { if (player.power === 0) setPower(1); }
    else if (it.type === 'flower') { setPower(2); }
    else if (it.type === 'star') { starTimer = 8; }
    burst(it.x + 14, it.y + 14, '#ffd23f', 12);
    sfx.powerup();
  }

  /* ================= 火球 ================= */
  function updateFireballs(dt) {
    fireballs.forEach((f) => {
      f.vy += GRAVITY * dt;
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      const groundY = GROUND_TOP * TILE;
      if (f.y + f.r > groundY) { f.y = groundY - f.r; f.vy = -300; }
      if (isSolidAt(f.x + f.r, f.y) || isSolidAt(f.x - f.r, f.y)) f.dead = true;
      f.life -= dt;
      if (f.life <= 0) f.dead = true;

      goombas.forEach((g) => {
        if (g.dead || !g.alive) return;
        const dx = f.x - (g.x + g.w / 2), dy = f.y - (g.y + g.h / 2);
        if (Math.abs(dx) < f.r + g.w / 2 && Math.abs(dy) < f.r + g.h / 2) {
          g.dead = true; g.squashTimer = 0.4; f.dead = true;
          score += 100; burst(g.x + g.w / 2, g.y + g.h / 2, '#ff9d3b', 10); sfx.stomp();
        }
      });
    });
    fireballs = fireballs.filter((f) => !f.dead);
  }

  /* ================= 收集 / 特效 ================= */
  function updateCollectibles(dt) {
    coins.forEach((c) => {
      if (c.taken) return;
      c.phase += dt * 8;
      if (circleOverlap(player, c.x, c.y, c.r)) {
        c.taken = true; coinCount++; score += 200;
        burst(c.x, c.y, '#ffd23f', 10); sfx.coin();
      }
    });
    popCoins.forEach((pc) => { pc.vy += GRAVITY * dt; pc.y += pc.vy * dt; pc.t += dt; if (pc.t > 0.55) pc.dead = true; });
    popCoins = popCoins.filter((pc) => !pc.dead);
    bumps.forEach((b) => b.t += dt);
    bumps = bumps.filter((b) => b.t < 0.28);
    particles.forEach((pt) => { pt.vy += 500 * dt; pt.x += pt.vx * dt; pt.y += pt.vy * dt; pt.life -= dt; });
    particles = particles.filter((pt) => pt.life > 0);
    goombas = goombas.filter((g) => { if (g.dead) { g.squashTimer -= dt; return g.squashTimer > 0; } return g.y < VIEW_H + 100; });
  }

  function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }
  function circleOverlap(r, cx, cy, rad) {
    const nx = clamp(cx, r.x, r.x + r.w), ny = clamp(cy, r.y, r.y + r.h);
    const dx = cx - nx, dy = cy - ny;
    return dx * dx + dy * dy < rad * rad;
  }

  /* ================= 相机 ================= */
  function updateCamera(dt) {
    const worldW = grid[0].length * TILE;
    const target = clamp(player.x - VIEW_W / 2, 0, worldW - VIEW_W);
    cameraX += (target - cameraX) * Math.min(1, dt * 8);
  }

  /* ================= 主更新 ================= */
  function update(dt) {
    if (paused) return;
    frame += dt;
    if (state === 'clear') {
      clearTimer -= dt;
      updateCamera(dt);
      if (clearTimer <= 0) nextLevel();
      return;
    }
    if (state !== 'playing') return;

    if (settings.timeMode && timeLeft > 0) { timeLeft -= dt; if (timeLeft <= 0) { timeLeft = 0; loseLife(); } }
    if (invuln > 0) invuln -= dt;
    if (starTimer > 0) starTimer -= dt;

    updatePlayer(dt);
    updateGoombas(dt);
    updateItems(dt);
    updateFireballs(dt);
    updateCollectibles(dt);
    updateCamera(dt);

    if (player.x + player.w >= flagX) {
      if (settings.timeMode) score += Math.max(0, Math.floor(timeLeft)) * 10;
      recordLevelBest(score - levelStartScore);
      if (levelIdx >= LEVELS.length - 1) {
        state = 'win';
        bankCoins();
        saveScore(score, levelIdx);
        document.getElementById('win-score').textContent = score;
        document.getElementById('win-best').textContent = getBest();
        document.getElementById('win-coins').textContent = coinCount;
        renderLeaderboard();
        sfx.win();
        showOverlay(overlayWin);
      } else {
        state = 'clear';
        clearTimer = 1.6;
        banner = { text: '第 ' + LEVELS[levelIdx].name + ' 关通过！', t: 1.6 };
        sfx.clear();
      }
    }
    if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; }
    if (shakeTime > 0) shakeTime -= dt;
  }

  function nextLevel() {
    buildLevel(levelIdx + 1);
    state = 'playing';
    banner = { text: '第 ' + LEVELS[levelIdx].name + ' 关', t: 1.6 };
  }

  /* ================= 排行榜 ================= */
  const LB_KEY = 'mario-highscores-v1';
  let bestScore = 0;
  function loadScores() {
    try { return JSON.parse(localStorage.getItem(LB_KEY)) || []; } catch (e) { return []; }
  }
  function refreshBest() {
    const list = loadScores();
    bestScore = list.length ? list[0].score : 0;
  }
  function saveScore(s, lvl) {
    const list = loadScores();
    list.push({ score: s, level: LEVELS[lvl].name, date: new Date().toLocaleDateString('zh-CN') });
    list.sort((a, b) => b.score - a.score);
    const top = list.slice(0, 5);
    try { localStorage.setItem(LB_KEY, JSON.stringify(top)); } catch (e) {}
    bestScore = top.length ? top[0].score : 0;
    return top;
  }
  function getBest() {
    return bestScore;
  }
  function renderLeaderboard() {
    const list = loadScores();
    const html = !list.length
      ? '<li>暂无记录，快来创造吧！</li>'
      : list.map((s, i) =>
        '<li><span class="lb-rank">' + (i + 1) + '</span><span class="lb-score">' + s.score + '</span><span class="lb-meta">' + s.level + ' · ' + s.date + '</span></li>'
      ).join('');
    [lbList, document.getElementById('lb-list-win')].forEach((el) => { if (el) el.innerHTML = html; });
  }

  /* ================= 渲染 ================= */
  function draw() {
    ctx.clearRect(0, 0, VIEW_W, VIEW_H);
    const th = LEVELS[levelIdx].theme;
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, th.skyTop); sky.addColorStop(0.55, th.skyMid); sky.addColorStop(1, th.skyBot);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    let sx = 0, sy = 0;
    if (settings.shake && shakeTime > 0) { sx = (Math.random() - 0.5) * shakeMag; sy = (Math.random() - 0.5) * shakeMag; }

    ctx.save();
    ctx.translate(-cameraX + sx, sy);
    drawClouds(); drawHills(); drawTiles(); drawFlagAndCastle();
    drawCoins(); drawItems(); drawGoombas(); drawFireballs();
    drawPlayer(); drawPopCoins(); drawParticles();
    ctx.restore();

    if (banner) drawBanner();
    updateHUD();
  }

  function drawClouds() {
    clouds.forEach((c) => {
      const x = c.x - cameraX * 0.3;
      if (x < -120 || x > VIEW_W + 120) return;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.arc(x, c.y, 20 * c.s, 0, Math.PI * 2);
      ctx.arc(x + 22 * c.s, c.y - 10 * c.s, 24 * c.s, 0, Math.PI * 2);
      ctx.arc(x + 48 * c.s, c.y, 20 * c.s, 0, Math.PI * 2);
      ctx.fill();
    });
  }
  function drawHills() {
    const th = LEVELS[levelIdx].theme;
    hills.forEach((h) => {
      const x = h.x - cameraX * 0.5;
      if (x < -300 || x > VIEW_W + 300) return;
      ctx.fillStyle = th.hill1;
      ctx.beginPath(); ctx.arc(x, GROUND_TOP * TILE, 140 * h.s, Math.PI, 0); ctx.fill();
      ctx.fillStyle = th.hill2;
      ctx.beginPath(); ctx.arc(x + 120 * h.s, GROUND_TOP * TILE, 90 * h.s, Math.PI, 0); ctx.fill();
    });
  }

  function drawTiles() {
    const cols = grid[0].length;
    const x0 = Math.max(0, Math.floor(cameraX / TILE) - 1);
    const x1 = Math.min(cols - 1, Math.ceil((cameraX + VIEW_W) / TILE) + 1);
    for (let ty = 0; ty < ROWS; ty++) for (let tx = x0; tx <= x1; tx++) {
      const t = grid[ty][tx];
      if (t === T.EMPTY) continue;
      drawTile(t, tx * TILE, ty * TILE, tx, ty);
    }
  }
  function drawTile(t, px, py, tx, ty) {
    if (t === T.QBLOCK || t === T.BRICK) {
      const b = bumps.find((b) => b.x === px && b.y === py);
      if (b) py = py - Math.sin((b.t / 0.28) * Math.PI) * 8;
    }
    switch (t) {
      case T.GROUND:
        ctx.fillStyle = PAL.S; ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = PAL.G; ctx.fillRect(px, py, TILE, 8);
        ctx.fillStyle = '#7fd87c'; ctx.fillRect(px, py, TILE, 3);
        ctx.fillStyle = PAL.D; ctx.fillRect(px, py + 8, 2, TILE - 8);
        break;
      case T.DIRT:
        ctx.fillStyle = PAL.S; ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = PAL.D;
        ctx.fillRect(px + 8, py + 6, 2, 6); ctx.fillRect(px + 22, py + 16, 2, 6); ctx.fillRect(px + 4, py + 24, 2, 5);
        break;
      case T.BRICK:
        ctx.fillStyle = PAL.E; ctx.fillRect(px, py, TILE, TILE);
        ctx.strokeStyle = PAL.D; ctx.lineWidth = 2;
        ctx.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2);
        ctx.beginPath();
        ctx.moveTo(px, py + 16); ctx.lineTo(px + TILE, py + 16);
        ctx.moveTo(px + 16, py); ctx.lineTo(px + 16, py + 16);
        ctx.moveTo(px + 8, py + 16); ctx.lineTo(px + 8, py + 32);
        ctx.moveTo(px + 24, py + 16); ctx.lineTo(px + 24, py + 32);
        ctx.stroke();
        break;
      case T.QBLOCK: {
        const pulse = 0.5 + 0.5 * Math.sin(frame * 4 + tx);
        ctx.fillStyle = '#ffb400'; ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = 'rgba(255,255,220,' + (0.25 + pulse * 0.35) + ')'; ctx.fillRect(px, py, TILE, TILE);
        ctx.strokeStyle = '#8a5a00'; ctx.lineWidth = 2; ctx.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 20px "Courier New", monospace';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('?', px + TILE / 2, py + TILE / 2 + 1);
        break;
      }
      case T.USED:
        ctx.fillStyle = '#7a5a35'; ctx.fillRect(px, py, TILE, TILE);
        ctx.strokeStyle = '#4a3015'; ctx.lineWidth = 2; ctx.strokeRect(px + 1, py + 1, TILE - 2, TILE - 2);
        break;
      case T.PIPE: {
        const isTop = ty === 0 || grid[ty - 1][tx] !== T.PIPE;
        const isLeft = tx === 0 || grid[ty][tx - 1] !== T.PIPE;
        const isRight = tx === grid[0].length - 1 || grid[ty][tx + 1] !== T.PIPE;
        ctx.fillStyle = '#2f9e44'; ctx.fillRect(px, py, TILE, TILE);
        ctx.fillStyle = '#7ed957'; ctx.fillRect(px + 3, py, 6, TILE);
        ctx.fillStyle = '#1b6e2e'; ctx.fillRect(px + TILE - 5, py, 4, TILE);
        if (isTop) {
          const lipL = isLeft ? px - 4 : px, lipW = (isLeft ? 4 : 0) + TILE + (isRight ? 4 : 0);
          ctx.fillStyle = '#2f9e44'; ctx.fillRect(lipL, py, lipW, 8);
          ctx.fillStyle = '#7ed957'; ctx.fillRect(lipL + 3, py, 8, 8);
          ctx.fillStyle = '#1b6e2e'; ctx.fillRect(lipL + lipW - 6, py, 4, 8);
        }
        break;
      }
    }
  }

  function drawFlagAndCastle() {
    const poleX = flagX + 8, topY = 4 * TILE;
    ctx.fillStyle = '#c8ccd4'; ctx.fillRect(poleX - 3, topY, 6, GROUND_TOP * TILE - topY);
    ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(poleX, topY - 4, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e52521';
    ctx.beginPath(); ctx.moveTo(poleX - 2, topY + 6); ctx.lineTo(poleX - 44, topY + 20); ctx.lineTo(poleX - 2, topY + 34); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(poleX - 20, topY + 20, 5, 0, Math.PI * 2); ctx.fill();

    const cx = castleX, cy = GROUND_TOP * TILE;
    ctx.fillStyle = '#b5532a'; ctx.fillRect(cx, cy - 120, 220, 120);
    ctx.fillStyle = '#c96a3a'; ctx.fillRect(cx, cy - 120, 220, 16);
    for (let i = 0; i < 5; i++) ctx.fillRect(cx + i * 48, cy - 152, 28, 32);
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath(); ctx.arc(cx + 60, cy, 22, Math.PI, 0); ctx.fill();
    ctx.fillRect(cx + 38, cy - 20, 44, 20);
  }

  function drawCoins() {
    coins.forEach((c) => {
      if (c.taken) return;
      const spr = (Math.floor(c.phase) % 2 === 0) ? COIN_1 : COIN_2;
      drawSprite(spr, c.x - 8, c.y - 8, false, 2);
    });
  }
  function drawPopCoins() {
    popCoins.forEach((pc) => drawSprite(COIN_1, pc.x - 8, pc.y - 8, false, 2));
  }
  function drawItems() {
    items.forEach((it) => {
      const spr = it.type === 'mush' ? MUSHROOM : it.type === 'flower' ? FLOWER : STAR;
      drawSprite(spr, it.x - 2, it.y - 2, false, 2);
    });
  }
  function drawGoombas() {
    goombas.forEach((g) => {
      if (g.dead) {
        ctx.save();
        ctx.translate(g.x + g.w / 2, g.y + g.h - 6);
        ctx.scale(1, 0.4);
        drawSprite(GOOMBA, -16, -32, false, 2);
        ctx.restore();
      } else {
        drawSprite(GOOMBA, g.x - 2, g.y - 2, g.vx > 0, 2);
      }
    });
  }
  function drawFireballs() {
    fireballs.forEach((f) => {
      ctx.fillStyle = '#ff9d3b';
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff3b0';
      ctx.beginPath(); ctx.arc(f.x - 2, f.y - 2, f.r / 2, 0, Math.PI * 2); ctx.fill();
    });
  }

  function drawPlayer() {
    const p = player;
    // 无敌星闪烁：每隔几帧隐藏
    if (starTimer > 0 && Math.floor(frame * 12) % 2 === 0) return;
    const spr = p.power >= 1 ? MARIO_BIG : MARIO_SMALL;
    const bob = p.onGround ? Math.round(Math.sin(p.runFrame * 2) * 2) : 0;
    drawSprite(spr, p.x, p.y + bob, p.facing < 0, 2, playerPalette());
  }

  function drawParticles() {
    particles.forEach((pt) => {
      ctx.globalAlpha = Math.max(0, Math.min(1, pt.life / 0.4));
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
    });
    ctx.globalAlpha = 1;
  }

  function drawBanner() {
    if (!banner) return;
    const a = Math.min(1, banner.t / 0.4);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, VIEW_H / 2 - 40, VIEW_W, 80);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 40px "Courier New", "Microsoft YaHei", monospace';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(banner.text, VIEW_W / 2, VIEW_H / 2 + 2);
    ctx.restore();
  }

  /* ================= HUD ================= */
  function updateHUD() {
    hudScore.textContent = String(score).padStart(6, '0');
    hudBest.textContent = String(getBest()).padStart(6, '0');
    hudCoins.textContent = 'x' + String(coinCount).padStart(2, '0');
    hudLevel.textContent = LEVELS[levelIdx].name;
    hudLives.textContent = '❤'.repeat(Math.max(0, lives));
    hudTime.textContent = settings.timeMode ? Math.max(0, Math.ceil(timeLeft)) : '∞';
  }

  /* ================= 覆盖层 ================= */
  function showOverlay(el) {
    ALL_OVERLAYS.forEach((o) => o.classList.add('hidden'));
    el.classList.remove('hidden');
  }

  /* ================= 输入 ================= */
  function setKey(code, down) {
    if (code === 'ArrowLeft' || code === 'KeyA') input.left = down;
    if (code === 'ArrowRight' || code === 'KeyD') input.right = down;
    if (code === 'ArrowUp' || code === 'KeyW' || code === 'Space') {
      if (down && !input.jumpHeld) jumpBuffer = JUMP_BUFFER;
      if (!down && player && player.vy < -260) player.vy = -260;
      input.jumpHeld = down;
    }
  }

  window.addEventListener('keydown', (e) => {
    if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) e.preventDefault();
    ensureAudio();
    if (e.code === 'KeyX' || e.code === 'KeyF') { if (state === 'playing' && !paused) shootFire(); return; }
    if (paused) {
      if (e.code === 'Escape' || e.code === 'Enter' || e.code === 'KeyP') resumeGame();
      return;
    }
    if (e.code === 'Escape' || e.code === 'KeyP') {
      if (state === 'playing') { pauseGame(); return; }
      if (state === 'levels' || state === 'settings' || state === 'shop') { backToMenu(); return; }
      return;
    }
    if ((state === 'over' || state === 'win') && e.code === 'Enter') { startGame(); return; }
    if (state === 'title' || state === 'levels' || state === 'settings' || state === 'shop') {
      if (e.code === 'Enter' || e.code === 'Space') {
        if (state === 'title') goLevels();
        else if (state === 'levels') startGame(0);
        else backToMenu();
        return;
      }
      return;
    }
    setKey(e.code, true);
  });
  window.addEventListener('keyup', (e) => setKey(e.code, false));

  function bindHold(id, key) {
    const el = document.getElementById(id);
    const on = (e) => { e.preventDefault(); ensureAudio(); setKey(key, true); };
    const off = (e) => { e.preventDefault(); setKey(key, false); };
    el.addEventListener('pointerdown', on);
    el.addEventListener('pointerup', off);
    el.addEventListener('pointerleave', off);
    el.addEventListener('pointercancel', off);
  }
  bindHold('btn-left', 'ArrowLeft');
  bindHold('btn-right', 'ArrowRight');
  bindHold('btn-jump', 'Space');
  const btnFire = document.getElementById('btn-fire');
  btnFire.addEventListener('pointerdown', (e) => { e.preventDefault(); ensureAudio(); if (state === 'playing' && !paused) shootFire(); });

  /* ================= 开始 / 重开 / 导航 ================= */
  function startGame(idx) {
    ensureAudio();
    paused = false;
    score = 0; coinCount = 0; lives = settings.lives;
    buildLevel(idx === undefined ? levelIdx : idx);
    state = 'playing';
    ALL_OVERLAYS.forEach((o) => o.classList.add('hidden'));
  }

  function goLevels() {
    ensureAudio();
    paused = false;
    renderLevels();
    state = 'levels';
    showOverlay(overlayLevels);
  }
  function goSettings() {
    ensureAudio();
    paused = false;
    renderSettings();
    state = 'settings';
    showOverlay(overlaySettings);
  }
  function backToMenu() {
    paused = false;
    state = 'title';
    showOverlay(overlayTitle);
  }

  function goShop() {
    ensureAudio();
    paused = false;
    renderShop();
    state = 'shop';
    showOverlay(overlayShop);
  }

  function pauseGame() {
    if (state !== 'playing' || paused) return;
    paused = true;
    input.left = input.right = false;
    input.jumpHeld = false;
    jumpBuffer = 0;
    showOverlay(overlayPause);
  }
  function resumeGame() {
    paused = false;
    ALL_OVERLAYS.forEach((o) => o.classList.add('hidden'));
  }

  function renderLevels() {
    levelsList.innerHTML = LEVELS.map((L, i) => {
      const best = levelBest[L.name] || 0;
      return '<button class="level-card level-card--' + L.diffClass + '" data-i="' + i + '">' +
        '<span class="level-card__num">' + L.name + '</span>' +
        '<span class="level-card__name">' + L.title + '</span>' +
        '<span class="level-card__diff">' + L.diff + '</span>' +
        '<span class="level-card__desc">' + L.desc + '</span>' +
        '<span class="level-card__best">' + (best ? '最佳 ' + String(best).padStart(6, '0') : '尚未通关') + '</span>' +
      '</button>';
    }).join('');
    Array.prototype.forEach.call(levelsList.querySelectorAll('.level-card'), (el) => {
      el.addEventListener('click', () => startGame(Number(el.getAttribute('data-i'))));
    });
  }

  function renderShop() {
    updateWalletUI();
    shopList.innerHTML = SKINS.map((skin) => {
      const owned = skinState.owned.indexOf(skin.id) !== -1;
      const equipped = skinState.equipped === skin.id;
      const r = skin.override.R || PAL.R, b = skin.override.B || PAL.B;
      let btn;
      if (equipped) btn = '<button class="skin-btn is-on" disabled>使用中</button>';
      else if (owned) btn = '<button class="skin-btn" data-equip="' + skin.id + '">装备</button>';
      else btn = '<button class="skin-btn skin-btn--buy" data-buy="' + skin.id + '"' + (wallet < skin.price ? ' disabled' : '') + '>购买 ' + skin.price + ' 🪙</button>';
      return '<div class="skin-card' + (equipped ? ' is-equipped' : '') + '">' +
        '<div class="skin-preview" style="--skin-r:' + r + ';--skin-b:' + b + ';"><span class="skin-preview__dot"></span></div>' +
        '<div class="skin-name">' + skin.name + '</div>' +
        '<div class="skin-price">' + (skin.price === 0 ? '免费' : skin.price + ' 🪙') + '</div>' +
        btn +
      '</div>';
    }).join('');
    Array.prototype.forEach.call(shopList.querySelectorAll('[data-buy]'), (el) => {
      el.addEventListener('click', () => buySkin(el.getAttribute('data-buy')));
    });
    Array.prototype.forEach.call(shopList.querySelectorAll('[data-equip]'), (el) => {
      el.addEventListener('click', () => equipSkin(el.getAttribute('data-equip')));
    });
  }

  function buySkin(id) {
    const skin = SKINS.find((s) => s.id === id);
    if (!skin || skinState.owned.indexOf(id) !== -1) return;
    if (wallet < skin.price) { sfx.bump(); return; }
    wallet -= skin.price;
    saveWallet();
    skinState.owned.push(id);
    saveSkins();
    renderShop();
    sfx.coin();
  }
  function equipSkin(id) {
    if (skinState.owned.indexOf(id) === -1) return;
    skinState.equipped = id;
    saveSkins();
    renderShop();
    sfx.powerup();
  }

  function settingRow(icon, label, hint, control) {
    return '<div class="setting">' +
      '<div><div class="setting__label">' + icon + ' ' + label + '</div><div class="setting__hint">' + hint + '</div></div>' +
      control + '</div>';
  }
  function switchHtml(key, on) {
    return '<button class="switch' + (on ? ' on' : '') + '" data-k="' + key + '" aria-pressed="' + on + '"></button>';
  }
  function renderSettings() {
    settingsList.innerHTML =
      settingRow('🔊', '音效', '开启游戏内所有音效', switchHtml('sound', settings.sound)) +
      '<div class="setting">' +
        '<div><div class="setting__label">❤️ 初始生命</div><div class="setting__hint">选择每局开始的生命数</div></div>' +
        '<div class="seg" id="seg-lives">' +
          '<button data-v="3" class="' + (settings.lives === 3 ? 'on' : '') + '">3</button>' +
          '<button data-v="5" class="' + (settings.lives === 5 ? 'on' : '') + '">5</button>' +
        '</div>' +
      '</div>' +
      settingRow('📳', '屏幕震动', '踩怪、撞砖时的震动效果', switchHtml('shake', settings.shake)) +
      settingRow('⏱️', '时间模式', '每关 300 秒倒计时，关闭后不计时', switchHtml('timeMode', settings.timeMode));

    Array.prototype.forEach.call(settingsList.querySelectorAll('.switch'), (el) => {
      el.addEventListener('click', () => {
        const k = el.getAttribute('data-k');
        settings[k] = !settings[k];
        el.classList.toggle('on', settings[k]);
        el.setAttribute('aria-pressed', settings[k]);
        saveSettings();
      });
    });
    Array.prototype.forEach.call(settingsList.querySelectorAll('#seg-lives button'), (el) => {
      el.addEventListener('click', () => {
        settings.lives = Number(el.getAttribute('data-v'));
        Array.prototype.forEach.call(settingsList.querySelectorAll('#seg-lives button'), (b) => b.classList.toggle('on', b === el));
        saveSettings();
      });
    });
  }

  document.getElementById('btn-start').addEventListener('click', goLevels);
  document.getElementById('btn-shop').addEventListener('click', goShop);
  document.getElementById('btn-settings').addEventListener('click', goSettings);
  document.getElementById('btn-back-menu').addEventListener('click', backToMenu);
  document.getElementById('btn-back-menu2').addEventListener('click', backToMenu);
  document.getElementById('btn-back-menu3').addEventListener('click', backToMenu);
  document.getElementById('btn-restart-win').addEventListener('click', () => startGame());
  document.getElementById('btn-select-win').addEventListener('click', goLevels);
  document.getElementById('btn-restart-over').addEventListener('click', () => startGame());
  document.getElementById('btn-select-over').addEventListener('click', goLevels);
  document.getElementById('btn-pause').addEventListener('click', pauseGame);
  document.getElementById('btn-resume').addEventListener('click', resumeGame);
  document.getElementById('btn-restart-level').addEventListener('click', () => startGame());
  document.getElementById('btn-pause-select').addEventListener('click', goLevels);
  document.getElementById('btn-pause-menu').addEventListener('click', backToMenu);

  /* ================= 缩放 ================= */
  function resize() {
    const scale = Math.min(window.innerWidth / VIEW_W, window.innerHeight / VIEW_H);
    canvas.style.width = Math.floor(VIEW_W * scale) + 'px';
    canvas.style.height = Math.floor(VIEW_H * scale) + 'px';
  }
  window.addEventListener('resize', resize);

  /* ================= 主循环 ================= */
  let lastTime = performance.now();
  function loop(now) {
    let dt = (now - lastTime) / 1000;
    lastTime = now;
    if (dt > 0.05) dt = 0.05;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  /* ================= 初始化 ================= */
  resize();
  loadSettings();
  loadSkins();
  loadWallet();
  loadLevelBest();
  refreshBest();
  buildLevel(0);
  renderLeaderboard();
  updateWalletUI();
  updateHUD();
  requestAnimationFrame(loop);
})();
