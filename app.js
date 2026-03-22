// TOMO DMC — 完整 PWA 应用
// 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// ─── 颜色系统 ───────────────────────────────────────────────
const C = {
  abyss:'#0B1120', navy:'#111D2E', gold:'#C9A84C', goldLight:'#E8C96A',
  cream:'#F5EDD6', white:'#FFFFFF', silver:'#A8B4C0', slate:'#1E2D42',
  dim:'#2A3F5A', teal:'#3A7CA5', green:'#4CAF7D', red:'#D94F4F',
  purple:'#7C5CBF', amber:'#D4872A', copper:'#CD7F32', titanium:'#90A4AE',
};

// ─── 数据 ────────────────────────────────────────────────────
const LEVELS = [
  { name:'入谋', eng:'TOMO-0', color:C.silver,   bru:0,     meaning:'刚入局，开始记录' },
  { name:'共谋', eng:'TOMO-1', color:C.copper,   bru:500,   meaning:'真正参与，共同酿造' },
  { name:'深谋', eng:'TOMO-2', color:C.titanium, bru:2000,  meaning:'潜入核心圈层' },
  { name:'主谋', eng:'TOMO-3', color:C.silver,   bru:8000,  meaning:'品牌共同体节点' },
  { name:'首谋', eng:'TOMO-4', color:C.gold,     bru:20000, meaning:'创世者，不可替代' },
];

const BEERS = [
  { id:'b1', name:'麦浪小麦', style:'Wheat Ale',  abv:'4.8%', color:C.amber,    stock:3, img:'🌾' },
  { id:'b2', name:'深渊 IPA', style:'West Coast IPA', abv:'6.2%', color:C.teal, stock:2, img:'🍀' },
  { id:'b3', name:'迷雾黑啤', style:'Dark Stout', abv:'7.1%', color:C.dim,      stock:0, img:'🌑' },
  { id:'b4', name:'柠檬赛松', style:'Saison',     abv:'5.5%', color:C.green,    stock:1, img:'🍋' },
  { id:'b5', name:'暗影琥珀', style:'隐藏款',      abv:'?',    color:C.purple,   stock:0, img:'🔮', hidden:true },
];

const USERS = [
  { id:1,  name:'Aki',  av:'阿',  on:true,  drink:'麦浪小麦', lv:2, city:'合肥' },
  { id:2,  name:'米奇', av:'米',  on:false, drink:null,       lv:1, city:'合肥' },
  { id:3,  name:'Sam',  av:'Sa',  on:true,  drink:'深渊IPA',  lv:3, city:'合肥' },
  { id:4,  name:'Yuki', av:'由',  on:true,  drink:'迷雾黑啤', lv:1, city:'南京' },
  { id:5,  name:'Leo',  av:'Li',  on:false, drink:null,       lv:0, city:'合肥' },
  { id:6,  name:'Vera', av:'Ve',  on:true,  drink:'麦浪小麦', lv:2, city:'合肥' },
  { id:7,  name:'Jin',  av:'金',  on:false, drink:null,       lv:1, city:'上海' },
  { id:8,  name:'Max',  av:'Ma',  on:true,  drink:'柠檬赛松', lv:0, city:'合肥' },
  { id:9,  name:'Coco', av:'Co',  on:true,  drink:'迷雾黑啤', lv:2, city:'合肥' },
  { id:10, name:'Ryo',  av:'良',  on:false, drink:null,       lv:3, city:'大连' },
  { id:11, name:'Fei',  av:'飞',  on:true,  drink:'深渊IPA',  lv:1, city:'合肥' },
  { id:12, name:'Ola',  av:'Ol',  on:false, drink:null,       lv:0, city:'合肥' },
];

const TASKS_INIT = [
  { id:1, type:'daily',  name:'今日签到',           bru:10,  done:false, icon:'◎', urgent:false },
  { id:2, type:'daily',  name:'今日开喝 — 扫码点亮', bru:20,  done:false, icon:'◉', urgent:false },
  { id:3, type:'daily',  name:'给酒搭子碰杯',        bru:10,  done:false, icon:'◈', urgent:false },
  { id:4, type:'daily',  name:'浏览今日酿况',         bru:5,   done:false, icon:'◇', urgent:false },
  { id:5, type:'weekly', name:'本周配方投票',          bru:50,  done:false, icon:'◆', urgent:false },
  { id:6, type:'weekly', name:'喝满 3 款不同 SKU',    bru:200, done:false, icon:'⬡', urgent:false },
  { id:7, type:'weekly', name:'完成一次酒搭子对话',    bru:80,  done:false, icon:'◎', urgent:false },
  { id:8, type:'rare',   name:'创世批次盲盒 — 限时72h',bru:500,done:false, icon:'★', urgent:true, timer:'47:23' },
  { id:9, type:'asset',  name:'首次存酒入银行',        bru:150, done:false, icon:'⬢', urgent:false },
  {id:10, type:'asset',  name:'集齐一套材料卡',        bru:500, done:false, icon:'⬡', urgent:false },
];

// ─── 状态 ────────────────────────────────────────────────────
const state = {
  tab: 'home',
  bru: 340,
  streak: 4,
  levelIdx: 1,
  drank: false,
  tasks: JSON.parse(JSON.stringify(TASKS_INIT)),
  users: USERS,
  selUser: null,
  toast: null, toastTimer: null,
  bankMode: null, bankBeer: null, bankResult: null, bankLoading: false,
  beers: JSON.parse(JSON.stringify(BEERS)),
  shopBeer: null,
  voteOpen: false, voteChoice: null,
  feedItems: [
    { id:1, user:'Sam',  lv:3, msg:'刚开了一瓶深渊IPA，今晚就是它了', time:'2分钟前', beer:'深渊IPA' },
    { id:2, user:'Vera', lv:2, msg:'配方投票结果出来了，我支持的"更多酒花"方案获胜！', time:'18分钟前', beer:null },
    { id:3, user:'Aki',  lv:2, msg:'存酒银行产出了0.24瓶利息，小富婆了', time:'1小时前', beer:'麦浪小麦' },
  ],
};

