// 懷舊谷遊戲介紹：資料由 tools/website_export_db.py 從伺服器 wz 與資料庫匯出到 data/*.json（頁面上不顯示任何內部編號）
'use strict';
const V = document.getElementById('view');
const cache = {};
const load = name => cache[name] || (cache[name] = fetch(`data/${name}.json`).then(r => {
  if (!r.ok) throw new Error(name); return r.json();
}));
let N = null; // names.json
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = n => Number(n || 0).toLocaleString('zh-TW');
const pct = ch => { const p = ch / 10000; const s = p >= 10 ? p.toFixed(0) : p >= 1 ? p.toFixed(1) : p >= 0.01 ? p.toFixed(2) : p.toFixed(4);
  return (s.includes('.') ? s.replace(/\.?0+$/, '') : s) + '%'; };
const img = (kind, id, has, cls = '') => has ? `<img src="img/${kind}/${id}.png" alt="" loading="lazy" class="${cls}">` : '<span class="noimg"></span>';

// ---------- jobs ----------
const FAMILIES = [
  { key: 'explorer', name: '冒險家', note: '最經典的五大職業，在維多利亞島轉職。', jobs: [
    [0, '初心者', 1],
    [100, '劍士', 10], [110, '狂戰士', 30], [111, '十字軍', 70], [112, '英雄', 120],
    [120, '見習騎士', 30], [121, '騎士', 70], [122, '聖騎士', 120],
    [130, '槍騎兵', 30], [131, '龍騎士', 70], [132, '黑騎士', 120],
    [200, '法師', 8], [210, '火毒巫師', 30], [211, '火毒魔導士', 70], [212, '火毒大魔導士', 120],
    [220, '冰雷巫師', 30], [221, '冰雷魔導士', 70], [222, '冰雷大魔導士', 120],
    [230, '僧侶', 30], [231, '祭司', 70], [232, '主教', 120],
    [300, '弓箭手', 10], [310, '獵人', 30], [311, '遊俠', 70], [312, '箭神', 120],
    [320, '弩弓手', 30], [321, '狙擊手', 70], [322, '神射手', 120],
    [400, '盜賊', 10], [410, '刺客', 30], [411, '暗殺者', 70], [412, '夜使者', 120],
    [420, '俠盜', 30], [421, '神偷', 70], [422, '暗影神偷', 120],
    [500, '海盜', 10], [510, '打手', 30], [511, '格鬥家', 70], [512, '拳霸', 120],
    [520, '槍手', 30], [521, '神槍手', 70], [522, '槍神', 120]] },
  { key: 'db', name: '影武者', note: '冒險家盜賊的分支，使用短劍與雙刀，轉職次數最多。', jobs: [
    [430, '下忍', 20], [431, '中忍', 30], [432, '上忍', 55], [433, '隱忍', 70], [434, '影武者', 120]] },
  { key: 'cannon', name: '重砲指揮官', note: '冒險家海盜的分支，扛著大砲作戰。', jobs: [
    [501, '海盜（重砲）', 10], [530, '重砲兵', 30], [531, '重砲兵隊長', 70], [532, '重砲指揮官', 120]] },
  { key: 'jett', name: '蒼龍俠客', note: '冒險家海盜的分支，使用火槍與星際技能。', jobs: [
    [508, '蒼龍俠客（一轉）', 10], [570, '蒼龍俠客（二轉）', 30], [571, '蒼龍俠客（三轉）', 70], [572, '蒼龍俠客（四轉）', 120]] },
  { key: 'koc', name: '皇家騎士團', note: '守護女皇的五位騎士，70 級前每級多 1 點能力點。', jobs: [
    [1000, '貴族', 1],
    [1100, '聖魂劍士（一轉）', 10], [1110, '聖魂劍士（二轉）', 30], [1111, '聖魂劍士（三轉）', 70], [1112, '聖魂劍士（四轉）', 120],
    [1200, '烈焰巫師（一轉）', 10], [1210, '烈焰巫師（二轉）', 30], [1211, '烈焰巫師（三轉）', 70], [1212, '烈焰巫師（四轉）', 120],
    [1300, '破風使者（一轉）', 10], [1310, '破風使者（二轉）', 30], [1311, '破風使者（三轉）', 70], [1312, '破風使者（四轉）', 120],
    [1400, '暗夜行者（一轉）', 10], [1410, '暗夜行者（二轉）', 30], [1411, '暗夜行者（三轉）', 70], [1412, '暗夜行者（四轉）', 120],
    [1500, '閃雷悍將（一轉）', 10], [1510, '閃雷悍將（二轉）', 30], [1511, '閃雷悍將（三轉）', 70], [1512, '閃雷悍將（四轉）', 120]] },
  { key: 'aran', name: '狂狼勇士', note: '甦醒的英雄，使用矛的連擊系戰士。', jobs: [
    [2000, '傳說', 1], [2100, '狂狼勇士（一轉）', 10], [2110, '狂狼勇士（二轉）', 30], [2111, '狂狼勇士（三轉）', 70], [2112, '狂狼勇士（四轉）', 120]] },
  { key: 'evan', name: '龍魔導士', note: '與幼龍米樂一起成長的魔法師，共十次成長。', jobs: [
    [2001, '小不點', 1], [2200, '龍魔導士（1轉）', 10], [2210, '龍魔導士（2轉）', 20], [2211, '龍魔導士（3轉）', 30],
    [2212, '龍魔導士（4轉）', 40], [2213, '龍魔導士（5轉）', 50], [2214, '龍魔導士（6轉）', 60], [2215, '龍魔導士（7轉）', 80],
    [2216, '龍魔導士（8轉）', 100], [2217, '龍魔導士（9轉）', 120], [2218, '龍魔導士（10轉）', 160]] },
  { key: 'merc', name: '精靈遊俠', note: '精靈之王，使用雙弩槍的敏捷射手。', jobs: [
    [2002, '精靈遊俠（初心）', 1], [2300, '精靈遊俠（一轉）', 10], [2310, '精靈遊俠（二轉）', 30], [2311, '精靈遊俠（三轉）', 70], [2312, '精靈遊俠（四轉）', 120]] },
  { key: 'phantom', name: '幻影俠盜', note: '怪盜幻影，可以竊取其他職業的技能。', jobs: [
    [2003, '幻影俠盜（初心）', 1], [2400, '幻影俠盜（一轉）', 10], [2410, '幻影俠盜（二轉）', 30], [2411, '幻影俠盜（三轉）', 70], [2412, '幻影俠盜（四轉）', 120]] },
  { key: 'demon', name: '惡魔', note: '背叛黑魔法師的惡魔殺手，以惡魔之力取代 MP。', jobs: [
    [3001, '惡魔（初心）', 1], [3100, '惡魔殺手（一轉）', 10], [3110, '惡魔殺手（二轉）', 30], [3111, '惡魔殺手（三轉）', 70], [3112, '惡魔殺手（四轉）', 120]] },
  { key: 'res', name: '末日反抗軍', note: '埃德爾斯坦的反抗軍，三種職業各有特色。', jobs: [
    [3000, '市民', 1],
    [3200, '煉獄巫師（一轉）', 10], [3210, '煉獄巫師（二轉）', 30], [3211, '煉獄巫師（三轉）', 70], [3212, '煉獄巫師（四轉）', 120],
    [3300, '狂豹獵人（一轉）', 10], [3310, '狂豹獵人（二轉）', 30], [3311, '狂豹獵人（三轉）', 70], [3312, '狂豹獵人（四轉）', 120],
    [3500, '機甲戰神（一轉）', 10], [3510, '機甲戰神（二轉）', 30], [3511, '機甲戰神（三轉）', 70], [3512, '機甲戰神（四轉）', 120]] },
  { key: 'mihile', name: '米哈逸', note: '皇家騎士團團長，以盾牌守護同伴的騎士。', jobs: [
    [5000, '米哈逸（初心）', 1], [5100, '米哈逸（一轉）', 10], [5110, '米哈逸（二轉）', 30], [5111, '米哈逸（三轉）', 70], [5112, '米哈逸（四轉）', 120]] },
];
const JOBNAME = {}; const JOBLV = {}; const JOBFAM = {};
FAMILIES.forEach(f => f.jobs.forEach(([id, n, lv]) => { JOBNAME[id] = n; JOBLV[id] = lv; JOBFAM[id] = f; }));
const jobName = id => JOBNAME[id] || (id === 900 || id === 910 ? 'GM' : '其他職業');
// 主屬性 / 副屬性（與客戶端「自動分配」4:1 相同）
const MAINSTAT = [
  ['劍士系（英雄、聖騎士、黑騎士）、聖魂劍士、狂狼勇士、惡魔殺手、米哈逸、打手系、重砲指揮官', '力量', '敏捷'],
  ['法師系、烈焰巫師、龍魔導士、煉獄巫師', '智力', '幸運'],
  ['弓箭手系、破風使者、精靈遊俠、狂豹獵人、機甲戰神、槍手系、蒼龍俠客', '敏捷', '力量'],
  ['盜賊系、暗夜行者、影武者、幻影俠盜', '幸運', '敏捷'],
];

