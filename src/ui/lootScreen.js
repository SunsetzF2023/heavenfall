/* ================= 戰利品盲盒 =================
   擊敗敵人後：敵人牌組的牌背飛進盒子 → 點擊開箱 →
   盒子搖晃發光爆炸 → 一張牌旋轉放大揭示真身（類皇室戰爭寶箱）。
   獎勵：敵人牌組中隨機一張。
*/
import { inst, pick, R } from '../utils.js';
import { B, G, render, setS } from '../state.js';
import { CARDS, cname, costStr } from '../cards/index.js';
import { btn, h, show } from './dom.js';
import { afterBattle } from '../engine/aftermath.js';

export function lootScreen() {
  const drop = pick(B.e.deck, 1)[0];
  const st = { phase: 'fly' };   // fly → ready → shake → boom → reveal
  const flies = B.e.deck.map(() => ({ sx: R(400) - 200, sy: R(240) - 120, delay: R(400) }));

  const finish = take => {
    if (take && drop) G.deck.push(inst(drop.id, drop.up));
    afterBattle();
  };
  const open = () => {
    if (st.phase !== 'ready') return;
    st.phase = 'shake'; render();
    setTimeout(() => {
      if (st.phase !== 'shake') return;
      st.phase = 'boom'; render();
      setTimeout(() => { st.phase = 'reveal'; render(); }, 450);
    }, 900);
  };

  setS(() => {
    const boxCls = { ready: 'lootbox ready', shake: 'lootbox shake', boom: 'lootbox boom' }[st.phase] || 'lootbox';
    const stage = h('div', { cls: 'lootstage' },
      st.phase === 'fly' ? flies.map(f => h('div', { cls: 'lootfly', style: `--sx:${f.sx}px;--sy:${f.sy}px;animation-delay:${f.delay}ms` })) : null,
      st.phase !== 'reveal' ? h('div', { cls: boxCls, onclick: st.phase === 'ready' ? open : null }, '箱') : null,
      st.phase === 'reveal' && drop ? h('div', { cls: 'fcard reveal' },
        h('div', { cls: 'who' }, '開出'),
        h('div', { cls: 'n' }, cname(drop)),
        h('div', { cls: 't' }, `〔${CARDS[drop.id].type}${costStr(drop)}〕`),
        h('div', null, CARDS[drop.id].text(drop.up))) : null);

    if (st.phase === 'fly' || st.phase === 'ready') {
      show(h('h2', null, '戰利品'),
        h('div', { cls: 'dim' }, `${B.def.name} 的牌散了一地，自己收進了一只箱子。`),
        stage,
        h('div', { cls: 'box' }, st.phase === 'ready'
          ? [btn('開箱', open), btn('不要了', () => finish(false))]
          : h('div', { cls: 'dim' }, '……')));
    } else if (st.phase === 'shake' || st.phase === 'boom') {
      show(h('h2', null, '戰利品'), stage);
    } else {
      show(h('h2', null, '開到'), stage,
        h('div', { cls: 'box' }, btn('收下', () => finish(true), !drop), btn('不要', () => finish(false))));
    }
  });
  render();
  setTimeout(() => { if (st.phase === 'fly') { st.phase = 'ready'; render(); } }, 1100);
}
