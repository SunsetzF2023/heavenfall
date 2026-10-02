/* ================= 戰鬥核心 =================
   無 DOM 依賴的規則層：資源增減、傷害結算、刻痕/爆痕、斬/崩、兵器掛鉤、
   出牌合法性與卡牌結算（含反制觸發）。
   狀態（u.st）：
     nextAtk/nextDouble/nextHen  下次攻擊增益
     ninghen/wuhen/shanhun/henlie/huishan/fanzhen/apDown  流派與控制
     silenced   下一張牌直接無效（震懾）
     poison     中毒：自己回合開始受 X 傷，層數 -1
     burn       燒傷：每使用一張牌受 X 穿刺傷，層數 -2
     doom       血光之災：自己回合開始 -1，歸零即死
     drawDown   下回合抽牌 -X（抽牌環節結算一次）
     drawDiscard 抽牌後隨機丟 1 張手牌（本場移除）
     dmgUp      本回合造成傷害 +X
     noDraw     （保留）
*/
import { R, inst } from '../utils.js';
import { CFG } from '../config.js';
import { B, G } from '../state.js';
import { CARDS, cname, cost } from '../cards/index.js';
import { flashCard } from '../ui/dom.js';

export function log(s, ci) { if (B) B.log.push({ s, r: ci ? [{ name: cname(ci), id: ci.id, up: !!ci.up }] : null }); }
export function mkUnit(o) { return Object.assign({ armor: 0, qi: 0, ap: 0, hen: 0, henCap: CFG.henCap, st: {}, traps: [], hand: [], pile: [], removed: [] }, o); }
export function armor(u, n) {
  if (n <= 0) return;
  const g = Math.min(n, Math.max(0, CFG.armorCap - u.armor));
  u.armor += g; log(`${u.name} 獲得 ${g} 護甲（${u.armor}）`);
  if (u.isPlayer && g) equipHook('onArmor', g);
}
export function junk(u, id, n) {
  for (let i = 0; i < n; i++) {
    const ci = inst(id);
    if (u.isPlayer) { u.battleDeck.push(ci); u.pile.splice(R(u.pile.length + 1), 0, ci); }
    else u.deck.push(ci);
  }
  log(`${u.isPlayer ? '你的' : u.name + '的'}牌庫被塞進 ${n} 張【${CARDS[id].name}】`, { id });
}
export function gainCard(u, id) {
  const ci = inst(id);
  if (u.isPlayer) { u.hand.push(ci); u.battleDeck.push(ci); log(`獲得【${cname(ci)}】入手`, ci); }
  else { u.deck.push(ci); log(`${u.name} 多了張【${cname(ci)}】`, ci); }
}
export function heal(u, n) { const b = u.hp; u.hp = Math.min(u.maxHp, u.hp + n); log(`${u.name} 回復 ${u.hp - b} 生命`); }
export function loseHp(u, n) { if (n <= 0) return; u.hp -= n; log(`${u.name} 失去 ${n} 生命`); }
export function gainQi(u, n) { u.qi += n; log(`${u.name} 真氣 +${n}（${u.qi}）`); }
export function gainAp(u, n) { u.ap += n; log(`${u.name} 行動力 +${n}（${u.ap}）`); }
export function draw(u, n) {
  if (u.st.drawDown) { n = Math.max(0, n - u.st.drawDown); u.st.drawDown = 0; }
  let k = 0; for (let i = 0; i < n && u.pile.length; i++) { u.hand.push(u.pile.pop()); k++; }
  if (k) log(u.isPlayer ? `抽 ${k} 張` : `${u.name} 抽了 ${k} 張（手牌 ${u.hand.length}）`);
  for (const ci of u.hand.slice(-k)) { const d = CARDS[ci.id]; if (d.onDraw) d.onDraw({ me: u, ci }); }
  if (u.st.drawDiscard && u.hand.length) {
    u.st.drawDiscard--;
    const i = R(u.hand.length), ci = u.hand.splice(i, 1)[0];
    u.removed.push(ci);
    log(`${u.isPlayer ? '你' : u.name} 手一抖，把【${cname(ci)}】弄丟了`, ci);
  }
}

