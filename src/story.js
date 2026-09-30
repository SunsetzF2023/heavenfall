/* ================= 劇情節點 =================
   標題 → 祝福 → 臨行前夜 → 地圖 → 武道大比（拜師）→ 首領 → 結局。
*/
import { inst, pick } from './utils.js';
import { G, render, setB, setG, setS } from './state.js';
import { CARDS, schoolPool, stars } from './cards/index.js';
import { SCHOOLS, SKILLS } from './schools.js';
import { btn, h, para, say, show } from './ui/dom.js';
import { addDao, addWu } from './engine/aftermath.js';
import { startBattle } from './engine/battle.js';
import { eventScreen } from './events.js';
import { deckScreen, mapScreen } from './map.js';
import { newGame } from './game.js';

export function titleScreen() {
  setG(null); setB(null);
  setS(() => show(h('h1', null, '天宗棄徒'), h('div', { cls: 'dim' }, '第一章 Demo（文字版）・規則仿《月圓之夜》・數值全部暫定'),
    say('父親臨終前只說了一句：「去天宗……替我問一句，為什麼。」'),
    say('他曾是天宗聖子，卻被廢去修為，丟在凡人界。二十年來，他再沒提過天宗兩個字。'),
    h('div', { cls: 'box' }, btn('林劍（兒子）', () => { newGame('林劍', 'm'); blessingScreen(); }), btn('林琴（女兒）', () => { newGame('林琴', 'f'); blessingScreen(); })),
    h('div', { cls: 'box dim' }, '快速體驗（跳過前面的旅途，直接到章末選流派、打首領）：',
      h('div', null, btn('快速：林劍', () => { newGame('林劍', 'm'); quickStart(); }), btn('快速：林琴', () => { newGame('林琴', 'f'); quickStart(); }))),
    h('div', { cls: 'box dim' }, rulesText())));
  render();
}
function rulesText() {
  return [h('div', null, '規則速記：'),
    h('div', null, '・每回合抽「手牌上限」張，回合結束手牌可保留到上限。除了手牌和被移除的牌，其餘每回合都洗回牌庫。'),
    h('div', null, '・武技不耗資源；身法耗行動力（每回合補到上限，多出的保留）；神通耗真氣（不會自動回，靠吐納累積）。'),
    h('div', null, '・反制牌打出後暗置，敵人打出武技時觸發。兵器戰前裝進兵器槽，不進牌庫；初始 0 槽。'),
    h('div', null, '・護甲在自己回合開始時清空（負山例外）。敵人跟你一樣有生命、真氣、行動力、牌組。'),
    h('div', null, '・擊敗敵人得經驗升級；卡牌從商店、包袱、升級、事件取得。')];
}
function blessingScreen() {
  const opts = pick([
    { t: '祖傳玉佩：生命上限 +6', f: () => { G.maxHp += 6; G.hp += 6; } },
    { t: '父親的手札：基礎真氣 +1', f: () => { G.baseQi += 1; } },
    { t: '私房錢：銀兩 +25', f: () => { G.gold += 25; } },
    { t: '舊扁擔：兵器槽 +1，獲得「扁擔」並裝上', f: () => { G.equipSlots += 1; const c = inst('biandan'); G.deck.push(c); G.equipped.push(c.uid); } },
    { t: '娘縫的護身符：升級 2 張起始牌', f: () => { pick(G.deck.filter(c => !c.up), 2).forEach(c => { c.up = true; }); } },
  ], 3);
  setS(() => show(h('h2', null, '出發前'), say('收拾行囊時，你找到了幾樣東西。只能帶走一樣。'), h('div', { cls: 'box' }, opts.map(o => btn(o.t, () => { o.f(); prologue(); })))));
  render();
}
function prologue() {
  eventScreen('臨行前夜', ['你要去找天宗的消息，一個晚上就傳遍了全村。', '娘坐在燈下縫衣服，針扎了三次手：「你爹就是出去了，才……」', '門外擠滿了人。有人說村外有吃人的妖怪，有人說求仙的都是騙子，還有人說：「這孩子是被他爹的瘋話害了。」'], [
    { t: '「娘，我會回來的。」（道心 +1）', f: () => { addDao(1); mapScreen(); } },
    { t: '「爹的事，我一定要問個明白。」（武魄 +1）', f: () => { addWu(1); mapScreen(); } },
  ]);
}
function quickStart() {
  G.stage = 'wild';
  G.level = 3; G.exp = 7; G.maxHp = 26; G.hp = 26; G.handSize = 4; G.gold = 30; G.baseQi = 2;
  ['feiti', 'zhamabu', 'shenhuxi'].forEach(id => G.deck.push(inst(id)));
  tournament();
}
export function tournament() {
  setS(() => show(h('h2', null, '武道大比'),
    say('鎮上搭起了擂台，橫幅寫著：「第一屆武道界新人大比——贏了進武道界，輸了回家種田」。'),
    say('台下有兩位師父在招徒弟。'),
    ['liuhen', 'fushan'].map(k => { const s = SCHOOLS[k];
      return h('div', { cls: 'box' }, h('h3', null, `${s.name}「${s.motto}」— 師父 ${s.master}`), say(s.masterSay),
        h('div', { cls: 'dim' }, `流派被動：${s.passive}`),
        h('div', { cls: 'dim' }, `入門牌：${s.starter.map(id => CARDS[id].name).join('、')}　技能：${SKILLS[k].map(x => `Lv${x.lv}【${x.name}】${x.text}`).join('；')}`),
        btn(`拜入${s.name}`, () => chooseSchool(k))); })));
  render();
}
function chooseSchool(k) {
  G.school = k;
  SCHOOLS[k].starter.forEach(id => G.deck.push(inst(id)));
  const s = SCHOOLS[k];
  const ids = pick(schoolPool(k).filter(id => CARDS[id].type !== '兵器' && !s.starter.includes(id) && CARDS[id].star <= 2), 3);
  eventScreen(`拜入${s.name}`, [`${s.master}：「好，今天起你就是${s.name}的人了。上台前，再挑一招。」`, `（已加入入門牌：${s.starter.map(id => CARDS[id].name).join('、')}）`],
    ids.map(id => ({ t: `【${CARDS[id].name}】${stars(CARDS[id])}〔${CARDS[id].type}〕${CARDS[id].text(false)}`, f: () => { G.deck.push(inst(id)); bossIntro(); } })));
}
function bossIntro() {
  eventScreen('決賽', ['一路打到決賽，對面站著一個赤膊大漢，胸口紋著「鐵柱」兩個字。', '「趙鐵柱，連續三屆擂台霸主。新人，拳頭就是道理。」'], [
    { t: '整理牌組／兵器', f: () => deckScreen(bossIntro) },
    { t: '上台！', f: () => startBattle('boss', ending) },
  ]);
}
function ending() {
  setS(() => show(h('h2', null, '第一章　完'),
    say('趙鐵柱躺在台上喘著粗氣：「你……不錯。去極武閣吧，那裡才是武道的頂點……」'),
    say('他頓了頓，壓低聲音：「不過……閣裡練到最深的那些人……已經不太像人了。」'),
    say('你握緊拳頭。父親的遺願，才剛開始。'),
    h('div', { cls: 'box' }, `本局：${SCHOOLS[G.school].name}・Lv${G.level}・牌組 ${G.deck.length} 張・道心 ${G.dao}・武魄 ${G.wu}・銀兩 ${G.gold}`),
    para('Demo 到此結束。第二章：極武閣（待製作）'), btn('再來一局', titleScreen)));
  render();
}
