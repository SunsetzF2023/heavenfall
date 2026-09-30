/* ================= 戰後 =================
   勝利結算、升級、戰敗、道心/武魄累積。
*/
import { inst, pick, R } from '../utils.js';
import { CFG } from '../config.js';
import { addNotice, B, G, render, setNotice, setS } from '../state.js';
import { CARDS, cardPool, cname } from '../cards/index.js';
import { SKILLS } from '../schools.js';
import { btn, h, para, show } from '../ui/dom.js';
import { EVENTS } from '../events.js';
import { titleScreen } from '../story.js';

export function winBattle() {
  B.phase = 'over';
  const d = B.def;
  G.hp = Math.max(1, B.p.hp);
  const gold = d.gold[0] + R(d.gold[1] - d.gold[0] + 1);
  G.gold += gold; G.exp += d.exp;
  for (const k in G.skillCd) if (G.skillCd[k] > 0) G.skillCd[k]--;
  G.flags['beat_' + B.key] = true;
  setS(() => show(h('h2', null, `擊敗了 ${d.name}！`), h('div', { cls: 'box log' }, B.log.slice(-8).join('\n')),
    para(`獲得經驗 ${d.exp}、銀兩 ${gold}。`), btn('繼續', afterBattle)));
  render();
}
export function afterBattle() {
  if (G.level < CFG.expTable.length && G.exp >= CFG.expTable[G.level]) return levelUp();
  if (B.def.after && !B.afterDone) { B.afterDone = true; return EVENTS[B.def.after](); }
  B.onWin();
}
function levelUp() {
  G.level++; G.maxHp += 3; G.hp = G.maxHp;
  if (G.level === 3) G.handSize = 4;
  const opts = pick([
    { t: '生命上限 +6', f: () => { G.maxHp += 6; G.hp += 6; } },
    { t: '基礎真氣 +1', f: () => { G.baseQi += 1; } },
    { t: '行動力上限 +1', f: () => { G.apMax += 1; } },
    { t: '兵器槽 +1', f: () => { G.equipSlots += 1; } },
    { t: '獲得一張隨機卡牌', f: () => { const id = pick(cardPool(), 1)[0]; G.deck.push(inst(id)); setNotice(`獲得【${CARDS[id].name}】`); } },
  ], 2);
  const newSk = (G.school ? SKILLS[G.school] : []).find(s => s.lv === G.level);
  setS(() => show(h('h2', null, `升級！Lv${G.level}`),
    para(`生命上限 +3，生命回滿。${G.level === 3 ? '手牌上限 +1（4 張）。' : ''}${newSk ? `習得技能【${newSk.name}】。` : ''}`),
    para('選擇一項獎勵：'), opts.map(o => btn(o.t, () => { o.f(); afterBattle(); }))));
  render();
}
export function gameOver() {
  setS(() => show(h('h2', null, '你倒下了'), h('div', { cls: 'box log' }, B.log.slice(-10).join('\n')),
    para(`${G.name} 在第一章走了 ${G.pagesDone} 頁。父親的遺願……還沒完成。`), btn('重新開始', titleScreen)));
  render();
}
export function addDao(n) { G.dao += n; if (G.dao >= 4 && !G.daoRw) { G.daoRw = true; G.gold += 15; addNotice('　道心達 4：鄉親們湊了 15 銀兩給你當盤纏。'); } }
export function addWu(n) { G.wu += n; if (G.wu >= 4 && !G.wuRw) { G.wuRw = true; G.maxHp += 4; G.hp += 4; addNotice('　武魄達 4：一身煞氣，生命上限 +4。'); } }
