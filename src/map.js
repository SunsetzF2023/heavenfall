/* ================= 地圖（旅途頁） =================
   仿月圓的書頁地圖：每次翻 3 頁選 1；「村口」「武道大比」為 sticky 頁，
   出現後留在桌上可隨時選。書頁的 go(done) 完成後呼叫 done() 翻下一頁。
*/
import { inst, pick, R, shuffle } from './utils.js';
import { CFG } from './config.js';
import { addNotice, G, hero, notice, render, setNotice, setS } from './state.js';
import { CARDS, cardPool, cname, stars } from './cards/index.js';
import { SKILLS } from './schools.js';
import { btn, cardBox, h, para, say, show } from './ui/dom.js';
import { startBattle } from './engine/battle.js';
import { addDao, addWu } from './engine/aftermath.js';
import { eventScreen } from './events.js';
import { tournament } from './story.js';

export const PAGES = {
  dog: { name: '野狗', kind: '戰鬥', desc: '一條瘦狗齜著牙擋路。', go: done => startBattle('dog', done) },
  wangsan: { name: '流氓王三', kind: '戰鬥', desc: '村口的地痞，專收「過路費」。', go: done => startBattle('wangsan', done) },
  dazui: { name: '李大嘴', kind: '戰鬥', desc: '村口情報站站長，什麼閒話都傳。', go: done => startBattle('dazui', done) },
  liubanxian: { name: '劉半仙', kind: '戰鬥', desc: '在村口擺攤算命的神棍。', go: done => startBattle('liubanxian', done) },
  huangmao: { name: '黃毛阿杰', kind: '戰鬥', desc: '頂著一頭黃毛、褲腳捲起來的精神小伙。', go: done => startBattle('huangmao', done) },
  xiaokun: { name: '小坤子', kind: '戰鬥', desc: '穿背帶褲、在曬穀場打籃球的少年。', go: done => startBattle('xiaokun', done) },
  boar: { name: '野豬', kind: '戰鬥', desc: '林子裡傳來哼哼聲。', go: done => startBattle('boar', done) },
  wolf: { name: '山狼', kind: '戰鬥', desc: '遠處有狼嚎。', go: done => startBattle('wolf', done) },
  snake: { name: '竹葉青', kind: '戰鬥', desc: '草叢裡有東西在動。', go: done => startBattle('snake', done) },
  monkey: { name: '野猴子', kind: '戰鬥', desc: '樹上有雙眼睛盯著你的錢袋。', go: done => startBattle('monkey', done) },
  wangshen: { name: '隔壁王嬸', kind: '人物', desc: '拎著一籃雞蛋追出來的王嬸。', go: done => eventScreen('隔壁王嬸', [`「${hero()}，真要走啊？你娘昨晚哭了一宿。」`, '「外面的人心比狼還壞，你聽嬸一句，留下來吧。」'], [
    { t: '收下她的心意，答應一定會回來（道心 +1，獲得「燒餅」）', f: () => { addDao(1); G.deck.push(inst('shaobing')); done(); } },
    { t: '「嬸，我爹的事，總要有人去問。」（武魄 +1，生命上限 +3）', f: () => { addWu(1); G.maxHp += 3; G.hp += 3; done(); } },
  ]) },
  bandit: { name: '山賊', kind: '戰鬥', desc: '扛著大刀的壯漢。', go: done => startBattle('bandit', done) },
  qingxu: { name: '清虛道長', kind: '戰鬥', desc: '路邊擺攤賣「仙法秘笈」的道士。', go: done => startBattle('qingxu', done) },
  goose: { name: '村口大鵝', kind: '精英', desc: '全村最強。', go: done => startBattle('goose', done) },
  wangda: { name: '村霸 王大', kind: '精英', desc: '王三他哥，村裡沒人敢惹。', go: done => startBattle('wangda', done) },
  tiger: { name: '吊睛白額虎', kind: '精英', desc: '山崗上立著一塊告示牌。', go: done => startBattle('tiger', done) },
  erdangjia: { name: '黑風寨二當家', kind: '精英', desc: '路邊插著一面黑風寨的旗子。', go: done => startBattle('erdangjia', done) },
  gate: { name: '村口', kind: '劇情', desc: '村民都在村口等你。選了就出村（必打村口大鵝），村裡剩下的書頁不再回來。', sticky: true, go: () => { G.pagesDone++; villageGate(); } },
  finale: { name: '武道大比', kind: '首領', desc: '擂台霸主 趙鐵柱。選了就去大比：拜師選流派、打首領，打完第一章結束。', sticky: true, go: () => { G.pagesDone++; tournament(); } },
  zhang: { name: '賣包子的張大哥', kind: '人物', desc: '熱氣騰騰的包子攤。', go: done => {
    const free = G.flags.beat_wangsan;
    eventScreen('賣包子的張大哥', [free ? `「${hero()}！聽說你把王三那潑皮收拾了？這籠包子算我的！」` : `「${hero()}要去求仙？仙人哪有包子實在，來一籠？」`], [
      { t: free ? '收下包子（回復 4 生命）' : '買一籠肉包（5 銀兩，回復 4 生命）', dis: !free && G.gold < 5, f: () => { if (!free) G.gold -= 5; G.hp = Math.min(G.maxHp, G.hp + 4); done(); } },
      { t: '幫他看半天攤（道心 +1，獲得「熱包子」）', f: () => { addDao(1); G.deck.push(inst('baozi')); done(); } },
      { t: '離開', f: done },
    ]);
  } },
  cunzhang: { name: '村長爺爺', kind: '人物', desc: '在樹下搖扇子的老人。', go: done => eventScreen('村長爺爺', [
    '「仙人？村裡上次見到仙人，還是我爺爺的爺爺那輩……」', '「往東走有個地方叫武道界，那邊的人不修仙，改練拳頭了。聽說練得最好的，都進了什麼……極武閣。」'], [
    { t: '聽他講古（道心 +1，獲得「村長的叮囑」）', f: () => { addDao(1); G.deck.push(inst('cz_card')); done(); } },
    { t: '問他借點盤纏（武魄 +1，銀兩 +12）', f: () => { addWu(1); G.gold += 12; done(); } },
    { t: '離開', f: done },
  ]) },
  peddler: { name: '遊方貨郎', kind: '商店', desc: '什麼都賣，什麼都不保真。', go: done => shopScreen(done) },
  teahouse: { name: '老茶館', kind: '設施', desc: '說書先生能幫你「忘掉」一招（刪卡）。', go: done => pickCardScreen('老茶館・刪卡', `刪除一張牌（${G.delCount ? `${G.delCount * 10} 銀兩` : '第一次免費'}）`, () => G.deck, G.delCount * 10, ci => { G.gold -= G.delCount * 10; G.delCount++; if (G.equipped.includes(ci.uid)) G.equipped = G.equipped.filter(x => x !== ci.uid); G.deck = G.deck.filter(c => c !== ci); setNotice(`刪除了【${cname(ci)}】`); }, done) },
  smith: { name: '鐵匠鋪', kind: '設施', desc: '老鐵匠能幫你把一招練得更純熟（升級卡）。', go: done => pickCardScreen('鐵匠鋪・升級', `升級一張牌（${G.smithCount ? `${G.smithCount * 5} 銀兩` : '第一次免費'}）`, () => G.deck.filter(c => !c.up), G.smithCount * 5, ci => { G.gold -= G.smithCount * 5; G.smithCount++; ci.up = true; setNotice(`升級了【${cname(ci)}】`); }, done) },
  spring: { name: '山泉', kind: '設施', desc: '清涼的泉水。', go: done => eventScreen('山泉', ['泉水清冽，喝一口神清氣爽。'], [{ t: '喝幾口（回復 3 生命）', f: () => { G.hp = Math.min(G.maxHp, G.hp + 3); done(); } }, { t: '離開', f: done }]) },
  medicine: { name: '金瘡藥', kind: '寶物', desc: '路邊撿到的藥。', go: done => eventScreen('金瘡藥', ['一瓶沒開封的金瘡藥。'], [{ t: '用掉（回復 5 生命）', f: () => { G.hp = Math.min(G.maxHp, G.hp + 5); done(); } }, { t: '離開', f: done }]) },
  bundle: { name: '包袱', kind: '寶物', desc: '不知誰落下的包袱。', go: done => {
    const ids = pick(cardPool(), 3);
    eventScreen('包袱', ['裡面有幾本手抄的拳譜。'], ids.map(id => ({ t: `【${CARDS[id].name}】${stars(CARDS[id])}〔${CARDS[id].type}〕${CARDS[id].text(false)}`, f: () => { G.deck.push(inst(id)); done(); } })).concat([{ t: '都不要，拿走裡面的 6 銀兩', f: () => { G.gold += 6; done(); } }]));
  } },
  fork: { name: '岔路', kind: '岔路', desc: '把其他兩條路洗回去，重新抽 3 條。', fork: true },
  fortune: { name: '奇遇', kind: '奇遇', desc: '樹下有個打瞌睡的白鬍子老頭。', go: done => eventScreen('奇遇', ['「年輕人，我看你印堂……挺亮的。送你一樣東西吧。」'], [
    { t: '生命上限 +6', f: () => { G.maxHp += 6; G.hp += 6; done(); } },
    { t: '基礎真氣 +1', f: () => { G.baseQi += 1; done(); } },
    { t: '兵器槽 +1', f: () => { G.equipSlots += 1; done(); } },
  ]) },
};
export function withSticky(deck, key, minFlips) {
  deck.splice(R(Math.max(1, deck.length - minFlips + 1)), 0, key);
  return deck;
}
export function completePage(idx) {
  G.pagesDone++;
  G.pageShown[idx] = G.pageDeck.length ? G.pageDeck.pop() : null;
  mapScreen();
}
export function takeFork(idx) {
  G.pagesDone++;
  const keep = G.pageShown.map((k, i) => (i !== idx && k && PAGES[k].sticky ? k : null));
  const others = G.pageShown.filter((k, i) => i !== idx && k && !PAGES[k].sticky);
  G.pageDeck = shuffle(G.pageDeck.concat(others));
  G.pageShown = keep.map(k => k || (G.pageDeck.length ? G.pageDeck.pop() : null));
  setNotice('你換了一條路。');
  mapScreen();
}
export function villageGate() {
  eventScreen('村口', ['你背著包袱走到村口，身後跟了半個村子的人。', '村長爺爺拄著拐杖：「真要走？村外有狼、有山賊，前年李家二小子出去，回來就剩一隻鞋了。」', '張大哥塞給你一袋包子：「外頭的包子，沒我的好吃。」', '話還沒說完，一聲鵝叫劃破長空——村口大鵝張開翅膀，擋住了唯一的出路。'], [
    { t: '想出村，先過大鵝這關！', f: () => startBattle('goose', leaveVillage) },
  ]);
}
export function leaveVillage() {
  G.stage = 'wild';
  G.pageDeck = withSticky(shuffle(['dog', 'dog', 'boar', 'boar', 'wolf', 'wolf', 'snake', 'snake', 'monkey', 'monkey', 'bandit', 'bandit', 'qingxu', 'tiger', 'erdangjia',
    'peddler', 'peddler', 'teahouse', 'smith', 'smith', 'spring', 'spring', 'medicine', 'bundle', 'bundle', 'fork', 'fortune']), 'finale', 6);
  G.pageShown = [0, 1, 2].map(() => G.pageDeck.pop());
  setNotice('大鵝讓開了路。你回頭看了一眼村子，踏上了村外的土路。');
  mapScreen();
}
export function mapScreen() {
  const village = G.stage === 'village';
  const mapSkills = (G.school ? SKILLS[G.school] : []).filter(s => s.where === 'map' && G.level >= s.lv);
  setS(() => {
    const pages = G.pageShown.map((k, i) => k ? h('button', { cls: 'page', onclick: () => (PAGES[k].fork ? takeFork(i) : PAGES[k].go(() => completePage(i))) },
        h('div', { cls: 'n' }, `【${PAGES[k].kind}】${PAGES[k].name}`), h('div', { cls: 'dim' }, PAGES[k].desc)) : null);
    show(h('h2', null, `第一章　凡人界・求仙　—　${village ? '林家村' : '村外'}`),
      h('div', { cls: 'dim' }, `已走 ${G.pagesDone} 頁　${village ? '林家村' : '村外'}還剩 ${G.pageDeck.length + G.pageShown.filter(k => k).length} 頁　${village ? '「村口」' : '「武道大比」'}一出現就能選，也可以先把其他書頁走完`),
      notice ? h('div', { cls: 'box' }, notice) : null,
      h('div', { cls: 'box' }, h('div', null, '選一頁前進：'), pages),
      h('div', { cls: 'box' }, btn('查看牌組／裝備兵器', () => deckScreen(mapScreen)),
        mapSkills.map(s => btn(`技能・${s.name}（${s.text}）${G.skillCd[s.id] ? `［冷卻 ${G.skillCd[s.id]} 場］` : ''}`, () => { G.skillCd[s.id] = s.cd; s.use(); setNotice(`發動【${s.name}】`); mapScreen(); }, !!G.skillCd[s.id]))));
    setNotice('');
  });
  render();
}
export function deckScreen(back) {
  setS(() => {
    const eqs = G.deck.filter(c => CARDS[c.id].type === '兵器');
    const rest = G.deck.filter(c => CARDS[c.id].type !== '兵器');
    show(h('h2', null, `牌組（${rest.length} 張）`),
      h('div', { cls: 'box' }, rest.map(ci => cardBox(ci, null, false))),
      h('h3', null, `兵器（槽位 ${G.equipped.length}/${G.equipSlots}，點擊裝上／卸下；兵器不會進牌庫）`),
      h('div', { cls: 'box' }, eqs.length ? eqs.map(ci => { const on = G.equipped.includes(ci.uid);
        return cardBox(ci, () => { if (on) G.equipped = G.equipped.filter(x => x !== ci.uid); else if (G.equipped.length < G.equipSlots) G.equipped.push(ci.uid); render(); }, !on && G.equipped.length >= G.equipSlots, on ? '［已裝］' : ''); }) : '（沒有兵器）'),
      btn('返回', back));
  });
  render();
}
export function pickCardScreen(title, desc, listFn, price, apply, done) {
  setS(() => show(h('h2', null, title), para(desc),
    h('div', { cls: 'box' }, listFn().map(ci => cardBox(ci, () => { apply(ci); done(); }, G.gold < price))),
    btn('離開', done)));
  render();
}
export function shopScreen(done) {
  const stock = pick(cardPool(), 3).map(id => ({ id, sold: false }));
  setS(() => show(h('h2', null, '遊方貨郎'), say('「走過路過不要錯過！正宗少林……呃，正宗拳譜！」'),
    h('div', { cls: 'box' }, stock.map(s => { const p = CFG.price[CARDS[s.id].star];
      return cardBox(inst(s.id), () => { G.gold -= p; s.sold = true; G.deck.push(inst(s.id)); render(); }, s.sold || G.gold < p, s.sold ? '［已售］' : `${p}兩・`); })),
    btn('離開', done)));
  render();
}