// ─── 工具函数 ─────────────────────────────────────────────────
function showToast(msg, dur = 2200) {
  if (state.toastTimer) clearTimeout(state.toastTimer);
  state.toast = msg;
  render();
  state.toastTimer = setTimeout(() => { state.toast = null; render(); }, dur);
}

function addBru(n) {
  state.bru += n;
  // check level up
  const nextLv = LEVELS[state.levelIdx + 1];
  if (nextLv && state.bru >= nextLv.bru) {
    state.levelIdx++;
    setTimeout(() => showToast(`🎉 晋升 ${LEVELS[state.levelIdx].eng} ${LEVELS[state.levelIdx].name}！`), 300);
  }
}

// ─── SVG 工具 ─────────────────────────────────────────────────
const svg = (content, w=24, h=24, extra='') =>
  `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none" stroke="currentColor" stroke-width="1.8" ${extra}>${content}</svg>`;

const ICONS = {
  home:  svg('<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'),
  tasks: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
  bank:  svg('<ellipse cx="12" cy="7" rx="9" ry="4"/><path d="M3 7v10c0 2.21 4.03 4 9 4s9-1.79 9-4V7"/><path d="M3 12c0 2.21 4.03 4 9 4s9-1.79 9-4"/>'),
  shop:  svg('<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>'),
  me:    svg('<path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
};

// ─── 渲染助手 ─────────────────────────────────────────────────
function h(tag, attrs={}, ...children) {
  const el = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) {
    if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
  }
  return el;
}

