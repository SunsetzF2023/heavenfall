/* ================= 事件 =================
   戰後劇情事件（敵人的 after 事件）。通用事件畫面 + 選項。
*/
import { B, G, hero, render, setNotice, setS } from './state.js';
import { inst, pick } from './utils.js';
import { CARDS, cardPool, cname } from './cards/index.js';
import { btn, h, say, show } from './ui/dom.js';
import { addDao, addWu, afterBattle } from './engine/aftermath.js';

export function eventScreen(title, lines, options) {
  setS(() => show(h('h2', null, title), lines.map(say), h('div', { cls: 'box' }, options.map(o => btn(o.t, o.f, o.dis)))));
  render();
}
export const EVENTS = {
  dazui: () => eventScreen('李大嘴', ['李大嘴捂著腫起來的嘴：「我……我也是為你好！村外真的危險！」', '圍觀的村民小聲嘀咕：「這孩子，跟他爹一個倔脾氣。」'], [
    { t: '「謝謝關心，但我還是要走。」（道心 +1）', f: () => { addDao(1); afterBattle(); } },
    { t: '「再嚼舌根，下次打的就不是嘴了。」（武魄 +1，銀兩 +4）', f: () => { addWu(1); G.gold += 4; afterBattle(); } },
  ]),
  liubanxian: () => eventScreen('劉半仙', ['「別打了！我說實話，我連自己明天吃什麼都算不出來……」'], [
    { t: '逼他把騙村民的卦金吐出來還回去（道心 +1）', f: () => { addDao(1); afterBattle(); } },
    { t: '讓他給你「開光」（武魄 +1，隨機升級 1 張牌）', f: () => { addWu(1); const c = pick(G.deck.filter(x => !x.up), 1)[0]; if (c) { c.up = true; setNotice(`開光……好像真有點用：【${cname(c)}】升級了`); } afterBattle(); } },
  ]),
  huangmao: () => eventScreen('黃毛阿杰', ['阿杰甩了甩頭髮：「大哥！收我當小弟吧！以後這片你說了算！」'], [
    { t: '勸他回家好好讀書（道心 +1，他塞給你 5 銀兩）', f: () => { addDao(1); G.gold += 5; afterBattle(); } },
    { t: '讓他教你那套搖（武魄 +1，學會「社會搖」）', f: () => { addWu(1); G.deck.push(inst('shehuiyao')); afterBattle(); } },
  ]),
  xiaokun: () => eventScreen('小坤子', ['小坤子抱著籃球坐在地上：「你……你打球也挺厲害的。」', '「其實我也想出村，去外面當大明星。可是大家都說我不務正業。」'], [
    { t: '陪他打一場三分球（道心 +1，學會「運球」）', f: () => { addDao(1); G.deck.push(inst('yunqiu')); afterBattle(); } },
    { t: '沒收他的籃球（武魄 +1，獲得兵器「籃球」）', f: () => { addWu(1); G.deck.push(inst('lanqiu')); afterBattle(); } },
  ]),
  wangsan: () => eventScreen('王三求饒', [`王三跪在地上：「${hero()}饒命！我上有八十歲老母……下有……下有一隻貓！」`], [
    { t: `饒他一命，讓他把錢吐出來（道心 +1，拿回被偷的 ${B.stolen} 銀兩，另 +3）`, f: () => { addDao(1); G.gold += B.stolen + 3; afterBattle(); } },
    { t: '搜刮一番（武魄 +1，銀兩 +8，學會「潑皮手段」）', f: () => { addWu(1); G.gold += 8 + B.stolen; G.deck.push(inst('popi')); afterBattle(); } },
  ]),
  qingxu: () => eventScreen('假道士', ['「別打了別打了！貧道……不，小的叫王二狗，是王三他堂哥。」', '他懷裡掉出一本《如來神掌》，翻開一看，是《母豬的產後護理》。'], [
    { t: '把騙來的錢還給村民（道心 +1）', f: () => { addDao(1); afterBattle(); } },
    { t: '逼他交出真貨（武魄 +1，獲得一張隨機 ★★ 卡牌）', f: () => { addWu(1); const pool = cardPool().filter(k => CARDS[k].star === 2); const id = pick(pool, 1)[0]; G.deck.push(inst(id)); setNotice(`書的最後一頁竟然是真的：獲得【${CARDS[id].name}】`); afterBattle(); } },
  ]),
};