/* 回合開始時的持續狀態結算（雙方通用）：毒・血光之災 */
export function turnStartTick(u) {
  if (u.st.poison) { log(`毒發！`); applyDamage(null, u, u.st.poison, true); u.st.poison--; }
  if (u.st.doom) {
    u.st.doom--;
    if (u.st.doom <= 0) { u.hp = 0; log(`血光之災降臨！${u.name} 氣絕`); }
    else log(`血光之災纏身：還剩 ${u.st.doom} 回合`);
  }
}
/* 每打一張牌後的燒傷結算 */
export function burnTick(u) {
  if (u.st.burn) { log(`燒傷發作！`); applyDamage(null, u, u.st.burn, true); u.st.burn = Math.max(0, u.st.burn - 2); }
}
/* 回合結束：手牌中標記 autoBurn 的牌直接移除（雜念） */
export function sweepHand(u) {
  const burn = u.hand.filter(ci => CARDS[ci.id].autoDiscard);
  if (!burn.length) return;
  u.hand = u.hand.filter(ci => !CARDS[ci.id].autoDiscard);
  u.removed.push(...burn);
  log(`${u.isPlayer ? '你' : u.name} 丟掉了 ${burn.map(ci => `【${cname(ci)}】`).join('、')}`, burn[0]);
}


export function applyDamage(src, tgt, d, pierce, mods) {
  mods = mods || {};
  let blocked = 0;
  if (!pierce && tgt.armor > 0) { blocked = Math.min(tgt.armor, d); tgt.armor -= blocked; d -= blocked; }
  tgt.hp -= d;
  log(`${tgt.name} 受到 ${d} 傷害${blocked ? `（護甲擋下 ${blocked}）` : ''}${pierce ? '（穿刺）' : ''}`);
  if (mods.reflect && blocked > 0 && src) { src.hp -= blocked; log(`回震！${src.name} 受到 ${blocked} 傷害`); }
  return d;
}
export function attack(src, tgt, base, o) {
  o = o || {};
  const hits = o.hits || 1, mods = o.mods || {};
  let bonus = (o.bonus || 0) + (src.st.dmgScale || 0), mult = 1;
  if (o.weapon) {
    if (src.st.nextAtk) { bonus += src.st.nextAtk; src.st.nextAtk = 0; }
    if (src.st.nextDouble) { mult = 2; src.st.nextDouble = 0; }
  }
  if (mods.armorFromDmg) armor(tgt, (base * hits + bonus) * mult);
  let total = 0;
  for (let i = 0; i < hits; i++) {
    if (tgt.hp <= 0 || src.hp <= 0) break;
    let d = (base + (i === 0 ? bonus : 0) + (src.st.dmgUp || 0)) * mult;
    if (mods.halve) d = Math.floor(d / 2);
    total += applyDamage(src, tgt, d, o.pierce, mods);
    if (tgt.st.fanzhen && o.weapon) { log(`反震！`); applyDamage(tgt, src, tgt.st.fanzhen, false); }
    if (o.weapon && src.passive === 'liuhen' && hits >= 2) addHen(tgt, 1, src);
    if (o.weapon && src.st.ninghen) addHen(tgt, 1, src);
  }
  return total;
}
export function addHen(t, n, src) {
  if (n <= 0 || t.hp <= 0) return;
  const ti = t.traps.findIndex(x => CARDS[x.card.id].trap.trigger === 'hen');
  if (ti >= 0 && src && src !== t) { flashCard(t.traps[ti].card, t.isPlayer ? 'me' : 'foe', `${t.name} 的反制觸發`); t.traps.splice(ti, 1); log(`【移痕】觸發！痕轉刻到 ${src.name} 身上`); t = src; }
  let add = 0;
  for (let i = 0; i < n && t.hp > 0; i++) {
    if (t.hen < t.henCap) { t.hen++; add++; continue; }
    if (add) log(`${t.name} 被刻下 ${add} 痕（${t.hen}/${t.henCap}）`);
    add = 0; t.hen = 0;
    log(`爆痕！${t.name} 身上的痕炸開`);
    applyDamage(null, t, t.henCap, true);
  }
  if (add) log(`${t.name} 被刻下 ${add} 痕（${t.hen}/${t.henCap}）`);
}
export function zhan(c, half) {
  const h = c.foe.hen;
  if (c.me.st.wuhen) log('無痕：痕未被清除');
  else c.foe.hen -= half ? Math.floor(h / 2) : h;
  log(`斬！引動 ${h} 痕`);
  if (c.me.isPlayer) equipHook('onZhan');
  return h;
}
export function beng(c) {
  const a = c.me.armor; c.me.armor = 0; log(`崩！消耗 ${a} 護甲`);
  if (c.me.isPlayer) equipHook('onBeng');
  return a;
}
export function equippedList() { return G.equipped.map(uid => G.deck.find(c => c.uid === uid)).filter(Boolean).map(ci => ({ ci, d: CARDS[ci.id] })); }
export function equipHook(k, ...args) { for (const { ci, d } of equippedList()) if (d.eq && d.eq[k]) d.eq[k](ci.up, ...args); }
export function equipSum(k) { let s = 0; for (const { ci, d } of equippedList()) if (d.eq && d.eq[k]) s += d.eq[k](ci.up); return s; }
export function keepRatio() { let r = 0.5; for (const { d } of equippedList()) if (d.eq && d.eq.keep) r = Math.max(r, d.eq.keep()); return r; }