function hHTML(tag, attrs={}, html='') {
  const el = document.createElement(tag);
  for (const [k,v] of Object.entries(attrs)) {
    if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on')) el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  }
  el.innerHTML = html;
  return el;
}

// ─── 全局样式 ─────────────────────────────────────────────────
function injectStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
    @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}
    @keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(100%)}}
    .screen{animation:fadeUp 0.25s ease}
    .tap-scale{transition:transform 0.1s}
    .tap-scale:active{transform:scale(0.96)}
    .online-dot{animation:pulse 2s ease-in-out infinite}
    .spin{animation:spin 1s linear infinite}
    .progress-bar{transition:width 0.6s cubic-bezier(0.4,0,0.2,1)}
    ::-webkit-scrollbar{display:none}
    *{-webkit-tap-highlight-color:transparent}
    .scroll{overflow-y:auto;-webkit-overflow-scrolling:touch}
  `;
  document.head.appendChild(style);
}

// ─── SAFE AREA ────────────────────────────────────────────────
function getSafeTop() {
  return parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat') || '44');
}

// ─── 主渲染 ───────────────────────────────────────────────────
function render() {
  const root = document.getElementById('root');
  root.innerHTML = '';

  const lv = LEVELS[state.levelIdx];
  const nlv = LEVELS[Math.min(state.levelIdx + 1, LEVELS.length - 1)];
  const prog = state.levelIdx < LEVELS.length - 1
    ? ((state.bru - lv.bru) / (nlv.bru - lv.bru)) * 100 : 100;

  // Status bar spacer (safe area)
  root.appendChild(h('div', { style:{ height:'env(safe-area-inset-top, 44px)', background:C.navy } }));

  // Main content area
  const screen = h('div', { class:'scroll screen', style:{flex:1, background:C.abyss, overflowY:'auto', paddingBottom:'72px'} });

  if (state.tab === 'home')  screen.appendChild(buildHome(lv, nlv, prog));
  if (state.tab === 'tasks') screen.appendChild(buildTasks());
  if (state.tab === 'bank')  screen.appendChild(buildBank());
  if (state.tab === 'shop')  screen.appendChild(buildShop());
  if (state.tab === 'me')    screen.appendChild(buildMe(lv, nlv, prog));

  root.appendChild(screen);
  root.appendChild(buildNav());

  // Toast
  if (state.toast) {
    const toast = h('div', { style:{
      position:'fixed', top:'calc(env(safe-area-inset-top,44px) + 12px)',
      left:'50%', transform:'translateX(-50%)',
      background:C.slate, border:`1px solid ${C.gold}`,
      borderRadius:20, padding:'8px 20px',
      fontSize:13, color:C.gold, whiteSpace:'nowrap',
      zIndex:999, pointerEvents:'none',
      animation:'fadeUp 0.2s ease',
    }}, state.toast);
    root.appendChild(toast);
  }

  // Modals
  if (state.selUser)  root.appendChild(buildUserModal(state.selUser));
  if (state.shopBeer) root.appendChild(buildShopModal(state.shopBeer));
  if (state.voteOpen) root.appendChild(buildVoteModal());
}

// ─── HOME ─────────────────────────────────────────────────────
function buildHome(lv, nlv, prog) {
  const wrap = h('div', {});

  // Top bar
  wrap.appendChild(h('div', { style:{
    padding:'16px 20px 0', display:'flex', justifyContent:'space-between', alignItems:'flex-start',
    background:`linear-gradient(180deg,${C.navy} 0%,${C.abyss} 100%)`,
  }},
    h('div', {},
      h('div', {style:{fontSize:10, color:C.silver, letterSpacing:3, marginBottom:3}}, 'TOMO SYSTEM'),
      h('div', {style:{fontSize:22, fontWeight:600, color:C.gold}}, '同谋广场'),
    ),
    h('div', {style:{textAlign:'right'}},
      h('div', {style:{fontSize:10, color:C.silver}}, 'BRU 酿力值'),
      h('div', {style:{fontSize:26, fontWeight:600, color:C.gold, fontVariantNumeric:'tabular-nums'}},
        state.bru.toLocaleString()
      ),
    )
  ));

  // Level card
  const lvCard = h('div', {style:{
    margin:'14px 16px 0', background:C.navy, borderRadius:16,
    padding:'14px 16px', border:`1px solid ${C.dim}`,
  }},
    h('div', {style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10}},
      h('div', {style:{display:'flex', alignItems:'center', gap:10}},
        h('div', {style:{
          width:34, height:34, borderRadius:'50%',
          border:`2px solid ${lv.color}`, background:C.slate,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:13, fontWeight:600, color:lv.color,
        }}, lv.name[0]),
        h('div', {},
          h('div', {style:{fontSize:14, fontWeight:500, color:C.cream}}, lv.name),
          h('div', {style:{fontSize:10, color:C.silver}}, lv.eng),
        )
      ),
      h('div', {style:{fontSize:11, color:C.silver, textAlign:'right'}},
        '距 ', h('span',{style:{color:C.cream}},nlv.name), ' 还差',
        h('br'),
        h('span',{style:{color:C.gold, fontSize:13, fontWeight:500}},
          (nlv.bru - state.bru).toLocaleString()
        ), ' BRU'
      )
    ),
    h('div', {style:{height:4, background:C.dim, borderRadius:2}},
      h('div', {class:'progress-bar', style:{height:4, background:C.gold, borderRadius:2, width:`${Math.min(prog,100).toFixed(1)}%`}})
    ),
    h('div', {style:{display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:C.silver}},
      h('span', {}, `🔥 streak ${state.streak} 天`),
      h('span', {}, `${Math.min(prog,100).toFixed(0)}%`)
    )
  );
  wrap.appendChild(lvCard);

  // CTA button
  const ctaBtn = h('div', {style:{margin:'12px 16px 0'}},
    h('button', {
      class:'tap-scale',
      onClick: () => {
        if (state.drank) return;
        state.drank = true; addBru(20); render();
        setTimeout(() => showToast('+20 BRU · 头像已点亮'), 100);
      },
      style:{
        width:'100%', padding:'13px', border:'none', borderRadius:13,
        background: state.drank ? C.dim : C.gold,
        color: state.drank ? C.silver : C.abyss,
        fontSize:14, fontWeight:600, cursor: state.drank ? 'default' : 'pointer',
        transition:'background 0.3s',
      }
    }, state.drank ? '✓  今日已点亮  +20 BRU' : '扫码开喝 — 点亮今日头像')
  );
  wrap.appendChild(ctaBtn);

  // Feed
  wrap.appendChild(h('div', {style:{margin:'20px 16px 8px', fontSize:13, fontWeight:500, color:C.cream}}, '动态'));
  for (const item of state.feedItems) {
    const lvi = LEVELS[item.lv];
    wrap.appendChild(h('div', {style:{
      margin:'0 16px 8px', background:C.navy, borderRadius:14,
      padding:'12px 14px', border:`1px solid ${C.dim}`,
    }},
      h('div', {style:{display:'flex', alignItems:'center', gap:8, marginBottom:6}},
        h('div', {style:{
          width:28, height:28, borderRadius:'50%',
          border:`1.5px solid ${lvi.color}`, background:C.slate,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:11, fontWeight:600, color:lvi.color,
        }}, item.user.slice(0,2)),
        h('div', {},
          h('span', {style:{fontSize:13, fontWeight:500, color:C.cream}}, item.user),
          h('span', {style:{fontSize:10, color:C.silver, marginLeft:6}}, lvi.eng),
        ),
        h('span', {style:{marginLeft:'auto', fontSize:10, color:C.silver}}, item.time),
      ),
      h('div', {style:{fontSize:12, color:C.silver, lineHeight:1.6}}, item.msg),
      item.beer && h('span', {style:{
        display:'inline-block', marginTop:6, fontSize:10,
        background:`${C.gold}20`, color:C.gold,
        padding:'2px 10px', borderRadius:8,
      }}, '🍺 ' + item.beer),
    ));
  }

  // Who's drinking
  const online = state.users.filter(u => u.on).length;
  wrap.appendChild(h('div', {style:{margin:'20px 16px 8px', display:'flex', justifyContent:'space-between', alignItems:'center'}},
    h('div', {style:{fontSize:13, fontWeight:500, color:C.cream}}, '谁在喝酒'),
    h('div', {style:{fontSize:11, color:C.green}}, `● ${online} 人在线`)
  ));

  const grid = h('div', {style:{
    display:'grid', gridTemplateColumns:'repeat(4,1fr)',
    gap:10, padding:'0 16px 20px',
  }});
  for (const u of state.users) {
    const uvl = LEVELS[u.lv];
    const btn = h('button', {
      class:'tap-scale',
      onClick: () => { if (!u.on) return; state.selUser = u; render(); },
      style:{background:'none', border:'none', cursor: u.on ? 'pointer' : 'default',
             display:'flex', flexDirection:'column', alignItems:'center', gap:4}
    },
      h('div', {style:{
        width:56, height:56, borderRadius:'50%',
        border:`2px solid ${u.on ? uvl.color : C.dim}`,
        background: u.on ? C.slate : C.navy,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:14, fontWeight:600, color: u.on ? uvl.color : C.silver,
        position:'relative', transition:'border-color 0.3s',
      }},
        u.av,
        u.on && h('div', {
          class:'online-dot',
          style:{
            position:'absolute', bottom:1, right:1,
            width:11, height:11, borderRadius:'50%',
            background:C.green, border:`2px solid ${C.abyss}`,
          }
        })
      ),
      h('span', {style:{fontSize:10, color: u.on ? C.cream : C.silver}}, u.name)
    );
    grid.appendChild(btn);
  }
  wrap.appendChild(grid);
  return wrap;
}

// ─── TASKS ────────────────────────────────────────────────────
function buildTasks() {
  const wrap = h('div', {style:{padding:'20px 16px 0'}});
  wrap.appendChild(h('div', {style:{fontSize:22, fontWeight:600, color:C.gold, marginBottom:2}}, '任务系统'));
  wrap.appendChild(h('div', {style:{fontSize:12, color:C.silver, marginBottom:20}},
    `BRU 酿力值 · 当前 ${state.bru.toLocaleString()}`));

  const typeInfo = {
    daily:  { label:'日常任务', color:C.teal },
    weekly: { label:'周期任务', color:C.gold },
    rare:   { label:'稀缺任务', color:C.red },
    asset:  { label:'存酒任务', color:C.purple },
  };

  const groups = {};
  for (const t of state.tasks) (groups[t.type] = groups[t.type]||[]).push(t);

  for (const [type, info] of Object.entries(typeInfo)) {
    const grp = groups[type]; if (!grp?.length) continue;
    wrap.appendChild(h('div', {style:{
      fontSize:10, color:info.color, letterSpacing:3,
      marginBottom:8, fontWeight:600,
    }}, info.label.toUpperCase()));

    for (const task of grp) {
      const row = h('div', {style:{
        background: task.urgent ? `${C.amber}18` : C.navy,
        border:`1px solid ${task.urgent ? C.amber : task.done ? C.dim : C.dim}`,
        borderRadius:13, padding:'13px 14px',
        marginBottom:8, display:'flex', alignItems:'center', gap:12,
        opacity: task.done ? 0.65 : 1,
        transition:'opacity 0.3s',
      }},
        h('div', {style:{
          fontSize:18, width:28, textAlign:'center',
          color: task.done ? C.green : task.urgent ? C.amber : info.color,
        }}, task.done ? '✓' : task.icon),
        h('div', {style:{flex:1}},
          h('div', {style:{fontSize:13, fontWeight:500, color: task.done ? C.silver : C.cream}}, task.name),
          task.urgent && h('div', {style:{fontSize:10, color:C.amber, marginTop:2}},
            `⚡ 限时 · 倒计时 ${task.timer}`)
        ),
        h('button', {
          class:'tap-scale',
          onClick: () => {
            if (task.done) return;
            state.tasks = state.tasks.map(t => t.id===task.id ? {...t, done:true} : t);
            addBru(task.bru); render();
            setTimeout(() => showToast(`+${task.bru} BRU 已到账`), 50);
          },
          disabled: task.done ? 'true' : false,
          style:{
            background: task.done ? C.dim : task.urgent ? C.amber : info.color,
            border:'none', borderRadius:9, padding:'6px 14px',
            color: task.done ? C.silver : C.abyss,
            fontSize:12, fontWeight:600,
            cursor: task.done ? 'default' : 'pointer',
          }
        }, task.done ? '完成' : `+${task.bru}`)
      );
      wrap.appendChild(row);
    }
    wrap.appendChild(h('div', {style:{height:8}}));
  }

  // Vote CTA
  const voteCta = h('div', {
    class:'tap-scale',
    style:{
      margin:'8px 0 16px', background:`${C.purple}20`,
      border:`1px solid ${C.purple}60`, borderRadius:13,
      padding:'14px 16px', cursor:'pointer',
    },
    onClick: () => { state.voteOpen = true; render(); }
  },
    h('div', {style:{fontSize:13, fontWeight:500, color:C.purple, marginBottom:4}}, '本周配方投票 — 点击参与'),
    h('div', {style:{fontSize:11, color:C.silver}}, '选择下一批次的风味方向，你的选择影响真实配方'),
  );
  wrap.appendChild(voteCta);
  return wrap;
}

// ─── BANK ─────────────────────────────────────────────────────
function buildBank() {
  const wrap = h('div', {style:{padding:'20px 16px 0'}});
  wrap.appendChild(h('div', {style:{fontSize:22, fontWeight:600, color:C.gold, marginBottom:2}}, '存酒银行'));
  wrap.appendChild(h('div', {style:{fontSize:12, color:C.silver, marginBottom:20}}, '以酒生息 · 以酒创新'));

  if (!state.bankMode) {
    // Mode selection
    const modes = [
      { id:'single', label:'单款存酒', sub:'月利息 +8% 同款', color:C.teal,
        desc:'稳定生息，声望积累最快。存入任意在库酒款，按月自动生息。' },
      { id:'blend',  label:'混酿存酒', sub:'随机合成新品 / 隐藏款', color:C.gold,
        desc:'高风险高回报。不同酒款混入，有机会合成新品或触发隐藏款。' },
    ];
    for (const m of modes) {
      const card = h('button', {
        class:'tap-scale',
        onClick: () => { state.bankMode = m.id; state.bankBeer = null; state.bankResult = null; state.bankLoading = false; render(); },
        style:{
          width:'100%', background:C.navy, border:`1px solid ${m.color}50`,
          borderRadius:14, padding:'16px', marginBottom:12,
          textAlign:'left', cursor:'pointer',
        }
      },
        h('div', {style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}},
          h('span', {style:{fontSize:15, fontWeight:600, color:m.color}}, m.label),
          h('span', {style:{
            fontSize:10, background:`${m.color}22`, color:m.color,
            padding:'3px 10px', borderRadius:10,
          }}, m.sub)
        ),
        h('div', {style:{fontSize:12, color:C.silver}}, m.desc)
      );
      wrap.appendChild(card);
    }

    // Stock
    wrap.appendChild(h('div', {style:{fontSize:10, color:C.silver, letterSpacing:3, marginBottom:10, marginTop:8}}, '当前酒库存'));
    for (const b of state.beers) {
      if (b.hidden) continue;
      wrap.appendChild(h('div', {style:{
        display:'flex', alignItems:'center', gap:12,
        padding:'11px 14px', background:C.navy,
        borderRadius:11, marginBottom:7, border:`1px solid ${C.dim}`,
      }},
        h('div', {style:{fontSize:20}}, b.img),
        h('div', {style:{flex:1}},
          h('div', {style:{fontSize:13, fontWeight:500, color:C.cream}}, b.name),
          h('div', {style:{fontSize:10, color:C.silver}}, `${b.style} · ${b.abv}`)
        ),
        h('span', {style:{fontSize:13, fontWeight:600, color: b.stock > 0 ? C.gold : C.red}},
          b.stock > 0 ? `${b.stock} 瓶` : '缺货')
      ));
    }

  } else if (!state.bankResult && !state.bankLoading) {
    // Beer selection
    wrap.appendChild(h('button', {
      onClick: () => { state.bankMode = null; render(); },
      style:{background:'none', border:'none', color:C.silver, cursor:'pointer',
             fontSize:13, marginBottom:16, display:'flex', alignItems:'center', gap:4}
    }, '← 返回'));

    wrap.appendChild(h('div', {style:{fontSize:14, fontWeight:500, color:C.cream, marginBottom:4}},
      state.bankMode === 'single' ? '选择存入款式' : '选择款式开始混酿'));
    wrap.appendChild(h('div', {style:{fontSize:11, color:C.silver, marginBottom:14}},
      state.bankMode === 'blend' ? '配料表相性越高，合成概率越大' : '月利息将以同款形式产出'));

    for (const b of state.beers) {
      if (b.hidden || b.stock === 0) continue;
      const btn = h('button', {
        class:'tap-scale',
        onClick: () => {
          state.bankBeer = b;
          state.bankLoading = true;
          render();
          setTimeout(() => {
            state.bankLoading = false;
            if (state.bankMode === 'single') {
              state.bankResult = {
                type:'interest', emoji:'💰',
                msg:`预计下月产出 +${(b.stock * 0.08).toFixed(2)} 瓶利息（${b.name}）`,
                color:C.green,
              };
            } else {
              const roll = Math.random();
              if (roll > 0.72) {
                state.bankResult = { type:'hidden', emoji:'🔮',
                  msg:'触发隐藏款「暗影琥珀」—— 已入账，在酒库查看', color:C.gold };
              } else if (roll > 0.38) {
                state.bankResult = { type:'new', emoji:'⚗️',
                  msg:'生成新款「晨雾混酿」—— 配方卡已入账', color:C.teal };
              } else {
                state.bankResult = { type:'none', emoji:'○',
                  msg:'本次混酿未产出，相性不足。下次尝试不同组合。', color:C.silver };
              }
            }
            render();
          }, 1400);
        },
        style:{
          width:'100%', background:C.navy,
          border:`1px solid ${b.color}60`,
          borderRadius:13, padding:'14px 16px',
          marginBottom:9, display:'flex',
          alignItems:'center', gap:14, cursor:'pointer',
        }
      },
        h('div', {style:{fontSize:22}}, b.img),
        h('div', {style:{flex:1, textAlign:'left'}},
          h('div', {style:{fontSize:13, fontWeight:500, color:C.cream}}, b.name),
          h('div', {style:{fontSize:10, color:C.silver}}, b.style)
        ),
        h('span', {style:{fontSize:12, color:b.color}}, `${b.stock} 瓶`)
      );
      wrap.appendChild(btn);
    }

  } else if (state.bankLoading) {
    const loader = h('div', {style:{
      display:'flex', flexDirection:'column',
      alignItems:'center', padding:'60px 0',
    }},
      h('div', {class:'spin', style:{
        width:50, height:50,
        border:`3px solid ${C.dim}`,
        borderTopColor:C.gold,
        borderRadius:'50%', marginBottom:20,
      }}),
      h('div', {style:{fontSize:14, color:C.silver}}, '酿造中…')
    );
    wrap.appendChild(loader);

  } else if (state.bankResult) {
    const res = state.bankResult;
    const box = h('div', {style:{textAlign:'center', padding:'40px 20px'}},
      h('div', {style:{fontSize:52, marginBottom:18}}, res.emoji),
      h('div', {style:{fontSize:16, fontWeight:600, color:res.color, marginBottom:8, lineHeight:1.5}}, res.msg),
      h('div', {style:{fontSize:12, color:C.silver, marginBottom:28}}, '结果已同步至你的酒库'),
      h('button', {
        class:'tap-scale',
        onClick: () => { state.bankMode = null; state.bankResult = null; state.bankBeer = null; render(); },
        style:{background:C.gold, border:'none', borderRadius:13, padding:'13px 40px',
               color:C.abyss, fontSize:14, fontWeight:600, cursor:'pointer'}
      }, '返回')
    );
    wrap.appendChild(box);
  }

  return wrap;
}

// ─── SHOP ─────────────────────────────────────────────────────
function buildShop() {
  const wrap = h('div', {style:{padding:'20px 16px 0'}});
  wrap.appendChild(h('div', {style:{fontSize:22, fontWeight:600, color:C.gold, marginBottom:2}}, '酒单'));
  wrap.appendChild(h('div', {style:{fontSize:12, color:C.silver, marginBottom:16}},
    `BRU ${state.bru.toLocaleString()} · 可兑换消费抵扣`));

  // Featured banner
  wrap.appendChild(h('div', {style:{
    background:`${C.purple}20`, border:`1px solid ${C.purple}50`,
    borderRadius:14, padding:'14px 16px', marginBottom:16,
    display:'flex', alignItems:'center', gap:12,
  }},
    h('div', {style:{fontSize:28}}, '🔮'),
    h('div', {},
      h('div', {style:{fontSize:13, fontWeight:600, color:C.purple}}, '暗影琥珀 · 隐藏款'),
      h('div', {style:{fontSize:11, color:C.silver}}, '混酿存酒解锁 · 限量发行 · TOMO-2+ 专属')
    ),
    h('span', {style:{
      marginLeft:'auto', fontSize:10,
      background:`${C.purple}30`, color:C.purple,
      padding:'4px 10px', borderRadius:8,
    }}, '隐藏')
  ));

  for (const b of state.beers) {
    if (b.hidden) continue;
    const card = h('button', {
      class:'tap-scale',
      onClick: () => { state.shopBeer = b; render(); },
      style:{
        width:'100%', background:C.navy,
        border:`1px solid ${C.dim}`, borderRadius:14,
        padding:'14px 16px', marginBottom:10,
        display:'flex', alignItems:'center', gap:14, cursor:'pointer',
        textAlign:'left',
      }
    },
      h('div', {style:{
        width:48, height:48, borderRadius:12,
        background:`${b.color}20`, border:`1px solid ${b.color}40`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:24,
      }}, b.img),
      h('div', {style:{flex:1}},
        h('div', {style:{fontSize:14, fontWeight:600, color:C.cream}}, b.name),
        h('div', {style:{fontSize:11, color:C.silver, marginTop:2}}, `${b.style} · ABV ${b.abv}`)
      ),
      h('div', {style:{textAlign:'right'}},
        h('div', {style:{fontSize:13, fontWeight:600, color: b.stock > 0 ? C.gold : C.red}},
          b.stock > 0 ? '¥12' : '售罄'),
        h('div', {style:{fontSize:10, color:C.silver, marginTop:2}},
          b.stock > 0 ? `库存 ${b.stock}` : '')
      )
    );
    wrap.appendChild(card);
  }
  return wrap;
}

// ─── ME ───────────────────────────────────────────────────────
function buildMe(lv, nlv, prog) {
  const wrap = h('div', {style:{padding:'20px 16px 0'}});
  const done = state.tasks.filter(t => t.done).length;

  // Profile header
  wrap.appendChild(h('div', {style:{display:'flex', alignItems:'center', gap:14, marginBottom:20}},
    h('div', {style:{
      width:66, height:66, borderRadius:'50%',
      border:`2.5px solid ${C.gold}`, background:C.slate,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:22, fontWeight:600, color:C.gold, position:'relative',
    }},
      '共',
      h('div', {style:{
        position:'absolute', bottom:2, right:2,
        width:15, height:15, borderRadius:'50%',
        background:C.green, border:`2px solid ${C.abyss}`,
      }})
    ),
    h('div', {},
      h('div', {style:{fontSize:19, fontWeight:600, color:C.cream}}, '同谋 · Joy'),
      h('div', {style:{fontSize:12, color:C.silver, marginTop:2}}, `${lv.eng}  ·  #2847`),
      h('div', {style:{display:'flex', gap:6, marginTop:6}},
        h('span', {style:{fontSize:10, background:`${C.gold}25`, color:C.gold, padding:'2px 9px', borderRadius:8}}, lv.name),
        h('span', {style:{fontSize:10, background:`${C.green}25`, color:C.green, padding:'2px 9px', borderRadius:8}}, `Streak ${state.streak}天`),
      )
    )
  ));

  // Stats grid
  const statsGrid = h('div', {style:{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:16}});
  for (const [label, val, color] of [
    ['BRU 酿力值', state.bru.toLocaleString(), C.gold],
    ['今日任务', `${done}/${state.tasks.length}`, C.green],
    ['已喝款数', '7', C.teal],
  ]) {
    statsGrid.appendChild(h('div', {style:{
      background:C.navy, borderRadius:13, padding:'12px 10px',
      textAlign:'center', border:`1px solid ${C.dim}`,
    }},
      h('div', {style:{fontSize:20, fontWeight:600, color}}), val,
      h('div', {style:{fontSize:10, color:C.silver, marginTop:3}}, label)
    ));
    statsGrid.lastElementChild.children[0].textContent = val;
  }
  wrap.appendChild(statsGrid);

  // Level progress
  wrap.appendChild(h('div', {style:{
    background:C.navy, borderRadius:14, padding:'14px 16px', marginBottom:16, border:`1px solid ${C.dim}`,
  }},
    h('div', {style:{display:'flex', justifyContent:'space-between', marginBottom:8}},
      h('span', {style:{fontSize:13, color:C.cream}}, '升级进度'),
      h('span', {style:{fontSize:12, color:C.silver}}, `${lv.name} → ${nlv.name}`)
    ),
    h('div', {style:{height:5, background:C.dim, borderRadius:3, marginBottom:7}},
      h('div', {class:'progress-bar', style:{height:5, background:C.gold, borderRadius:3, width:`${Math.min(prog,100).toFixed(0)}%`}})
    ),
    h('div', {style:{fontSize:11, color:C.silver}},
      `还差 ${(nlv.bru - state.bru).toLocaleString()} BRU 晋升 ${nlv.name} ${nlv.eng}`)
  ));

  // Badges
  wrap.appendChild(h('div', {style:{fontSize:10, color:C.silver, letterSpacing:3, marginBottom:10}}, '勋章墙'));
  const badgeGrid = h('div', {style:{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8, marginBottom:18}});
  for (const [em, name, color] of [
    ['🍺','首次共酿',C.gold], ['🔥','4天连胜',C.green],
    ['🥂','碰杯达人',C.teal], ['🔒','？？？',C.dim],
  ]) {
    badgeGrid.appendChild(h('div', {style:{
      background:C.navy, borderRadius:11, padding:'11px 6px',
      textAlign:'center', border:`1px solid ${color}45`,
    }},
      h('div', {style:{fontSize:24, marginBottom:4}}, em),
      h('div', {style:{fontSize:9, color}}, name)
    ));
  }
  wrap.appendChild(badgeGrid);

  // NFT card
  wrap.appendChild(h('div', {style:{
    background:`${C.purple}18`, border:`1px solid ${C.purple}50`,
    borderRadius:14, padding:'14px 16px', marginBottom:16,
  }},
    h('div', {style:{fontSize:13, fontWeight:600, color:C.purple, marginBottom:6}}, '我的 NFT · 养成中'),
    h('div', {style:{fontSize:12, color:C.silver, lineHeight:1.7}},
      '持续消费 · 存酒 · 参与投票将解锁更稀有的进化形态。'),
    h('div', {style:{marginTop:10, display:'flex', gap:6}},
      h('span', {style:{fontSize:10, background:`${C.purple}35`, color:C.purple, padding:'3px 10px', borderRadius:8}}, '铜色纹路 已解锁'),
      h('span', {style:{fontSize:10, background:C.dim, color:C.silver, padding:'3px 10px', borderRadius:8}}, '光环 未解锁'),
    )
  ));

  // All levels preview
  wrap.appendChild(h('div', {style:{fontSize:10, color:C.silver, letterSpacing:3, marginBottom:10}}, 'TOMO SYSTEM 等级'));
  for (const lvl of LEVELS) {
    const isActive = lvl.eng === lv.eng;
    const isUnlocked = state.bru >= lvl.bru;
    wrap.appendChild(h('div', {style:{
      display:'flex', alignItems:'center', gap:12,
      padding:'10px 14px', background: isActive ? `${lvl.color}15` : C.navy,
      borderRadius:11, marginBottom:6,
      border:`1px solid ${isActive ? lvl.color : C.dim}`,
    }},
      h('div', {style:{
        width:30, height:30, borderRadius:'50%',
        border:`2px solid ${isUnlocked ? lvl.color : C.dim}`,
        background:C.slate, display:'flex', alignItems:'center',
        justifyContent:'center', fontSize:11, fontWeight:600,
        color: isUnlocked ? lvl.color : C.dim,
      }}, lvl.name[0]),
      h('div', {style:{flex:1}},
        h('div', {style:{fontSize:13, fontWeight: isActive ? 600 : 400, color: isUnlocked ? C.cream : C.silver}},
          lvl.name + (isActive ? ' ← 当前' : '')),
        h('div', {style:{fontSize:10, color:C.silver}}, lvl.meaning)
      ),
      h('div', {style:{textAlign:'right'}},
        h('div', {style:{fontSize:11, color: isUnlocked ? lvl.color : C.dim}}, lvl.eng),
        h('div', {style:{fontSize:10, color:C.silver}}, lvl.bru.toLocaleString() + ' BRU')
      )
    ));
  }
  wrap.appendChild(h('div', {style:{height:8}}));
  return wrap;
}

