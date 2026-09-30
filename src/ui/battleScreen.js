/* ================= 戰鬥畫面 ================= */
import { B, G, render } from '../state.js';
import { CARDS, cname, costStr } from '../cards/index.js';
import { SKILLS, SCHOOLS } from '../schools.js';
import { canPlay, equippedList } from '../engine/combat.js';
import { discard, endTurn, playerPlay, useBattleSkill } from '../engine/battle.js';
import { btn, cardBox, h, show } from './dom.js';

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
    if (u.st.apDown) s.push('下回合行動力-1');
    if (u.xihen) s.push('吸痕');
    return s.length ? '狀態：' + s.join('、') : '';
  };
  const unitLine = u => h('div', { cls: 'bar' },
    h('span', { cls: 'hp' }, `生命 ${u.hp}/${u.maxHp}`), h('span', { cls: 'arm' }, `護甲 ${u.armor}`),
    h('span', { cls: 'qi' }, `真氣 ${u.qi}`), h('span', { cls: 'ap' }, `行動力 ${u.ap}${u.isPlayer ? '' : '/' + u.apMax}`),
    h('span', { cls: 'hen' }, `痕 ${u.hen}/${u.henCap}`));
  const eBox = h('div', { cls: 'box' },
    h('h3', null, `${B.def.boss ? '【首領】' : B.def.elite ? '【精英】' : ''}${e.name}　Lv${B.def.lv}`), unitLine(e),
    h('div', { cls: 'dim' }, stTxt(e), e.traps.length ? `　暗置反制 ${e.traps.length} 張` : '', `　每回合抽 ${e.draw} 張`),
    btn(B.showEnemyDeck ? '收起敵人牌組' : '查看敵人牌組', () => { B.showEnemyDeck = !B.showEnemyDeck; render(); }),
    B.showEnemyDeck ? h('div', { cls: 'dim' }, e.deck.map(ci => `【${cname(ci)}】${CARDS[ci.id].type}${costStr(ci)}：${CARDS[ci.id].text(ci.up)}`).join('\n').split('\n').map(t => h('div', null, t))) : null);
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
  const logBox = h('div', { cls: 'box log' }, B.log.slice(-60).join('\n'));
  show(h('h2', null, '戰鬥'), eBox, pBox, handBox, ctrl, logBox);
  logBox.scrollTop = logBox.scrollHeight;
}
