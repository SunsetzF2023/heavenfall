/* ================= DOM =================
   微型 DOM 工具（h/btn/show）＋ 狀態列、卡牌元件、出牌動畫。
   $app 改為延遲取值，讓資料模組可以在無 DOM 環境（如 vitest）下被 import。
*/
import { B, G } from '../state.js';
import { CFG } from '../config.js';
import { CARDS, cname, costStr, stars } from '../cards/index.js';
import { SCHOOLS } from '../schools.js';
import { R } from '../utils.js';

const $app = () => document.getElementById('app');

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const k in (attrs || {})) {
    const val = attrs[k];
    if (k === 'onclick') el.onclick = val;
    else if (k === 'disabled') el.disabled = !!val;
    else if (k === 'cls') el.className = val;
    else el.setAttribute(k, val);
  }
  for (const kid of kids.flat()) { if (kid === null || kid === undefined || kid === false) continue; el.append(kid.nodeType ? kid : document.createTextNode(String(kid))); }
  return el;
}
export const btn = (label, fn, dis, cls) => h('button', { onclick: fn, disabled: dis, cls: cls || '' }, label);
export const para = (...t) => h('p', null, ...t);
export const say = t => h('div', { cls: 'say' }, t);
export function show(...nodes) { const app = $app(); app.innerHTML = ''; if (G) app.append(statusBar()); app.append(...nodes.flat(Infinity).filter(Boolean)); window.scrollTo(0, 0); }
export function statusBar() {
  const sk = G.school ? SCHOOLS[G.school].name : '未入流';
  return h('div', { cls: 'box bar' },
    h('span', null, `${G.name}（${sk}）Lv${G.level}`),
    h('span', { cls: 'hp' }, `生命 ${G.hp}/${G.maxHp}`),
    h('span', { cls: 'qi' }, `基礎真氣 ${G.baseQi}`),
    h('span', { cls: 'ap' }, `行動力 ${G.apMax}`),
    h('span', null, `手牌 ${G.handSize}`),
    h('span', { cls: 'gold' }, `銀兩 ${G.gold}`),
    h('span', null, `經驗 ${G.exp}/${CFG.expTable[G.level] ?? '滿'}`),
    h('span', null, `道心 ${G.dao}・武魄 ${G.wu}`),
    h('span', null, `兵器槽 ${G.equipped.length}/${G.equipSlots}`));
}
export function cardBox(ci, onclick, dis, prefix) {
  const d = CARDS[ci.id];
  return h('button', { cls: 'card', onclick, disabled: dis },
    h('div', { cls: 'n' }, (prefix || '') + cname(ci)),
    h('div', { cls: 't' }, `〔${d.type}${costStr(ci)}〕${stars(d)}`),
    h('div', null, d.text(ci.up)));
}

/* ---- 出牌動畫 ---- */
export const FX = { hold: 700, step: 1100 };
let $stage = null;
export function flashCard(ci, side, who, hidden) {
  if (!$stage) { $stage = document.createElement('div'); $stage.className = 'stage'; document.body.append($stage); }
  const d = CARDS[ci.id];
  const el = hidden
    ? h('div', { cls: 'fcard back ' + side }, h('div', { cls: 'who' }, who), h('div', { cls: 'n' }, '？？？'), h('div', { cls: 't' }, '〔反制・暗置〕'))
    : h('div', { cls: 'fcard ' + side }, h('div', { cls: 'who' }, who), h('div', { cls: 'n' }, cname(ci)),
      h('div', { cls: 't' }, `〔${d.type}${costStr(ci)}〕`), h('div', null, d.text(ci.up)));
  $stage.append(el);
  setTimeout(() => {
    el.className += ' ash';
    for (let i = 0; i < 26; i++) {
      el.append(h('span', { cls: 'ashp', style: `left:${R(100)}%;top:${R(100)}%;animation-delay:${R(250)}ms;--dx:${R(160) - 80}px;--dy:${-40 - R(120)}px` }));
    }
    setTimeout(() => el.remove(), 1100);
  }, FX.hold);
}
/* 延遲執行：只在本場戰鬥仍是敵方回合時才生效（換場/回合結束自動作廢） */
export function later(fn, ms) { const bt = B; setTimeout(() => { if (B === bt && B.phase === 'enemy') fn(); }, ms); }