// ─── NAV ──────────────────────────────────────────────────────
function buildNav() {
  const tabs = [
    { id:'home',  label:'广场',  icon:ICONS.home },
    { id:'tasks', label:'任务',  icon:ICONS.tasks },
    { id:'bank',  label:'存酒',  icon:ICONS.bank },
    { id:'shop',  label:'酒单',  icon:ICONS.shop },
    { id:'me',    label:'我的',  icon:ICONS.me },
  ];
  const nav = h('div', {style:{
    position:'fixed', bottom:0, left:0, right:0,
    height:`calc(56px + env(safe-area-inset-bottom, 0px))`,
    background:C.navy, borderTop:`1px solid ${C.dim}`,
    display:'flex', alignItems:'flex-start', paddingTop:'4px',
    zIndex:100,
  }});

  for (const t of tabs) {
    const btn = h('button', {
      class:'tap-scale',
      onClick: () => { state.tab = t.id; render(); },
      style:{
        flex:1, background:'none', border:'none', cursor:'pointer',
        display:'flex', flexDirection:'column', alignItems:'center', gap:3,
        padding:'6px 0', color: state.tab === t.id ? C.gold : C.silver,
      }
    });
    btn.innerHTML = t.icon.replace('currentColor', state.tab === t.id ? C.gold : C.silver);
    btn.appendChild(h('span', {style:{
      fontSize:10,
      color: state.tab === t.id ? C.gold : C.silver,
      fontWeight: state.tab === t.id ? 600 : 400,
    }}, t.label));
    nav.appendChild(btn);
  }
  return nav;
}