// ---------- item labels ----------
const EQUIP_CAT = {
  100: '帽子', 101: '臉飾', 102: '眼飾', 103: '耳環', 104: '上衣', 105: '套服', 106: '褲／裙', 107: '鞋子', 108: '手套',
  109: '盾牌', 110: '披風', 111: '戒指', 112: '墜飾', 113: '腰帶', 114: '勳章', 115: '肩飾', 116: '口袋道具', 118: '徽章',
  130: '單手劍', 131: '單手斧', 132: '單手棍', 133: '短劍', 134: '短劍（雙刀）', 135: '副武器', 136: '手杖', 137: '短杖', 138: '長杖',
  140: '雙手劍', 141: '雙手斧', 142: '雙手棍', 143: '槍', 144: '矛', 145: '弓', 146: '弩', 147: '拳套', 148: '指虎',
  149: '火槍', 150: '鏟', 151: '十字鎬', 152: '雙弩槍', 153: '加農砲', 170: '點裝武器', 180: '寵物裝備', 181: '寵物裝備',
  182: '寵物裝備', 183: '寵物裝備', 190: '騎寵', 191: '鞍座', 192: '騎寵', 193: '騎寵', 194: '機甲配件', 195: '機甲配件',
  196: '機甲配件', 197: '機甲配件', 198: '龍裝備',
};
const USE_CAT = { 200: '藥水', 201: '藥水', 202: '食物', 203: '傳送', 204: '卷軸', 205: '解除異常', 206: '箭矢', 207: '飛鏢',
  208: '寵物食品', 210: '召喚袋', 211: '召喚', 212: '寵物食品', 221: '變身', 222: '藥水', 228: '技能書', 229: '能手冊',
  230: '晉升', 233: '子彈', 234: '補充', 237: '卷軸', 238: '怪物卡', 243: '騎寵', 247: '卷軸', 248: '咒文', 249: '卷軸' };
const CATS = [[1, '裝備'], [2, '消耗'], [3, '裝飾'], [4, '其他'], [5, '特殊']];
const itemCat = id => { const c = Math.floor(id / 1000000), s = Math.floor(id / 10000);
  return c === 1 ? EQUIP_CAT[s] || '裝備' : c === 2 ? USE_CAT[s] || '消耗' : ({ 3: '裝飾', 4: '其他', 5: '特殊' })[c] || ''; };
const STAT = { reqLevel: '需求等級', reqJob: '需求職業', reqSTR: '需求力量', reqDEX: '需求敏捷', reqINT: '需求智力', reqLUK: '需求幸運',
  reqPOP: '需求名聲', STR: '力量', DEX: '敏捷', INT: '智力', LUK: '幸運', MHP: '最大HP', MMP: '最大MP', PAD: '攻擊力', MAD: '魔法攻擊力',
  PDD: '物理防禦力', MDD: '魔法防禦力', ACC: '命中率', EVA: '迴避率', Speed: '移動速度', Jump: '跳躍力', tuc: '可升級次數',
  attackSpeed: '攻擊速度', success: '成功率', cursed: '失敗時損毀率', MHPr: '最大HP', MMPr: '最大MP', durability: '耐久度',
  charmEXP: '魅力經驗' };
