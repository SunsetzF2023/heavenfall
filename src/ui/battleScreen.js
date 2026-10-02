/* ================= 戰鬥畫面 ================= */
import { B, G } from '../state.js';
import { CARDS, cname } from '../cards/index.js';
import { SKILLS, SCHOOLS } from '../schools.js';
import { canPlay, equippedList } from '../engine/combat.js';
import { discard, endTurn, playerPlay, useBattleSkill } from '../engine/battle.js';
import { bindTip, btn, cardBox, h, show } from './dom.js';

/* 卡名 → id 索引（同名卡會記多個 id；日誌中有打出紀錄時優先用實際卡） */
const NAME2IDS = {};
for (const id in CARDS) (NAME2IDS[CARDS[id].name] = NAME2IDS[CARDS[id].name] || []).push(id);

function tipSpan(label, id, up) {
  const el = h('span', { cls: 'cref' }, label);
  bindTip(el, id, up);
  return el;
}
/* 日誌一行：【卡牌名】變成可懸浮查看的引用 */
function logLine(l) {
  const refs = (l && l.r) || [];
  return h('div', null, String(l ? l.s : l).split(/(【[^】]+】)/g).map(part => {
    const m = /^【(.+)】$/.exec(part);
    if (!m) return part;
    const inner = m[1], up = inner.endsWith('+'), nm = up ? inner.slice(0, -1) : inner;
    const ref = refs.find(r => r.name === inner);
    const id = ref ? ref.id : (NAME2IDS[nm] || [])[0];
    return id ? tipSpan(part, id, ref ? ref.up : up) : part;
  }));
}

export function renderBattle() {
  const { p, e } = B;
  const stTxt = u => {
    const s = [];
    if (u.st.nextAtk) s.push(`下次攻擊+${u.st.nextAtk}`);
    if (u.st.nextDouble) s.push('下次攻擊翻倍');
    if (u.st.nextHen) s.push(`下張武技多刻${u.st.nextHen}痕`);
    if (u.st.fanzhen) s.push(`反震${u.st.fanzhen}`);
    if (u.st.huishan) s.push('回山');
    if (u.st.wuhen) s.push('無痕');
    if (u.st.ninghen) s.push('凝痕');
    if (u.st.shanhun) s.push(`山魂×${u.st.shanhun}`);
    if (u.st.henlie) s.push(`痕裂×${u.st.henlie}`);
    if (u.st.apDown) s.push(`下回合行動力-${u.st.apDown}`);
    if (u.st.drawDown) s.push(`下回合少抽${u.st.drawDown}張`);
    if (u.st.drawDiscard) s.push('抽牌時會丟牌');
    if (u.st.poison) s.push(`中毒${u.st.poison}`);
    if (u.st.burn) s.push(`燒傷${u.st.burn}`);
    if (u.st.doom) s.push(`血光之災${u.st.doom}回合`);
    if (u.st.delayed) s.push(`天音${u.st.delayed.t}回合後爆發${u.st.delayed.d}傷`);
    if (u.st.qiRegen) s.push(`周天：回合始真氣+${u.st.qiRegen[0]}×${u.st.qiRegen[1]}`);
    if (u.st.echo) s.push('迴響');
    if (u.st.silenced) s.push('下一張牌被震懾');
    if (u.st.dmgUp) s.push(`傷害+${u.st.dmgUp}`);
    if (u.xihen) s.push('吸痕');
    return s.length ? '狀態：' + s.join('、') : '';
  };
  const unitLine = u => h('div', { cls: 'bar' },
    h('span', { cls: 'hp' }, `生命 ${u.hp}/${u.maxHp}`), h('span', { cls: 'arm' }, `護甲 ${u.armor}`),
    h('span', { cls: 'qi' }, `真氣 ${u.qi}`), h('span', { cls: 'ap' }, `行動力 ${u.ap}${u.isPlayer ? '' : '/' + u.apMax}`),
    h('span', { cls: 'hen' }, `痕 ${u.hen}/${u.henCap}`));
  const eBox = h('div', { cls: 'box' },
    h('h3', null, `${B.def.boss ? '【首領】' : B.def.elite ? '【精英】' : ''}${e.name}　Lv${e.lv}`), unitLine(e),
    h('div', { cls: 'dim' }, stTxt(e), e.traps.length ? `　暗置反制 ${e.traps.length} 張` : '', `　每回合抽 ${e.draw} 張`,
      '　手牌 ', e.hand.length ? e.hand.map(() => h('span', { cls: 'hback' })) : '無'));
  const eqNames = equippedList().map(x => cname(x.ci)).join('、');
  const pBox = h('div', { cls: 'box' },
    h('h3', null, `${p.name}${G.school ? '・' + SCHOOLS[G.school].name : ''}`), unitLine(p),
    h('div', { cls: 'dim' }, stTxt(p), p.traps.length ? `　已暗置：${p.traps.map(t => cname(t.card)).join('、')}` : '', eqNames ? `　兵器：${eqNames}` : ''));
  let handBox;
  if (B.phase === 'discard') {
    handBox = h('div', { cls: 'box' }, h('div', null, `手牌超過上限 ${G.handSize}，點選要棄掉的牌（還要棄 ${p.hand.length - G.handSize} 張）：`),
      p.hand.map((ci, i) => cardBox(ci, () => discard(i), false, '棄掉 ')));
  } else {
    handBox = h('div', { cls: 'box' }, h('div', null, `手牌（上限 ${G.handSize}）`),
      p.hand.map((ci, i) => cardBox(ci, () => playerPlay(i), !canPlay(p, e, ci))));
  }
  const skills = (G.school ? SKILLS[G.school] : []).filter(s => s.where === 'battle' && G.level >= s.lv);
  const ctrl = h('div', { cls: 'box' },
    btn(B.phase === 'enemy' ? '對方出牌中…' : '結束回合', endTurn, B.phase !== 'player'),
    skills.map(s => btn(`技能・${s.name}（${s.text}）${G.skillCd[s.id] ? `［冷卻 ${G.skillCd[s.id]} 場］` : ''}`, () => useBattleSkill(s), !!G.skillCd[s.id] || B.phase !== 'player')),
    h('span', { cls: 'dim' }, `　牌庫剩 ${p.pile.length} 張・本場移除 ${p.removed.length} 張`));
  const logBox = h('div', { cls: 'box log' }, B.log.slice(-60).map(logLine));
  show(h('h2', null, '戰鬥'), eBox, pBox, handBox, ctrl, logBox);
  logBox.scrollTop = logBox.scrollHeight;
}