// ─── USER MODAL ───────────────────────────────────────────────
function buildUserModal(user) {
  const uvl = LEVELS[user.lv];
  const overlay = h('div', {
    onClick: () => { state.selUser = null; render(); },
    style:{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.75)',
      zIndex:200, display:'flex', alignItems:'flex-end',
    }
  });
  const sheet = h('div', {
    onClick: e => e.stopPropagation(),
    style:{
      width:'100%', background:C.navy,
      borderRadius:'22px 22px 0 0',
      padding:'20px 20px calc(20px + env(safe-area-inset-bottom,0px))',
      border:`1px solid ${C.dim}`,
      animation:'fadeUp 0.25s ease',
    }
  });
  // Handle
  sheet.appendChild(h('div', {style:{
    width:36, height:4, background:C.dim,
    borderRadius:2, margin:'0 auto 16px',
  }}));
  // User info
  sheet.appendChild(h('div', {style:{display:'flex', alignItems:'center', gap:12, marginBottom:16}},
    h('div', {style:{
      width:50, height:50, borderRadius:'50%',
      border:`2px solid ${uvl.color}`, background:C.slate,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:16, fontWeight:600, color:uvl.color,
    }}, user.av),
    h('div', {},
      h('div', {style:{fontSize:16, fontWeight:600, color:C.cream}}, user.name),
      h('div', {style:{fontSize:12, color:C.silver, marginTop:2}},
        `${uvl.eng}  ·  ${user.city}  ·  今晚在喝 `
      ),
      user.drink && h('span', {style:{fontSize:12, color:C.gold, fontWeight:500}}, user.drink)
    )
  ));
  // Stats row
  sheet.appendChild(h('div', {style:{
    display:'flex', gap:8, marginBottom:16,
  }},
    ...[['同城', user.city === '合肥' ? '✓' : '—', C.green],
        ['等级', uvl.name, uvl.color],
        ['状态', '在线', C.green]].map(([label, val, color]) =>
      h('div', {style:{
        flex:1, background:C.slate, borderRadius:10, padding:'8px',
        textAlign:'center', border:`1px solid ${C.dim}`,
      }},
        h('div', {style:{fontSize:13, fontWeight:600, color}}, val),
        h('div', {style:{fontSize:9, color:C.silver, marginTop:2}}, label)
      )
    )
  ));
  // Clink button
  sheet.appendChild(h('button', {
    class:'tap-scale',
    onClick: () => {
      const r = (Math.floor(Math.random() * 14) + 1) * 10;
      state.selUser = null;
      addBru(r); render();
      setTimeout(() => showToast(`向 ${user.name} 碰杯！+${r} BRU`), 50);
    },
    style:{
      width:'100%', padding:14, background:C.gold, border:'none',
      borderRadius:13, color:C.abyss, fontSize:15, fontWeight:600,
      cursor:'pointer',
    }
  }, '🥂  发起碰杯  — 随机奖励 BRU'));
  overlay.appendChild(sheet);
  return overlay;
}