export function canPlay(u, foe, ci) {
  const d = CARDS[ci.id], c = cost(d, ci.up);
  if (d.type === '兵器') return false;
  if (d.type !== '反制' && !d.play) return false;
  if (u.ap < c.ap || u.qi < c.qi) return false;
  if (d.req && !d.req({ me: u, foe, u: ci.up })) return false;
  return true;
}
export function resolveCard(me, foe, ci) {
  const d = CARDS[ci.id];
  if (me.st.silenced) { me.st.silenced = 0; log(`【${cname(ci)}】被震懾，直接作廢`, ci); return; }
  if (d.type === '反制') { me.traps.push({ card: ci }); log(me.isPlayer ? `你暗置了【${cname(ci)}】` : `${me.name} 暗置了一張反制牌`, ci); return; }
  let mods = {}, bonus = 0;
  const weapon = d.type === '武技';
  if (weapon) {
    me.st.atkCount = (me.st.atkCount || 0) + 1;
    const ti = foe.traps.findIndex(t => CARDS[t.card.id].trap.trigger === 'attack');
    if (ti >= 0) {
      const t = foe.traps.splice(ti, 1)[0];
      log(`${foe.name} 的反制【${cname(t.card)}】觸發！`, t.card);
      flashCard(t.card, foe.isPlayer ? 'me' : 'foe', `${foe.name} 的反制觸發`);
      mods = CARDS[t.card.id].trap.fire({ me: foe, foe: me, u: t.card.up }) || {};
    }
    if (mods.negate) { log(`【${cname(ci)}】被化解，無效`); return; }
    if (me.isPlayer && me.st.atkCount === 1) bonus += equipSum('firstAtkBonus');
  }
  const ctx = { me, foe, u: ci.up, ci,
    atk(base, o) { const r = attack(me, foe, base, Object.assign({ mods, bonus, weapon }, o || {})); mods = {}; bonus = 0; return r; } };
  d.play(ctx);
  if (weapon) {
    if (me.st.nextHen) { const n = me.st.nextHen; me.st.nextHen = 0; addHen(foe, n, me); }
    if (me.isPlayer && me.st.atkCount === 1) { const n = equipSum('firstAtkHen'); if (n) addHen(foe, n, me); }
    if (me.isPlayer) equipHook('onAtk', me.st.atkCount);
  }
  if (d.type === '身法' && me.isPlayer) equipHook('onShenfa');
}