const SPEEDS = { 2: '極快', 3: '極快', 4: '快', 5: '快', 6: '普通', 7: '慢', 8: '慢', 9: '極慢' };
const reqJob = v => { if (!v) return '全職業'; if (v < 0) return '初心者';
  return [[1, '劍士'], [2, '法師'], [4, '弓箭手'], [8, '盜賊'], [16, '海盜']].filter(([b]) => v & b).map(x => x[1]).join('、'); };
const FX = { hp: ['恢復 HP', v => fmt(v)], mp: ['恢復 MP', v => fmt(v)], hpR: ['恢復 HP', v => v + '%'], mpR: ['恢復 MP', v => v + '%'],
  pad: ['攻擊力', v => '+' + v], mad: ['魔法攻擊力', v => '+' + v], pdd: ['物理防禦', v => '+' + v], mdd: ['魔法防禦', v => '+' + v],
  acc: ['命中率', v => '+' + v], eva: ['迴避率', v => '+' + v], speed: ['移動速度', v => '+' + v], jump: ['跳躍力', v => '+' + v],
  str: ['力量', v => '+' + v], dex: ['敏捷', v => '+' + v], int: ['智力', v => '+' + v], luk: ['幸運', v => '+' + v],
  indiePad: ['攻擊力', v => '+' + v], indieMad: ['魔法攻擊力', v => '+' + v], indiePdd: ['物理防禦', v => '+' + v],
  indieMdd: ['魔法防禦', v => '+' + v], indieSpeed: ['移動速度', v => '+' + v], indieJump: ['跳躍力', v => '+' + v],
  indieMhp: ['最大 HP', v => '+' + v], indieMmp: ['最大 MP', v => '+' + v], indieAllStat: ['全屬性', v => '+' + v],
  padRate: ['攻擊力', v => '+' + v + '%'], madRate: ['魔法攻擊力', v => '+' + v + '%'], pddRate: ['物理防禦', v => '+' + v + '%'],
  mddRate: ['魔法防禦', v => '+' + v + '%'], accRate: ['命中率', v => '+' + v + '%'], evaRate: ['迴避率', v => '+' + v + '%'],
  speedRate: ['移動速度', v => '+' + v + '%'], expBuff: ['經驗值加成', v => '+' + v + '%'], exp: ['獲得經驗值', v => fmt(v)],
  time: ['持續時間', v => v >= 1000 ? fmtTime(v / 1000) : fmtTime(v)], prob: ['發動機率', v => v + '%'],
  moveTo: ['傳送到', v => mapLink(v)], poison: ['解除中毒', () => '✓'], seal: ['解除封印', () => '✓'], darkness: ['解除黑暗', () => '✓'],
  weakness: ['解除虛弱', () => '✓'], curse: ['解除詛咒', () => '✓'], thaw: ['抗寒', v => v], party: ['對隊伍有效', () => '✓'],
  booster: ['攻擊速度提升', v => v], itemupbyitem: ['掉寶加倍', () => '✓'], mesoupbyitem: ['楓幣加倍', () => '✓'], morph: ['變身', () => '✓'],
  success: ['成功率', v => v + '%'], cursed: ['失敗時裝備損毀率', v => v + '%'], incSTR: ['力量', v => '+' + v], incDEX: ['敏捷', v => '+' + v],
  incINT: ['智力', v => '+' + v], incLUK: ['幸運', v => '+' + v], incPAD: ['攻擊力', v => '+' + v], incMAD: ['魔法攻擊力', v => '+' + v],
  incPDD: ['物理防禦', v => '+' + v], incMDD: ['魔法防禦', v => '+' + v], incACC: ['命中率', v => '+' + v], incEVA: ['迴避率', v => '+' + v],
  incMHP: ['最大 HP', v => '+' + v], incMMP: ['最大 MP', v => '+' + v], incSpeed: ['移動速度', v => '+' + v], incJump: ['跳躍力', v => '+' + v],
  reqLevel: ['使用等級', v => 'Lv.' + v], masterLevel: ['技能上限提升至', v => v], reqSkillLevel: ['需求技能等級', v => v],
  tuc: ['升級次數', v => v], recover: ['恢復升級次數', v => v], randstat: ['屬性隨機變動', () => '✓'], lvOptimum: ['適合等級', v => 'Lv.' + v] };
const fmtTime = s => s >= 3600 ? `${+(s / 3600).toFixed(1)} 小時` : s >= 60 ? `${+(s / 60).toFixed(1)} 分鐘` : `${s} 秒`;
const ELEM = { F: '火', I: '冰', L: '雷', S: '毒', H: '聖', D: '暗', P: '物理' };
const ELEMV = { 1: '免疫', 2: '抗性', 3: '弱點' };
const elem = s => (s || '').match(/[A-Z]\d/g)?.map(x => `${ELEM[x[0]] || x[0]}${ELEMV[x[1]] || ''}`).join('、') || '';

// ---------- links ----------
const itemName = id => N.i[id] || '未知道具';
const mobName = id => N.m[id] || '未知怪物';
const mapName = id => { const m = N.map[id]; return m ? (m[0] ? `${m[0]}：${m[1]}` : m[1]) : '特殊地圖'; };
const npcName = id => N.p[id] || 'NPC';
const itemLink = (id, extra = '') => `<a class="cell" href="#item/${id}"><img src="img/item/${id}.png" alt="" loading="lazy" onerror="this.remove()"><b>${esc(itemName(id))}</b>${extra}</a>`;
const mobLink = id => `<a class="cell" href="#mob/${id}"><img src="img/mob/${id}.png" alt="" loading="lazy" onerror="this.remove()"><b>${esc(mobName(id))}</b></a>`;
const mapLink = id => N.map[id] ? `<a href="#map/${id}">${esc(mapName(id))}</a>` : esc(mapName(id));
const npcCell = id => `<span class="cell"><img src="img/npc/${id}.png" alt="" loading="lazy" onerror="this.remove()"><b>${esc(npcName(id))}</b></span>`;
const questLink = id => `<a href="#quest/${id}">${esc(N.q[id] || '未知任務')}</a>`;
const skillLink = id => `<a class="cell" href="#skill/${id}"><img src="img/skill/${id}.png" alt="" loading="lazy" onerror="this.remove()"><b>${esc(N.s[id] || '未知技能')}</b></a>`;