// ─── SHOP MODAL ───────────────────────────────────────────────
function buildShopModal(beer) {
  const overlay = h('div', {
    onClick: () => { state.shopBeer = null; render(); },
    style:{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:200, display:'flex', alignItems:'flex-end'}
  });
  const sheet = h('div', {
    onClick: e => e.stopPropagation(),
    style:{
      width:'100%', background:C.navy,
      borderRadius:'22px 22px 0 0',
      padding:'20px 20px calc(20px + env(safe-area-inset-bottom,0px))',
      animation:'fadeUp 0.25s ease',
    }
  });
  sheet.appendChild(h('div', {style:{width:36,height:4,background:C.dim,borderRadius:2,margin:'0 auto 18px'}}));
  sheet.appendChild(h('div', {style:{display:'flex', alignItems:'center', gap:14, marginBottom:20}},
    h('div', {style:{
      width:60, height:60, borderRadius:14,
      background:`${beer.color}20`, border:`1px solid ${beer.color}50`,
      display:'flex', alignItems:'center', justifyContent:'center', fontSize:30,
    }}, beer.img),
    h('div', {},
      h('div', {style:{fontSize:18, fontWeight:600, color:C.cream}}, beer.name),
      h('div', {style:{fontSize:12, color:C.silver, marginTop:4}}, `${beer.style} · ABV ${beer.abv}`),
      h('div', {style:{fontSize:11, color:C.gold, marginTop:4}}, `¥9.9–12 / 330ml`)
    )
  ));
  // Perks for current level
  const lv = LEVELS[state.levelIdx];
  const discount = state.levelIdx >= 1 ? '9折' : null;
  if (discount) {
    sheet.appendChild(h('div', {style:{
      background:`${C.gold}15`, border:`1px solid ${C.gold}40`,
      borderRadius:10, padding:'10px 14px', marginBottom:14,
      display:'flex', alignItems:'center', gap:8,
    }},
      h('span', {style:{fontSize:13, color:C.gold}}, `${lv.name} 专属折扣`),
      h('span', {style:{
        fontSize:11, background:`${C.gold}30`, color:C.gold,
        padding:'2px 10px', borderRadius:8, marginLeft:'auto',
      }}, discount)
    ));
  }
  sheet.appendChild(h('div', {style:{display:'flex', gap:10}},
    h('button', {
      class:'tap-scale',
      onClick: () => { state.shopBeer = null; render(); showToast('已加入购物车'); },
      style:{
        flex:1, padding:13, background:C.dim, border:`1px solid ${C.gold}50`,
        borderRadius:13, color:C.cream, fontSize:14, fontWeight:500, cursor:'pointer',
      }
    }, '加入购物车'),
    h('button', {
      class:'tap-scale',
      onClick: () => {
        if (beer.stock === 0) return;
        state.beers = state.beers.map(b => b.id===beer.id ? {...b, stock:b.stock-1} : b);
        addBru(1);
        state.shopBeer = null; render();
        showToast(`购买成功 +1 BRU`);
      },
      style:{
        flex:1, padding:13, background: beer.stock > 0 ? C.gold : C.dim,
        border:'none', borderRadius:13,
        color: beer.stock > 0 ? C.abyss : C.silver,
        fontSize:14, fontWeight:600,
        cursor: beer.stock > 0 ? 'pointer' : 'default',
      }
    }, beer.stock > 0 ? '立即购买' : '暂时售罄')
  ));
  overlay.appendChild(sheet);
  return overlay;
}

