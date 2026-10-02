/* ================= 戰鬥流程 =================
   回合推進：開戰 → 玩家回合 → 敵人回合（逐步出牌）→ 結算。
   敵人出牌用 setTimeout 逐步播放（later 會在 B 換場或 phase 改變時作廢）。
*/
import { inst, shuffle } from '../utils.js';
import { CFG } from '../config.js';
import { B, G, render, setB, setS } from '../state.js';
import { CARDS, cname, cost } from '../cards/index.js';
import { ENEMIES } from '../enemies.js';
import {
  addHen, applyDamage, armor, burnTick, canPlay, draw, equippedList, equipHook,
  heal, keepRatio, log, mkUnit, resolveCard, sweepHand, turnStartTick,
} from './combat.js';
import { flashCard, FX, later } from '../ui/dom.js';
import { renderBattle } from '../ui/battleScreen.js';
import { gameOver, winBattle } from './aftermath.js';

export function startBattle(key, onWin) {
  const d = ENEMIES[key];
  // 敵人隨主角等級動態成長：等級取兩者較高，差值換算血量/傷害/抽牌
  const sl = Math.max(0, G.level - d.lv);
  const hpBonus = sl * (d.boss ? 6 : d.elite ? 4 : 3);
  const drawBonus = (d.elite || d.boss) && sl >= 3 ? 1 : 0;
  const p = mkUnit({ name: G.name, isPlayer: true, maxHp: G.maxHp, hp: G.hp, apMax: G.apMax, qi: G.baseQi, passive: G.school });
  p.battleDeck = G.deck.filter(c => CARDS[c.id].type !== '兵器');
  const e = mkUnit({ name: d.name, maxHp: d.hp + hpBonus, hp: d.hp + hpBonus, apMax: d.ap, qi: d.qi, draw: d.draw + drawBonus, xihen: d.xihen });
  e.lv = d.lv + sl;
  e.deck = d.deck.map(id => inst(id));
  setB({ p, e, def: d, key, turn: 0, log: [], phase: 'player', onWin, stolen: 0 });
  log(`遭遇【${d.name}】（Lv${e.lv}）！`);
  if (sl > 0) {
    e.st.dmgScale = Math.floor(sl / 2);
    log(`對手也隨你的成長變強了（生命 +${hpBonus}${e.st.dmgScale ? `，傷害 +${e.st.dmgScale}` : ''}${drawBonus ? '，抽牌 +1' : ''}）`);
  }
  if (d.intro) log(typeof d.intro === 'function' ? d.intro() : d.intro);
  for (const { ci, d: ed } of equippedList()) {
    if (ed.eq.turnStart) ed.eq.turnStart(ci.up);
    if (ed.eq.battleStart) ed.eq.battleStart(ci.up);
    if (ed.eq.apMaxMod) p.apMax = Math.max(0, p.apMax + ed.eq.apMaxMod(ci.up));
  }
  if (G.pendingTuohen) { G.pendingTuohen = false; log('拓痕生效'); addHen(e, 2, p); }
  if (G.pendingTiegu) { G.pendingTiegu = false; log('鐵骨生效'); armor(p, 8); }
  playerTurnStart();
  setS(renderBattle); render();
}
function playerTurnStart() {
  const p = B.p; B.turn++;
  log(`—— 第 ${B.turn} 回合 ——`);
  turnStartTick(p);
  if (checkEnd()) return;
  if (B.turn > 1) {
    if (p.st.huishan) { p.st.huishan = 0; log('回山：護甲全部保留'); }
    else if (p.passive === 'fushan') { p.armor = Math.floor(p.armor * keepRatio()); if (p.armor) log(`山勢：保留 ${p.armor} 護甲`); }
    else p.armor = 0;
  }
  p.st.fanzhen = 0; p.st.atkCount = 0; p.st.ninghen = 0; p.st.wuhen = 0; p.st.dmgUp = 0;
  if (p.st.shanhun) armor(p, 4 * p.st.shanhun);
  if (B.turn > 1) equipHook('turnStart');
  p.ap = Math.max(p.ap, p.apMax);
  if (p.st.apDown) { p.ap = Math.max(0, p.ap - p.st.apDown); log(`你被牽制，行動力 -${p.st.apDown}`); p.st.apDown = 0; }
  const keep = new Set(p.hand.concat(p.removed, p.traps.map(t => t.card)).map(c => c.uid));
  p.pile = shuffle(p.battleDeck.filter(c => !keep.has(c.uid)));
  draw(p, G.handSize);
  B.phase = 'player';
}
export function playerPlay(i) {
  if (B.phase !== 'player') return;
  const p = B.p, ci = p.hand[i];
  if (!canPlay(p, B.e, ci)) return;
  const c = cost(CARDS[ci.id], ci.up);
  p.ap -= c.ap; p.qi -= c.qi; p.hand.splice(i, 1);
  log(`▶ 你打出【${cname(ci)}】`, ci);
  flashCard(ci, 'me', '你打出');
  resolveCard(p, B.e, ci);
  burnTick(p);
  if (CARDS[ci.id].exile) p.removed.push(ci);
  if (!checkEnd()) render();
}
function endPlayerTurn() {
  sweepHand(B.p);
  equipHook('turnEnd');
  if (!checkEnd()) enemyTurn();
}
export function endTurn() {
  if (B.phase !== 'player') return;
  if (B.p.hand.length > G.handSize) { B.phase = 'discard'; render(); return; }
  endPlayerTurn();
}
export function discard(i) {
  const ci = B.p.hand.splice(i, 1)[0]; log(`棄掉【${cname(ci)}】`, ci);
  if (B.p.hand.length <= G.handSize) endPlayerTurn(); else render();
}
const AI_ORDER = { '吐納': 0, '身法': 1, '神通': 1, '反制': 2, '雜念': 3, '武技': 4 };
function enemyTurn() {
  const e = B.e, p = B.p;
  B.phase = 'enemy';
  log(`—— ${e.name} 的回合 ——`);
  e.armor = 0; e.st.atkCount = 0; e.st.dmgUp = 0;
  turnStartTick(e);
  if (e.hp <= 0) { enemyEnd(); return; }
  if (e.xihen && e.hen > 0) { log('吸痕！'); heal(e, e.hen); }
  e.ap = Math.max(e.ap, e.apMax);
  if (e.st.apDown) { e.ap = Math.max(0, e.ap - e.st.apDown); log(`${e.name} 被牽制，行動力 -${e.st.apDown}`); e.st.apDown = 0; }
  const keep = new Set(e.hand.concat(e.removed, e.traps.map(t => t.card)).map(c => c.uid));
  e.pile = shuffle(e.deck.filter(c => !keep.has(c.uid)));
  draw(e, e.draw);
  render();
  later(enemyStep, FX.step / 2);
}
function enemyStep() {
  const e = B.e, p = B.p;
  if (e.hp <= 0 || p.hp <= 0) { enemyEnd(); return; }
  const ci = e.hand.slice()
    .sort((a, b) => AI_ORDER[CARDS[a.id].type] - AI_ORDER[CARDS[b.id].type])
    .find(x => canPlay(e, p, x));
  if (!ci) { enemyEnd(); return; }
  e.hand.splice(e.hand.indexOf(ci), 1);
  const c = cost(CARDS[ci.id], ci.up); e.ap -= c.ap; e.qi -= c.qi;
  const trap = CARDS[ci.id].type === '反制';
  log(`◀ ${e.name} 打出【${trap ? '？？？' : cname(ci)}】${trap ? '' : '：' + CARDS[ci.id].text(ci.up)}`, trap ? null : ci);
  flashCard(ci, 'foe', `${e.name} 打出`, trap);
  resolveCard(e, p, ci);
  if (CARDS[ci.id].exile) e.removed.push(ci);
  burnTick(e);
  render();
  later(e.hp > 0 && p.hp > 0 ? enemyStep : enemyEnd, FX.step);
}
function enemyEnd() {
  const e = B.e, p = B.p;
  sweepHand(e);
  if (e.hand.length > CFG.eHandMax) {
    e.hand.splice(0, e.hand.length - CFG.eHandMax);
    log(`${e.name} 手牌太多，默默丟掉了幾張`);
  }
  if (e.hp > 0 && e.st.henlie && e.hen > 0) { log('痕裂！'); applyDamage(null, e, e.st.henlie * e.hen, true); }
  if (checkEnd()) return;
  playerTurnStart();
  render();
}
export function checkEnd() {
  if (B.e.hp <= 0) { winBattle(); return true; }
  if (B.p.hp <= 0) { B.phase = 'over'; gameOver(); return true; }
  return false;
}
export function useBattleSkill(sk) {
  G.skillCd[sk.id] = sk.cd; log(`發動技能【${sk.name}】`); sk.use(); if (!checkEnd()) render();
}