// 遊戲文字中的 #b #k #t道具# #o怪物# #m地圖# #p NPC# 等代碼
function gameText(s) {
  if (!s) return '';
  // 原始文字混有 \r\n 字面字串與真正換行
  const t = String(s).replace(/\\r/g, '').replace(/\\n/g, '\n').replace(/\\+\n/g, '\n').replace(/\r/g, '');
  let out = esc(t).replace(/\n/g, '<br>');
  out = out.replace(/#(t|z)(\d+)(:\d+)?#/g, (_, __, id) => `<a href="#item/${id}">${esc(itemName(+id))}</a>`)
    .replace(/#i(\d+)(:\d+)?#/g, (_, id) => `<img src="img/item/${id}.png" alt="" onerror="this.remove()">`)
    .replace(/#o(\d+)#/g, (_, id) => `<a href="#mob/${id}">${esc(mobName(+id))}</a>`)
    .replace(/#m(\d+)#/g, (_, id) => mapLink(+id))
    .replace(/#p(\d+)#/g, (_, id) => esc(npcName(+id)))
    .replace(/#q(\d+)#/g, (_, id) => esc(N.q[id] || ''))
    .replace(/#s(\d+)#/g, (_, id) => `<img src="img/skill/${id}.png" alt="" onerror="this.remove()">`)
    .replace(/#c(\d+)#/g, '')
    .replace(/#R\d+#|#a\d+#|#M\d+#|#x#|#W[^#]*#|#j#|#u\d+#/g, '')
    .replace(/#h ?\d*#/g, '你');
  let open = 0;
  out = out.replace(/#([bkrgdpenlfBIQEF])/g, (_, c) => {
    const close = '</span>'.repeat(open); open = 0;
    const cls = { b: 'b', r: 'r', g: 'g', d: 'p' }[c];
    if (cls) { open = 1; return close + `<span class="${cls}">`; }
    return close;
  });
  return out + '</span>'.repeat(open);
}

// 技能公式：x = 等級，u() 無條件進位，d() 無條件捨去
function evalFormula(expr, x) {
  const s = String(expr).trim();
  if (!/^[\dx+\-*/().ud\s]+$/.test(s)) return s;
  try { const v = Function('x', 'u', 'd', `return (${s});`)(x, Math.ceil, Math.floor); return Number.isFinite(v) ? +v.toFixed(2) : s; }
  catch { return s; }
}
function skillLevelText(sk, lv) {
  if (sk.hl) return sk.hl[lv - 1] || '';
  if (!sk.h || !sk.f) return '';
  return sk.h.replace(/#(\w+)/g, (m, k) => k in sk.f ? evalFormula(sk.f[k], lv) : m);
}

// ---------- shared UI ----------
function listPage({ title, lead, rows, render, filters = '', pageSize = 60, state }) {
  const page = Math.max(0, state.page || 0), pages = Math.max(1, Math.ceil(rows.length / pageSize));
  const p = Math.min(page, pages - 1);
  return `<h1>${title}</h1><p class="lead2">${lead}</p>
    <div class="toolbar"><input type="search" id="q" placeholder="搜尋名稱…" value="${esc(state.q || '')}">${filters}
    <span class="count">共 ${fmt(rows.length)} 筆</span></div>
    <div class="list">${rows.slice(p * pageSize, (p + 1) * pageSize).map(render).join('') || '<p class="empty">找不到符合的資料。</p>'}</div>
    ${pages > 1 ? `<div class="pager"><button data-page="${p - 1}" ${p ? '' : 'disabled'}>上一頁</button>
      <span>${p + 1} / ${pages}</span><button data-page="${p + 1}" ${p < pages - 1 ? '' : 'disabled'}>下一頁</button></div>` : ''}`;
}
const match = (q, name) => !q || (name || '').toLowerCase().includes(q.toLowerCase());
const state = {};
function bindList(tab, rerender) {
  const q = V.querySelector('#q');
  if (q) {
    // list pages re-render while typing; keep the caret in the search box
    q.addEventListener('input', () => { state[tab].q = q.value.trim(); state[tab].page = 0; state[tab].focus = true; rerender(); });
    if (state[tab].focus) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
    state[tab].focus = false;
  }
  V.querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => { state[tab].page = +b.dataset.page; rerender(); scrollTo(0, 0); }));
  V.querySelectorAll('[data-f]').forEach(el => el.addEventListener(el.tagName === 'BUTTON' ? 'click' : 'change', () => {
    state[tab][el.dataset.f] = el.tagName === 'BUTTON' ? el.dataset.v : el.type === 'checkbox' ? el.checked : el.value.trim();
    if (el.dataset.f === 'c') state[tab].sub = '';
    state[tab].page = 0; rerender();
  }));
}
const table = (head, rows) => rows.length ? `<div class="tablewrap"><table class="t"><thead><tr>${head.map(h => `<th${h.startsWith('#') ? ' class="num"' : ''}>${h.replace(/^#/, '')}</th>`).join('')}</tr></thead>
  <tbody>${rows.map(r => `<tr>${r.map((c, i) => `<td${head[i].startsWith('#') ? ' class="num"' : ''}>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>` : '<p class="empty">沒有資料。</p>';
const kv = pairs => `<div class="kv">${pairs.filter(p => p && p[1] !== undefined && p[1] !== '').map(([k, v]) => `<div><span>${k}</span><b>${v}</b></div>`).join('')}</div>`;
const back = (href, text) => `<a class="back" href="${href}">← ${text}</a>`;

// ---------- items ----------
async function allItems(c) { return load(`items-${c}`); }
async function viewItems() {
  const st = state.items ||= { c: '1', sub: '', page: 0 };
  const data = await allItems(st.c);
  const subs = st.c === '1' ? [...new Set(Object.keys(data).map(id => Math.floor(id / 10000)))].filter(s => EQUIP_CAT[s]).sort((a, b) => a - b) : [];
  const rows = Object.values(data).filter(it => match(st.q, it.n, it.id) && (!st.sub || EQUIP_CAT[Math.floor(it.id / 10000)] === st.sub))
    .sort((a, b) => (a.st?.reqLevel || 0) - (b.st?.reqLevel || 0) || a.id - b.id);
  const filters = `<div class="chips" style="flex-basis:100%">${CATS.map(([c, n]) => `<button data-f="c" data-v="${c}" class="${st.c == c ? 'on' : ''}">${n}</button>`).join('')}</div>
    ${subs.length ? `<select data-f="sub"><option value="">全部種類</option>${[...new Set(subs.map(s => EQUIP_CAT[s]))].map(n =>
      `<option value="${n}" ${st.sub === n ? 'selected' : ''}>${n}</option>`).join('')}</select>` : ''}`;
  V.innerHTML = listPage({ title: '道具介紹', lead: '所有道具的說明、能力、效果與取得方式。點道具看詳細介紹。', rows, filters, state: st,
    render: it => `<a class="row" href="#item/${it.id}"><span class="ic">${img('item', it.id, it.img)}</span><span class="tx"><b>${esc(it.n)}</b>
      <small>${itemCat(it.id)}${it.st?.reqLevel ? ` ・ Lv.${it.st.reqLevel}` : ''}${it.fx ? ' ・ 有效果' : ''}</small></span></a>` });
  bindList('items', () => viewItems());
  state.items.focus = false;
}
async function viewItem(id) {
  const it = (await allItems(String(Math.floor(id / 1000000))))[id];
  if (!it) return notFound('道具');
  const st = it.st || {}, fx = it.fx || {};
  const stats = Object.entries(st).filter(([k]) => STAT[k] && !['cash'].includes(k)).map(([k, v]) => [STAT[k],
    k === 'reqJob' ? reqJob(v) : k === 'attackSpeed' ? (SPEEDS[v] || v) : /^(MHPr|MMPr|success|cursed)$/.test(k) ? v + '%' : /^req/.test(k) ? v : (k === 'tuc' || k === 'durability' || k === 'charmEXP') ? v : '+' + v]);
  const fxRows = Object.entries(fx).filter(([k]) => FX[k]).map(([k, v]) => [FX[k][0], FX[k][1](v)]);
  if (fx.skills) fxRows.push(['適用技能', fx.skills.map(s => esc(N.s[s] || s)).join('、')]);
  const flags = [st.cash ? '點裝' : '', st.equipTradeBlock ? '裝備後無法交換' : ''].filter(Boolean);
  V.innerHTML = `${back('#items', '道具列表')}<div class="detail"><div class="portrait">${img('item', it.id, it.img, 'icon')}</div><div>
    <h1>${esc(it.n)}</h1><p class="lead2">${itemCat(it.id)}${flags.map(f => `<span class="badge">${f}</span>`).join('')}</p>
    ${it.d ? `<div class="desc qt">${gameText(it.d)}</div>` : ''}
    ${stats.length ? `<h2>道具能力</h2>${kv(stats)}` : ''}
    ${fxRows.length ? `<h2>道具功能</h2>${kv(fxRows)}` : ''}
    ${kv([['商店收購價', it.p ? fmt(it.p) + ' 楓幣' : ''], ['最多疊加', it.sm > 1 ? fmt(it.sm) + ' 個' : '']])}
    ${it.box ? `<h2>開啟後可能獲得</h2>${table(['道具', '#數量', '#機率'], it.box.map(([i, p, q]) => [itemLink(i), q || 1, p ? p + '%' : '']))}` : ''}
    <h2>取得方式</h2>
    ${it.drop ? `<h3>怪物掉落</h3>${table(['怪物', '#機率'], it.drop.map(([m, ch, q]) => [mobLink(m) + (q ? ` <span class="badge">任務中</span>` : ''), pct(ch)]))}` : ''}
    ${it.shop ? `<h3>商店販售</h3>${table(['NPC', '#價格'], it.shop.map(([n, p]) => [npcCell(n), p ? fmt(p) + ' 楓幣' : '']))}` : ''}
    ${it.quest ? `<h3>任務獎勵</h3><p>${it.quest.map(questLink).join('、')}</p>` : ''}
    ${!it.drop && !it.shop && !it.quest ? '<p class="empty">目前沒有怪物掉落、商店販售或任務獎勵的紀錄。</p>' : ''}
  </div></div>`;
}

// ---------- mobs ----------
async function viewMobs() {
  const st = state.mobs ||= { page: 0, sort: 'lv' };
  const mobs = await load('mobs');
  const rows = Object.values(mobs).filter(m => match(st.q, m.n, m.id) && (!st.boss || m.boss) && (!st.spawn || m.maps.length))
    .sort((a, b) => st.sort === 'lv' ? (a.lv || 0) - (b.lv || 0) || a.id - b.id : st.sort === 'exp' ? (b.exp || 0) - (a.exp || 0) : (b.hp || 0) - (a.hp || 0));
  const filters = `<select data-f="sort"><option value="lv" ${st.sort === 'lv' ? 'selected' : ''}>依等級</option><option value="exp" ${st.sort === 'exp' ? 'selected' : ''}>依經驗值</option><option value="hp" ${st.sort === 'hp' ? 'selected' : ''}>依 HP</option></select>
    <label><input type="checkbox" data-f="spawn" ${st.spawn ? 'checked' : ''}>只看地圖上有出現的</label>
    <label><input type="checkbox" data-f="boss" ${st.boss ? 'checked' : ''}>只看 BOSS</label>`;
  V.innerHTML = listPage({ title: '怪物介紹', lead: '怪物能力、出現地圖（怪物分布）與掉落物。', rows, filters, state: st,
    render: m => `<a class="row" href="#mob/${m.id}"><span class="ic">${img('mob', m.id, m.img)}</span><span class="tx"><b>${esc(m.n)}${m.boss ? '<span class="badge boss">BOSS</span>' : ''}</b>
      <small>Lv.${m.lv || '?'} ・ HP ${fmt(m.hp)} ・ 經驗 ${fmt(m.exp)}${m.maps.length ? ` ・ ${m.maps.length} 張地圖` : ''}</small></span></a>` });
  bindList('mobs', () => viewMobs()); st.focus = false;
}
async function viewMob(id) {
  const m = (await load('mobs'))[id];
  if (!m) return notFound('怪物');
  const meso = m.drops.filter(d => d[0] === 0), items = m.drops.filter(d => d[0] !== 0);
  V.innerHTML = `${back('#mobs', '怪物列表')}<div class="detail"><div class="portrait">${img('mob', m.id, m.img)}</div><div>
    <h1>${esc(m.n)}${m.boss ? '<span class="badge boss">BOSS</span>' : ''}</h1><p class="lead2">Lv.${m.lv || '?'}${m.maps.length ? ` ・ 出現在 ${m.maps.length} 張地圖` : ''}</p>
    ${kv([['等級', m.lv], ['HP', fmt(m.hp)], ['MP', fmt(m.mp)], ['經驗值', fmt(m.exp)], ['物理攻擊', fmt(m.pad)], ['魔法攻擊', fmt(m.mad)],
      ['物理防禦率', m.pdr != null ? m.pdr + '%' : ''], ['魔法防禦率', m.mdr != null ? m.mdr + '%' : ''], ['命中', m.acc], ['迴避', m.eva],
      ['屬性', elem(m.elem)], ['不死系', m.undead ? '是' : ''], ['主動攻擊', m.fa ? '是' : '']])}
    <h2>怪物分布</h2>${table(['地圖', '#數量'], m.maps.map(([mp, c]) => [mapLink(mp), c + ' 隻']))}
    <h2>怪物掉落</h2>
    ${meso.length ? `<p>楓幣：${meso.map(d => `${fmt(d[2])}～${fmt(d[3])}（${pct(d[1])}）`).join('、')}</p>` : ''}
    ${table(['道具', '#數量', '#機率'], items.map(([i, ch, lo, hi, q]) => [itemLink(i) + (q ? ` <span class="badge">任務中才掉</span>` : ''), lo === hi ? lo : `${lo}～${hi}`, pct(ch)]))}
  </div></div>`;
}

// ---------- maps ----------
async function viewMaps() {
  const st = state.maps ||= { page: 0 };
  const maps = await load('maps');
  const rows = Object.values(maps).filter(m => (match(st.q, m.n, m.id) || match(st.q, m.s)) && (!st.mob || m.mobs.length) && (!st.town || m.town))
    .sort((a, b) => a.id - b.id);
  const filters = `<label><input type="checkbox" data-f="town" ${st.town ? 'checked' : ''}>只看村莊</label>
    <label><input type="checkbox" data-f="mob" ${st.mob ? 'checked' : ''}>只看有怪物的地圖</label>`;
  V.innerHTML = listPage({ title: '地圖介紹', lead: '每張地圖的怪物、NPC 與相連地圖。', rows, filters, state: st,
    render: m => `<a class="row" href="#map/${m.id}"><span class="tx"><b>${esc(m.n)}${m.town ? '<span class="badge">村莊</span>' : ''}</b>
      <small>${esc(m.s)} ・ ${m.mobs.length ? `${m.mobs.length} 種怪物` : '沒有怪物'}${m.npcs.length ? ` ・ ${m.npcs.length} 位 NPC` : ''}</small></span></a>` });
  bindList('maps', () => viewMaps()); st.focus = false;
}
async function viewMap(id) {
  const [maps, mobs] = await Promise.all([load('maps'), load('mobs')]);
  const m = maps[id];
  if (!m) return notFound('地圖');
  V.innerHTML = `${back('#maps', '地圖列表')}<h1>${esc(m.n)}${m.town ? '<span class="badge">村莊</span>' : ''}</h1>
    <p class="lead2">${esc(m.s)}</p>
    ${m.d ? `<div class="desc">${esc(m.d)}</div>` : ''}
    ${m.mm ? `<h2>小地圖</h2><img class="minimap" src="img/map/${m.id}.png" alt="${esc(m.n)} 小地圖" loading="lazy">` : ''}
    ${kv([['回城地圖', m.ret ? mapLink(m.ret) : '']])}
    <h2>出現的怪物</h2>${table(['怪物', '#等級', '#HP', '#經驗值', '#數量'], m.mobs.map(([mb, c]) => [mobLink(mb), mobs[mb]?.lv ?? '', fmt(mobs[mb]?.hp), fmt(mobs[mb]?.exp), c + ' 隻']))}
    <h2>NPC</h2>${m.npcs.length ? `<div class="list">${m.npcs.map(n => `<div class="row">${npcCell(n)}</div>`).join('')}</div>` : '<p class="empty">沒有 NPC。</p>'}
    <h2>相連的地圖</h2>${m.to.length ? `<p>${m.to.map(mapLink).join('、')}</p>` : '<p class="empty">沒有傳送點。</p>'}`;
}

// ---------- quests ----------
async function viewQuests() {
  const st = state.quests ||= { page: 0 };
  const qs = await load('quests');
  const rows = Object.values(qs).filter(q => q.n && (match(st.q, q.n, q.id) || match(st.q, q.pa)) && (!st.lv || (q.req[0].lvmin || 0) <= +st.lv))
    .sort((a, b) => (a.req[0].lvmin || 0) - (b.req[0].lvmin || 0) || a.id - b.id);
  const filters = `<label>我的等級 <input type="search" inputmode="numeric" data-f="lv" value="${esc(st.lv || '')}" style="width:90px" placeholder="不限"></label>`;
  V.innerHTML = listPage({ title: '任務介紹', lead: '任務條件、內容與獎勵。可以輸入等級，只看現在能接的任務。', rows, filters, state: st,
    render: q => `<a class="row" href="#quest/${q.id}"><span class="tx"><b>${esc(q.n)}</b>
      <small>${q.req[0].lvmin ? `Lv.${q.req[0].lvmin} 以上` : '不限等級'}${q.pa ? ' ・ ' + esc(q.pa) : ''}${q.req[0].npc ? ' ・ ' + esc(npcName(q.req[0].npc)) : ''}</small></span></a>` });
  bindList('quests', () => viewQuests()); st.focus = false;
}
function reqBlock(r, side) {
  const out = [];
  if (r.npc) out.push(['NPC', npcCell(r.npc)]);
  if (r.lvmin || r.lvmax) out.push(['等級', `${r.lvmin ? 'Lv.' + r.lvmin : ''}${r.lvmax ? ' ～ Lv.' + r.lvmax : ' 以上'}`]);
  if (r.job) out.push(['職業', r.job.map(jobName).join('、')]);
  if (r.pop) out.push(['名聲', r.pop + ' 以上']);
  if (r.interval) out.push(['可重複', `每 ${fmtTime(r.interval * 60)} 一次`]);
  let html = kv(out);
  if (r.quest?.length) html += `<p>需要先${r.quest.map(([q, s]) => `${s === 1 ? '進行' : '完成'}「${questLink(q)}」`).join('、')}</p>`;
  if (r.mob?.length) html += `<h3>需要擊敗</h3>${table(['怪物', '#數量'], r.mob.map(([m, c]) => [mobLink(m), c + ' 隻']))}`;
  if (r.item?.length) html += `<h3>${side ? '需要帶來' : '需要持有'}</h3>${table(['道具', '#數量'], r.item.filter(([, c]) => c > 0).map(([i, c]) => [itemLink(i), c]))}`;
  return html;
}
function actBlock(a) {
  const out = [];
  if (a.exp) out.push(['經驗值', fmt(a.exp)]);
  if (a.money) out.push(['楓幣', fmt(a.money)]);
  if (a.pop) out.push(['名聲', '+' + a.pop]);
  if (a.sp) out.push(['技能點數', '+' + a.sp]);
  let html = kv(out);
  const give = (a.item || []).filter(i => i[1] > 0), take = (a.item || []).filter(i => i[1] < 0);
  if (give.length) html += `<h3>獲得道具</h3>${table(['道具', '#數量', '條件'], give.map(([i, c, p, j, g]) => [itemLink(i), c,
    [p > 0 ? '隨機其中一項' : '', j > 0 ? '限特定職業' : '', g === 0 ? '限男性' : g === 1 ? '限女性' : ''].filter(Boolean).join('、')]))}`;
  if (take.length) html += `<p>會收回：${take.map(([i, c]) => `${esc(itemName(i))} ×${-c}`).join('、')}</p>`;
  if (a.skill?.length) html += `<h3>學會技能</h3><div class="list">${a.skill.map(([s]) => `<div class="row">${skillLink(s)}</div>`).join('')}</div>`;
  if (a.nextQuest) html += `<p>接著開始：${questLink(a.nextQuest)}</p>`;
  return html;
}
async function viewQuest(id) {
  const q = (await load('quests'))[id];
  if (!q) return notFound('任務');
  const [t0, t1, t2] = q.t;
  V.innerHTML = `${back('#quests', '任務列表')}<h1>${esc(q.n)}</h1><p class="lead2">${q.pa ? esc(q.pa) : '任務'}${q.auto ? '<span class="badge">自動開始</span>' : ''}</p>
    ${t0 || t1 ? `<div class="desc qt">${gameText(t0 || t1)}</div>` : ''}
    <h2>開始條件</h2>${reqBlock(q.req[0], 0) || '<p class="empty">沒有特別條件。</p>'}
    <h2>完成條件</h2>${reqBlock(q.req[1], 1) || '<p class="empty">沒有特別條件。</p>'}
    ${t2 ? `<h2>完成後</h2><div class="desc qt">${gameText(t2)}</div>` : ''}
    <h2>任務獎勵</h2>${actBlock(q.act[1]) || '<p class="empty">沒有獎勵紀錄。</p>'}
    ${Object.keys(q.act[0]).length ? `<h2>接任務時獲得</h2>${actBlock(q.act[0])}` : ''}`;
}

// ---------- jobs & skills ----------
async function viewJobs() {
  const jobs = await load('jobs');
  V.innerHTML = `<h1>職業介紹</h1><p class="lead2">懷舊谷 12 大職業全部開放建立。點職業可以看那一轉的技能。</p>
    <div class="family">${FAMILIES.map(f => `<div class="fam"><h3>${f.name}</h3><p>${f.note}</p>
      <div class="path">${f.jobs.filter(([id]) => jobs[id] || id % 100 === 0).map(([id, n, lv]) => `<a href="#job/${id}">${n}<span class="lv">Lv.${lv}</span></a>`).join('')}</div></div>`).join('')}</div>
    <h2>主屬性</h2>${table(['職業', '主屬性', '副屬性'], MAINSTAT.map(([j, a, b]) => [j, `<span class="stat-pill">${a}</span>`, b]))}
    <p class="note">轉職等級為一般規則；3 轉、4 轉要完成轉職任務。詳細能力點數規則請看 <a href="#ap">能力點數介紹</a>。</p>`;
}
async function viewJob(id) {
  const [jobs, skills] = await Promise.all([load('jobs'), load('skills')]);
  const j = jobs[id], f = JOBFAM[id];
  const ids = j?.skills || [];
  V.innerHTML = `${back('#jobs', '職業列表')}<h1>${esc(jobName(id))}</h1>
    <p class="lead2">${f ? f.name + ' ・ ' : ''}轉職等級 Lv.${JOBLV[id] ?? '?'}${j?.book ? ' ・ 技能書：' + esc(j.book) : ''}</p>
    ${f ? `<div class="path">${f.jobs.filter(([x]) => jobs[x]).map(([x, n]) => `<a href="#job/${x}" ${x == id ? 'style="border-color:var(--accent)"' : ''}>${n}</a>`).join('')}</div>` : ''}
    <h2>技能（${ids.length}）</h2>
    ${ids.length ? `<div class="list">${ids.map(s => skills[s]).filter(Boolean).map(s => `<a class="row" href="#skill/${s.id}"><span class="ic">${img('skill', s.id, s.img)}</span>
      <span class="tx"><b>${esc(s.n)}</b><small>最高 ${s.max || '-'} 級${s.ml ? `（需精通書，初始上限 ${s.ml}）` : ''}</small></span></a>`).join('')}</div>` : '<p class="empty">這一轉沒有技能資料。</p>'}`;
}
async function viewSkills() {
  const st = state.skills ||= { page: 0 };
  const skills = await load('skills');
  const rows = Object.values(skills).filter(s => (match(st.q, s.n, s.id) || match(st.q, jobName(s.job))) && (!st.job || JOBFAM[s.job]?.key === st.job))
    .sort((a, b) => a.job - b.job || a.id - b.id);
  const filters = `<select data-f="job"><option value="">全部職業</option>${FAMILIES.map(f => `<option value="${f.key}" ${st.job === f.key ? 'selected' : ''}>${f.name}</option>`).join('')}</select>`;
  V.innerHTML = listPage({ title: '技能介紹', lead: '每個技能的說明與各等級效果。', rows, filters, state: st,
    render: s => `<a class="row" href="#skill/${s.id}"><span class="ic">${img('skill', s.id, s.img)}</span><span class="tx"><b>${esc(s.n)}</b>
      <small>${esc(jobName(s.job))} ・ 最高 ${s.max || '-'} 級</small></span></a>` });
  bindList('skills', () => viewSkills()); st.focus = false;
}
async function viewSkill(id) {
  const s = (await load('skills'))[id];
  if (!s) return notFound('技能');
  const max = Math.max(1, s.max || 1);
  V.innerHTML = `${back('#job/' + s.job, jobName(s.job) + ' 的技能')}<div class="detail"><div class="portrait">${img('skill', s.id, s.img, 'icon')}</div><div>
    <h1>${esc(s.n)}</h1><p class="lead2">${esc(jobName(s.job))} ・ 最高 ${s.max || '-'} 級${s.ml ? `（未使用精通書時上限 ${s.ml} 級）` : ''}</p>
    ${s.d ? `<div class="desc qt">${gameText(s.d)}</div>` : ''}
    ${s.req ? `<p>前置技能：${Object.entries(s.req).map(([k, v]) => `${skillLink(+k)} Lv.${v}`).join('、')}</p>` : ''}
    ${s.h || s.hl ? `<h2>等級效果</h2><div class="lvbar"><label for="lv">等級 <b id="lvv">1</b></label><input type="range" id="lv" min="1" max="${max}" value="1"></div>
      <div class="desc qt" id="lvtext"></div>
      <h2>各等級一覽</h2>${table(['#等級', '效果'], Array.from({ length: max }, (_, i) => [i + 1, gameText(skillLevelText(s, i + 1))]))}` : ''}
  </div></div>`;
  const r = V.querySelector('#lv');
  if (r) { const upd = () => { V.querySelector('#lvv').textContent = r.value; V.querySelector('#lvtext').innerHTML = gameText(skillLevelText(s, +r.value)); }; r.addEventListener('input', upd); upd(); }
}

// ---------- AP guide ----------
function viewAp() {
  V.innerHTML = `<div class="guide"><h1>能力點數介紹</h1><p class="lead2">能力點數（AP）用來提升力量、敏捷、智力、幸運、HP 與 MP。以下規則取自懷舊谷伺服器。</p>
  <h2>怎麼獲得</h2>
  <ul><li>每升 1 級獲得 <b>5 點</b>能力點數。</li><li><b>皇家騎士團</b>在 70 級以前每級獲得 <b>6 點</b>，71 級起每級 5 點。</li></ul>
  <h2>四大屬性</h2>
  ${table(['屬性', '作用'], [['力量 STR', '劍士、打手、重砲等職業的主要攻擊屬性'], ['敏捷 DEX', '弓箭手、槍手的主要攻擊屬性，也會提升命中與迴避'],
    ['智力 INT', '法師的魔法攻擊力，也會增加 MP 上限'], ['幸運 LUK', '盜賊的主要攻擊屬性，也會提升迴避']])}
  <p>每項屬性最高可以點到 <b>30,000</b>（手動與自動分配上限相同）。</p>
  <h2>各職業的主屬性</h2>
  ${table(['職業', '主屬性', '副屬性'], MAINSTAT.map(([j, a, b]) => [j, `<span class="stat-pill">${a}</span>`, b]))}
  <h2>自動分配</h2>
  <p>在能力值視窗按「自動分配」時，會把剩下的點數依 <b>主屬性 : 副屬性 = 4 : 1</b> 分配，除不盡的部分加到主屬性。例如 5 點會變成主屬性 +4、副屬性 +1；10 點會變成 +8 與 +2。</p>
  <h2>點 HP／MP</h2>
  <p>把能力點數加在 HP 或 MP 時，每點增加的量依職業不同（範圍內隨機）：</p>
  ${table(['職業', '#每點 HP', '#每點 MP'], [['初心者', '8～12', '6～8'], ['劍士系、聖魂劍士、惡魔殺手、煉獄巫師', '36～42', '6～9'], ['狂狼勇士', '38～42', '6～9'],
    ['法師系、龍魔導士', '10～20', '38～40'], ['烈焰巫師', '15～21', '38～40'], ['弓箭手系、盜賊系、破風使者、暗夜行者、精靈遊俠、狂豹獵人', '16～20', '10～12'],
    ['打手系、閃雷悍將（二轉後）', '28～32', '10～12'], ['海盜、槍手系、機甲戰神', '18～22', '10～12']])}
  <p class="note">HP／MP 加點總共最多 10,000 次，HP、MP 上限為 9,999,999。</p></div>`;
}

function notFound(what) { V.innerHTML = `<h1>找不到這個${what}</h1><p><a href="javascript:history.back()">回上一頁</a></p>`; }

// ---------- router ----------
const ROUTES = { items: viewItems, item: viewItem, mobs: viewMobs, mob: viewMob, maps: viewMaps, map: viewMap,
  quests: viewQuests, quest: viewQuest, jobs: viewJobs, job: viewJob, skills: viewSkills, skill: viewSkill, ap: viewAp };
const TAB_OF = { item: 'items', mob: 'mobs', map: 'maps', quest: 'quests', job: 'jobs', skill: 'skills' };
async function route(keepFocus) {
  const [name, arg] = (location.hash.slice(1) || 'items').split('/');
  const fn = ROUTES[name] || viewItems, tab = TAB_OF[name] || (ROUTES[name] ? name : 'items');
  document.querySelectorAll('#tabs a').forEach(a => a.classList.toggle('on', a.dataset.tab === tab));
  try {
    if (!N) N = await load('names');
    if (state[tab]) state[tab].focus = keepFocus === true;
    await fn(arg !== undefined ? +arg : undefined);
    const h = V.querySelector('h1'); document.title = (h ? h.textContent + '｜' : '') + '懷舊谷';
  } catch (e) { V.innerHTML = `<p class="empty">資料載入失敗，請重新整理頁面。（${esc(e.message)}）</p>`; }
}
addEventListener('hashchange', () => { route(); scrollTo(0, 0); });
route();
