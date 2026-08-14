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
  const JUMP_VEL = 730;
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
  const overlayWin = document.getElementById('overlay-win');
  const overlayOver = document.getElementById('overlay-over');
  const lbList = document.getElementById('lb-list');

  /* ================= 关卡数据 ================= */
  const LEVELS = [
    {
      name: '1-1', cols: 220, time: 300, flagTile: 203,
      gaps: [[58, 61], [118, 122], [168, 172]],
      pipes: [[40, 2], [88, 3], [150, 2], [198, 2]],
      blocks: [
        [26, 8, 'coin'], [27, 8, 'coin'], [28, 8, 'mush'],
        [52, 8, 'brick'], [53, 8, 'coin'], [54, 8, 'flower'], [55, 8, 'brick'],
        [82, 8, 'coin'], [83, 8, 'brick'], [84, 8, 'brick'], [85, 8, 'mush'], [86, 8, 'brick'],
        [136, 8, 'coin'], [137, 8, 'brick'], [138, 8, 'star'], [139, 8, 'brick'], [140, 8, 'coin'],
        [180, 8, 'brick'], [181, 8, 'flower'], [182, 8, 'brick'], [183, 8, 'coin'], [184, 8, 'brick'],
      ],
      coins: [[14, 9], [15, 9], [16, 9], [17, 9], [18, 9], [59, 7], [60, 7], [120, 7], [121, 7], [169, 7], [170, 7], [171, 7], [92, 6], [93, 5], [94, 5], [95, 5], [96, 5], [97, 6]],
      enemies: [18, 44, 75, 110, 145, 176],
    },
    {
      name: '1-2', cols: 252, time: 300, flagTile: 232,
      gaps: [[45, 48], [72, 75], [100, 106], [130, 134], [160, 165], [190, 194], [215, 218]],
      pipes: [[30, 2], [60, 3], [120, 2], [175, 3], [205, 2]],
      blocks: [
        [20, 8, 'coin'], [22, 8, 'mush'], [24, 8, 'coin'],
        [50, 8, 'flower'], [51, 8, 'brick'], [52, 8, 'brick'],
        [80, 9, 'coin'], [81, 9, 'brick'], [82, 9, 'star'],
        [110, 8, 'brick'], [111, 8, 'flower'], [112, 8, 'brick'],
        [150, 8, 'mush'], [152, 8, 'coin'],
        [200, 8, 'brick'], [201, 8, 'flower'], [202, 8, 'coin'],
      ],
      coins: [[25, 8], [26, 8], [40, 7], [41, 7], [85, 6], [86, 6], [87, 6], [140, 8], [141, 8], [142, 8], [185, 7], [186, 7], [210, 7]],
      enemies: [16, 35, 55, 90, 125, 155, 185, 225],
    },
    {
      name: '1-3', cols: 270, time: 300, flagTile: 252,
      gaps: [[30, 34], [50, 56], [80, 86], [110, 116], [140, 148], [170, 178], [200, 206], [230, 236]],
      pipes: [[45, 3], [100, 4], [160, 3], [215, 2]],
      blocks: [
        [20, 8, 'star'], [21, 8, 'coin'], [22, 8, 'coin'],
        [40, 8, 'flower'], [42, 8, 'brick'],
        [60, 9, 'mush'], [61, 9, 'coin'], [62, 9, 'brick'],
        [90, 8, 'brick'], [91, 8, 'flower'], [92, 8, 'star'],
        [120, 8, 'coin'], [121, 8, 'mush'], [122, 8, 'coin'],
        [150, 8, 'flower'], [151, 8, 'brick'], [152, 8, 'coin'],
        [180, 9, 'brick'], [181, 9, 'star'], [182, 9, 'brick'],
        [220, 8, 'coin'], [221, 8, 'flower'], [222, 8, 'coin'],
      ],
      coins: [[25, 7], [26, 7], [27, 7], [55, 6], [56, 6], [57, 6], [85, 7], [86, 7], [115, 6], [145, 7], [175, 6], [205, 6], [225, 7], [226, 7], [227, 7]],
      enemies: [18, 48, 70, 105, 135, 165, 195, 225, 245],
    },
  ];

  /* ================= 游戏状态 ================= */
  let state = 'title';          // title | playing | clear | over | win
  let levelIdx = 0;
  let grid = [];
  let blockContent = new Map();
  let coins = [], goombas = [], items = [], fireballs = [], popCoins = [], particles = [], bumps = [];
  let clouds = [], hills = [];
  let player, cameraX, flagX, castleX;
  let score = 0, coinCount = 0, lives = 3, timeLeft = 300;
  let shakeTime = 0, shakeMag = 0, invuln = 0, starTimer = 0;
  let coyoteTimer = 0, jumpBuffer = 0, fireCooldown = 0;
  let clearTimer = 0, frame = 0, banner = null;
  const input = { left: false, right: false, jumpHeld: false };

  /* ================= 音效 ================= */
  let audioCtx = null;
  function ensureAudio() {
    if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; } }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
  }
  function beep(freq, dur, type, vol, slideTo) {
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
    if (p.y > VIEW_H + 60) hurtPlayer();

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
    lives--;
    sfx.die();
    if (lives <= 0) {
      state = 'over';
      saveScore(score, levelIdx);
      document.getElementById('over-score').textContent = score;
      document.getElementById('over-best').textContent = getBest();
      renderLeaderboard();
      showOverlay(overlayOver);
      return;
    }
    respawn();
  }

  function respawn() {
    player.x = 3 * TILE; player.y = GROUND_TOP * TILE - 32;
    player.vx = 0; player.vy = 0; player.power = 0; player.h = 32;
    cameraX = 0; invuln = 2; starTimer = 0;
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
    goombas = goombas.filter((g) => { if (g.dead) { g.squashTimer -= dt; return g.squashTimer > 0; } return true; });
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
    frame += dt;
    if (state === 'clear') {
      clearTimer -= dt;
      updateCamera(dt);
      if (clearTimer <= 0) nextLevel();
      return;
    }
    if (state !== 'playing') return;

    if (timeLeft > 0) { timeLeft -= dt; if (timeLeft <= 0) { timeLeft = 0; hurtPlayer(); } }
    if (invuln > 0) invuln -= dt;
    if (starTimer > 0) starTimer -= dt;

    updatePlayer(dt);
    updateGoombas(dt);
    updateItems(dt);
    updateFireballs(dt);
    updateCollectibles(dt);
    updateCamera(dt);

    if (player.x + player.w >= flagX) {
      if (levelIdx >= LEVELS.length - 1) {
        state = 'win';
        score += Math.max(0, Math.floor(timeLeft)) * 10;
        saveScore(score, levelIdx);
        document.getElementById('win-score').textContent = score;
        document.getElementById('win-best').textContent = getBest();
        renderLeaderboard();
        sfx.win();
        showOverlay(overlayWin);
      } else {
        state = 'clear';
        clearTimer = 1.6;
        score += Math.max(0, Math.floor(timeLeft)) * 10;
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
  function loadScores() {
    try { return JSON.parse(localStorage.getItem(LB_KEY)) || []; } catch (e) { return []; }
  }
  function saveScore(s, lvl) {
    const list = loadScores();
    list.push({ score: s, level: LEVELS[lvl].name, date: new Date().toLocaleDateString('zh-CN') });
    list.sort((a, b) => b.score - a.score);
    const top = list.slice(0, 5);
    try { localStorage.setItem(LB_KEY, JSON.stringify(top)); } catch (e) {}
    return top;
  }
  function getBest() {
    const list = loadScores();
    return list.length ? list[0].score : 0;
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
    const sky = ctx.createLinearGradient(0, 0, 0, VIEW_H);
    sky.addColorStop(0, '#3a6ff0'); sky.addColorStop(0.55, '#5c94fc'); sky.addColorStop(1, '#bfe8ff');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, VIEW_W, VIEW_H);

    let sx = 0, sy = 0;
    if (shakeTime > 0) { sx = (Math.random() - 0.5) * shakeMag; sy = (Math.random() - 0.5) * shakeMag; }

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
    hills.forEach((h) => {
      const x = h.x - cameraX * 0.5;
      if (x < -300 || x > VIEW_W + 300) return;
      ctx.fillStyle = '#4fae5a';
      ctx.beginPath(); ctx.arc(x, GROUND_TOP * TILE, 140 * h.s, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#3f9c4a';
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
    drawSprite(spr, p.x, p.y + bob, p.facing < 0, 2);
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
    hudTime.textContent = Math.max(0, Math.ceil(timeLeft));
  }

  /* ================= 覆盖层 ================= */
  function showOverlay(el) {
    [overlayTitle, overlayWin, overlayOver].forEach((o) => o.classList.add('hidden'));
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
    if (e.code === 'KeyX' || e.code === 'KeyF') { if (state === 'playing') shootFire(); return; }
    if (state === 'title' && (e.code === 'Enter' || e.code === 'Space')) { startGame(); return; }
    if ((state === 'over' || state === 'win') && e.code === 'Enter') { startGame(); return; }
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
  btnFire.addEventListener('pointerdown', (e) => { e.preventDefault(); ensureAudio(); if (state === 'playing') shootFire(); });

  /* ================= 开始 / 重开 ================= */
  function startGame() {
    ensureAudio();
    score = 0; coinCount = 0; lives = 3;
    buildLevel(0);
    state = 'playing';
    [overlayTitle, overlayWin, overlayOver].forEach((o) => o.classList.add('hidden'));
  }

  document.getElementById('btn-start').addEventListener('click', () => { ensureAudio(); startGame(); });
  document.getElementById('btn-restart-win').addEventListener('click', startGame);
  document.getElementById('btn-restart-over').addEventListener('click', startGame);

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
  buildLevel(0);
  renderLeaderboard();
  updateHUD();
  requestAnimationFrame(loop);
})();