// ─── VOTE MODAL ───────────────────────────────────────────────
function buildVoteModal() {
  const options = [
    { id:'a', label:'更多酒花香气', desc:'热带水果 + 松脂感，偏向西海岸风格', votes:142 },
    { id:'b', label:'麦芽焦糖底色', desc:'更圆润的酒体，甜感更突出', votes:89 },
    { id:'c', label:'加入柑橘皮', desc:'清爽感增强，适合夏季场景', votes:207 },
  ];
  const overlay = h('div', {
    style:{position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 20px'}
  });
  const box = h('div', {style:{
    width:'100%', background:C.navy,
    borderRadius:20, padding:20,
    border:`1px solid ${C.dim}`,
    animation:'fadeUp 0.25s ease',
  }});
  box.appendChild(h('div', {style:{fontSize:16, fontWeight:600, color:C.gold, marginBottom:4}}, '本周配方投票'));
  box.appendChild(h('div', {style:{fontSize:12, color:C.silver, marginBottom:18}},
    '选择下一批次的风味方向 · 结果影响真实配方'));

  const totalVotes = options.reduce((s,o) => s+o.votes,0) + 1;
  for (const opt of options) {
    const isChosen = state.voteChoice === opt.id;
    const pct = Math.round((opt.votes + (isChosen?1:0)) / totalVotes * 100);
    const btn = h('button', {
      class:'tap-scale',
      onClick: () => { state.voteChoice = opt.id; render(); },
      style:{
        width:'100%', background: isChosen ? `${C.purple}25` : C.slate,
        border:`1px solid ${isChosen ? C.purple : C.dim}`,
        borderRadius:12, padding:'12px 14px', marginBottom:10,
        textAlign:'left', cursor:'pointer', transition:'all 0.2s',
      }
    },
      h('div', {style:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}},
        h('span', {style:{fontSize:13, fontWeight:500, color: isChosen ? C.purple : C.cream}}, opt.label),
        h('span', {style:{fontSize:12, color:C.silver}}, `${pct}%`)
      ),
      h('div', {style:{fontSize:11, color:C.silver, marginBottom:8}}, opt.desc),
      h('div', {style:{height:3, background:C.dim, borderRadius:2}},
        h('div', {style:{height:3, background: isChosen ? C.purple : C.teal, borderRadius:2, width:pct+'%', transition:'width 0.4s'}})
      )
    );
    box.appendChild(btn);
  }

  box.appendChild(h('div', {style:{display:'flex', gap:10, marginTop:8}},
    h('button', {
      onClick: () => { state.voteOpen = false; state.voteChoice = null; render(); },
      style:{flex:1, padding:11, background:C.dim, border:'none', borderRadius:12, color:C.silver, fontSize:13, cursor:'pointer'}
    }, '取消'),
    h('button', {
      class:'tap-scale',
      onClick: () => {
        if (!state.voteChoice) return;
        state.voteOpen = false;
        state.tasks = state.tasks.map(t => t.id===5 ? {...t, done:true} : t);
        addBru(50); render();
        setTimeout(() => showToast('+50 BRU · 投票完成'), 50);
      },
      style:{
        flex:2, padding:11, background: state.voteChoice ? C.purple : C.dim,
        border:'none', borderRadius:12,
        color: state.voteChoice ? C.white : C.silver,
        fontSize:13, fontWeight:600, cursor: state.voteChoice ? 'pointer' : 'default',
        transition:'background 0.2s',
      }
    }, '确认投票  +50 BRU')
  ));
  overlay.appendChild(box);
  return overlay;
}

// ─── 启动 ─────────────────────────────────────────────────────
injectStyles();
render();
