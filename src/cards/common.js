/* ================= 卡牌：凡人卡組・通用・雜念・兵器 =================
   type：武技(不耗資源) 身法(耗行動力) 神通(耗真氣) 吐納(補真氣) 反制(暗置) 兵器(裝備) 雜念(敵人塞的廢牌)
   ap/qi：消耗；apU/qiU：升級後消耗
   同名卡以「卡牌新增工作表」使用者版本為準（格擋/飛踢/連環拳/潑皮手段等已覆蓋舊版）
*/
import { v, R } from '../utils.js';
import { B, G } from '../state.js';
import { armor, attack, draw, gainCard, gainQi, gainAp, heal, junk, log, loseHp } from '../engine/combat.js';
import { CARDS, cname } from './index.js';

export const COMMON_CARDS = {
  // ---- 凡人卡組 ----
  quanjiao: { name: '拳腳', type: '武技', star: 1, text: u => `造成 ${v(u, 2, 3)} 傷害`, play: c => c.atk(v(c.u, 2, 3)) },
  gedang: { name: '格擋', type: '身法', star: 1, ap: 1, text: u => `獲得 ${v(u, 3, 4)} 護甲`, play: c => armor(c.me, v(c.u, 3, 4)) },
  tuna: { name: '吐納', type: '吐納', star: 1, text: u => `真氣 +${v(u, 2, 3)}`, play: c => gainQi(c.me, v(c.u, 2, 3)) },
  qijin: { name: '氣勁', type: '神通', star: 1, qi: 2, text: u => `造成 ${v(u, 7, 9)} 傷害；打出時真氣 ≥4 則改為穿刺`, play: c => c.atk(v(c.u, 7, 9), { pierce: c.me.qi >= 4 }) },
  manjin: { name: '蠻勁', type: '神通', star: 1, qi: 1, text: u => `造成 ${v(u, 6, 8)} 傷害`, play: c => c.atk(v(c.u, 6, 8)) },
  // ---- 通用（商店/寶物/升級/盲盒） ----
  feiti: { name: '飛踢', type: '武技', star: 1, text: u => `造成 ${v(u, 3, 5)} 傷害，對手下回合少抽 1 張`, play: c => { c.atk(v(c.u, 3, 5)); c.foe.st.drawDown = (c.foe.st.drawDown || 0) + 1; } },
  lianhuan: { name: '連環拳', type: '武技', star: 1, text: u => `造成 ${v(u, 1, 2)} 傷害 ×3`, play: c => c.atk(v(c.u, 1, 2), { hits: 3 }) },
  zhamabu: { name: '紮馬步', type: '身法', star: 1, ap: 1, text: u => `獲得 ${v(u, 3, 5)} 護甲，抽 1 張`, play: c => { armor(c.me, v(c.u, 3, 5)); draw(c.me, 1); } },
  shenhuxi: { name: '深呼吸', type: '吐納', star: 1, text: u => `真氣 +${v(u, 3, 4)}`, play: c => gainQi(c.me, v(c.u, 3, 4)) },
  heshui: { name: '喝口水', type: '吐納', star: 1, text: u => `真氣 +1，抽 ${v(u, 1, 2)} 張`, play: c => { gainQi(c.me, 1); draw(c.me, v(c.u, 1, 2)); } },
  xiaozhoutian: { name: '小周天', type: '吐納', star: 1, text: u => `真氣 +1，之後 ${v(u, 2, 3)} 回合開始時真氣再 +1`, play: c => { gainQi(c.me, 1); c.me.st.qiRegen = [1, v(c.u, 2, 3)]; log('周天運轉，真氣綿綿不絕'); } },
  diushitou: { name: '丟石頭', type: '武技', star: 1, text: u => `造成 ${v(u, 1, 2)} 傷害，抽 1 張`, play: c => { c.atk(v(c.u, 1, 2)); draw(c.me, 1); } },
  lanlv: { name: '懶驢打滾', type: '反制', star: 1, ap: 1, apU: 0, text: u => `暗置。對手下一張武技無效${u ? '（0 行動力）' : ''}`, trap: { trigger: 'attack', fire: () => ({ negate: true }) } },
  benpao: { name: '奔跑', type: '身法', star: 2, ap: 1, text: u => `行動力 +${v(u, 2, 3)}`, play: c => gainAp(c.me, v(c.u, 2, 3)) },
  caidao: { name: '菜刀', type: '兵器', star: 1, text: u => `每回合第一張武技 +${v(u, 2, 3)} 傷害`, eq: { firstAtkBonus: u => v(u, 2, 3) } },
  biandan: { name: '扁擔', type: '兵器', star: 1, text: u => `戰鬥開始獲得 ${v(u, 5, 8)} 護甲`, eq: { battleStart: u => armor(B.p, v(u, 5, 8)) } },
  baozi: { name: '熱包子', type: '吐納', star: 1, exile: true, text: u => `真氣 +${v(u, 2, 3)}，抽 1 張。移除`, play: c => { gainQi(c.me, v(c.u, 2, 3)); draw(c.me, 1); } },
  cz_card: { name: '村長的叮囑', type: '神通', star: 2, qi: 1, qiU: 0, text: u => `抽 2 張，本回合下一張武技 +3 傷害`, play: c => { draw(c.me, 2); c.me.st.nextAtk = (c.me.st.nextAtk || 0) + 3; } },
  saotang: { name: '掃堂腿', type: '武技', star: 2, text: u => `造成 ${v(u, 3, 4)} 傷害，對手下回合行動力 -1`, play: c => { c.atk(v(c.u, 3, 4)); c.foe.st.apDown = (c.foe.st.apDown || 0) + 1; } },
  shihui: { name: '撒石灰', type: '反制', star: 2, ap: 1, apU: 0, text: u => `暗置。對手下一張武技無效，自己抽 1 張`, trap: { trigger: 'attack', fire: t => { draw(t.me, 1); return { negate: true }; } } },
  zhuangsi: { name: '裝死', type: '身法', star: 1, ap: 1, text: u => `獲得 ${v(u, 7, 10)} 護甲`, play: c => armor(c.me, v(c.u, 7, 10)) },
  wangbaquan: { name: '王八拳', type: '武技', star: 2, text: u => `造成 1 傷害 ×X，X＝打出後的手牌數${u ? '+1' : ''}`, play: c => c.atk(1, { hits: Math.max(1, c.me.hand.length + v(c.u, 0, 1)) }) },
  jiuming: { name: '大喊救命', type: '神通', star: 1, qi: 1, qiU: 0, text: u => `抽 ${v(u, 2, 3)} 張`, play: c => draw(c.me, v(c.u, 2, 3)) },
  shaobing: { name: '燒餅', type: '吐納', star: 1, exile: true, text: u => `真氣 +2，獲得 ${v(u, 3, 5)} 護甲。移除`, play: c => { gainQi(c.me, 2); armor(c.me, v(c.u, 3, 5)); } },
  bandeng: { name: '板凳', type: '兵器', star: 2, text: u => `每回合開始獲得 ${v(u, 2, 3)} 護甲`, eq: { turnStart: u => armor(B.p, v(u, 2, 3)) } },
  yunqiu: { name: '運球', type: '身法', star: 1, ap: 1, text: u => `抽 1 張，下一次攻擊 +${v(u, 2, 3)}`, play: c => { draw(c.me, 1); c.me.st.nextAtk = (c.me.st.nextAtk || 0) + v(c.u, 2, 3); } },
  lanqiu: { name: '籃球', type: '兵器', star: 2, text: u => `戰鬥開始真氣 +${v(u, 1, 2)}`, eq: { battleStart: u => gainQi(B.p, v(u, 1, 2)) } },
  shehuiyao: { name: '社會搖', type: '身法', star: 2, ap: 1, text: u => `獲得 ${v(u, 4, 6)} 護甲，行動力 +1`, play: c => { armor(c.me, v(c.u, 4, 6)); gainAp(c.me, 1); } },
  popi: { name: '潑皮手段', type: '武技', star: 2, text: u => `造成 ${v(u, 3, 4)} 傷害，回復 ${v(u, 3, 4)} 生命，對手下回合第一張牌無效`, play: c => { c.atk(v(c.u, 3, 4)); heal(c.me, v(c.u, 3, 4)); c.foe.st.silenced = 1; } },
  // ---- 工作表新增（通用池） ----
  chuanci: { name: '穿刺', type: '武技', star: 1, text: u => `造成 ${v(u, 1, 3)} 穿刺傷害，自己每有 4 護甲傷害 +1`, play: c => c.atk(v(c.u, 1, 3) + Math.floor(c.me.armor / 4), { pierce: true }) },
  heiyu: { name: '黑羽', type: '武技', star: 1, text: u => `造成 ${v(u, 2, 3)} 傷害`, play: c => c.atk(v(c.u, 2, 3)) },
  xiaoshitou: { name: '小石頭', type: '武技', star: 1, exile: true, text: u => `造成 ${v(u, 1, 3)} 傷害。移除`, play: c => c.atk(v(c.u, 1, 3)) },
  pichai: { name: '劈柴', type: '武技', star: 1, text: u => `造成 ${v(u, 2, 3)} 傷害，獲得一張【乾柴】`, play: c => { c.atk(v(c.u, 2, 3)); gainCard(c.me, 'ganchai'); } },
  geqian: { name: '割破錢袋', type: '武技', star: 1, exile: true, text: u => `造成 ${v(u, 2, 4)} 傷害，順手從對手口袋摸走 2 銀兩。移除`, play: c => { if (c.me.isPlayer) { G.gold += 2; log('銀兩 +2'); } else if (c.foe.isPlayer) { const s = Math.min(2, G.gold); G.gold -= s; B.stolen += s; log(`${c.me.name} 割破你的錢袋，摸走 ${s} 銀兩！`); } c.atk(v(c.u, 2, 4)); } },
  kuangbao: { name: '狂暴打擊', type: '武技', star: 1, text: u => `造成 ${v(u, 4, 6)} 傷害，本回合造成傷害 +1`, play: c => { c.atk(v(c.u, 4, 6)); c.me.st.dmgUp = (c.me.st.dmgUp || 0) + 1; } },
  nuichui: { name: '匠人怒錘', type: '武技', star: 1, text: u => `造成 ${v(u, 2, 3)} 傷害，打散對手全部行動力（含下回合上限），每打散 1 點傷害 +${v(u, 2, 3)}`, play: c => { const lost = c.foe.ap + c.foe.apMax; c.foe.ap = 0; c.foe.st.apDown = (c.foe.st.apDown || 0) + c.foe.apMax; if (lost) log(`${c.foe.name} 行動力被打散`); c.atk(v(c.u, 2, 3) + lost * v(c.u, 2, 3)); } },
  yaosui: { name: '咬碎', type: '武技', star: 1, text: u => `造成 ${v(u, 4, 6)} 傷害，獲得 ${v(u, 4, 6)} 護甲`, play: c => { c.atk(v(c.u, 4, 6)); armor(c.me, v(c.u, 4, 6)); } },
  zhuantou: { name: '扔磚頭', type: '武技', star: 1, text: u => `隨機移除對手牌組一張牌，造成 ${v(u, '5~8', '6~9')} 傷害`, play: c => { const pool = c.foe.isPlayer ? c.foe.battleDeck : c.foe.deck; if (pool.length) { const i = R(pool.length); const x = pool.splice(i, 1)[0]; const hi = c.foe.hand.findIndex(h => h.uid === x.uid); if (hi >= 0) c.foe.hand.splice(hi, 1); log(`一磚頭把對方的【${cname(x)}】砸飛了`); } c.atk(5 + R(4) + v(c.u, 0, 1)); } },
  zonghuo: { name: '縱火', type: '武技', star: 1, text: u => `對手獲得 ${v(u, 2, 4)} 燒傷（每用一張牌受等值傷害，層數 -2）`, play: c => { c.foe.st.burn = (c.foe.st.burn || 0) + v(c.u, 2, 4); log(`${c.foe.name} 被點燃`); } },
  xuemeigui: { name: '血玫瑰', type: '武技', star: 2, text: u => `本場戰鬥生命上限 +${v(u, 5, 9)}，回復等量生命`, play: c => { const n = v(c.u, 5, 9); c.me.maxHp += n; heal(c.me, n); } },
  yuejizhen: { name: '月季針', type: '武技', star: 2, text: u => `造成 ${v(u, 3, 5)} 穿刺傷害，回復等量生命`, play: c => heal(c.me, c.atk(v(c.u, 3, 5), { pierce: true })) },
  ezuoju: { name: '惡作劇', type: '武技', star: 2, text: u => `將 2 張【頭暈】洗入對手牌組`, play: c => junk(c.foe, 'j_touyun', 2) },
  jili: { name: '激勵', type: '身法', star: 1, ap: 1, text: u => `造成 ${v(u, '1', '1×2')} 傷害，抽 1 張`, play: c => { if (c.u) c.atk(1, { hits: 2 }); else c.atk(1); draw(c.me, 1); } },
  duye: { name: '毒液', type: '身法', star: 1, ap: 1, text: u => `對手獲得 ${v(u, 3, 4)} 中毒（回合開始受等值傷害，層數 -1）`, play: c => { c.foe.st.poison = (c.foe.st.poison || 0) + v(c.u, 3, 4); log(`${c.foe.name} 中毒了`); } },
  ganbei: { name: '乾杯', type: '身法', star: 2, ap: 1, text: () => '抽 3 張，丟掉手裡所有非武技牌', play: c => { draw(c.me, 3); const dump = c.me.hand.filter(x => CARDS[x.id].type !== '武技'); if (dump.length) { c.me.hand = c.me.hand.filter(x => CARDS[x.id].type === '武技'); log(`乾杯！甩掉了 ${dump.map(x => cname(x)).join('、')}`); } } },
  zaji: { name: '雜技飛刀', type: '身法', star: 2, ap: 1, text: () => '對任意一方造成 2~8 傷害 ×6（落點全看天意）', play: c => { for (let i = 0; i < 6; i++) { const tgt = R(2) ? c.foe : c.me; const dmgs = 2 + R(7); log(`飛刀落向 ${tgt.name}`); attack(c.me, tgt, dmgs); } } },
  chongfeng: { name: '野人衝鋒', type: '身法', star: 2, ap: 1, text: u => `造成 ${v(u, 5, 7)} 傷害，丟棄對手 1 張手牌；對手若無手牌，再造成 10 傷害`, play: c => { c.atk(v(c.u, 5, 7)); const h = c.foe.hand; if (h.length) { const x = h.splice(R(h.length), 1)[0]; c.foe.removed.push(x); log(`順手把對方的【${cname(x)}】拍掉了`); } else { log('對方手裡空空，再補一記狠的'); c.atk(10); } } },
  konghe: { name: '恐嚇', type: '身法', star: 1, ap: 1, text: () => '對手下次抽牌時隨機丟掉 1 張', play: c => { c.foe.st.drawDiscard = (c.foe.st.drawDiscard || 0) + 1; log(`${c.foe.name} 被嚇得握不穩牌`); } },
  lueduo: { name: '掠奪', type: '身法', star: 1, ap: 1, text: u => `回復 ${v(u, 5, 10)} 生命，摧毀對手 ${v(u, 2, 3)} 件兵器`, play: c => { heal(c.me, v(c.u, 5, 10)); let n = v(c.u, 2, 3); if (c.foe.isPlayer) { while (n-- > 0 && G.equipped.length) { const uid = G.equipped.pop(); const ci = G.deck.find(x => x.uid === uid); if (ci) { G.deck = G.deck.filter(x => x !== ci); log(`【${cname(ci)}】被砸爛了`); } } } else log('對方沒有兵器可搶'); } },
  xianxue: { name: '鮮血突襲', type: '身法', star: 2, ap: 1, text: () => '造成 3 穿刺傷害 ×3，吸取等量生命', play: c => heal(c.me, c.atk(3, { hits: 3, pierce: true })) },
  hanchang: { name: '酣暢淋漓', type: '身法', star: 3, text: () => '消耗全部行動力：手牌與牌組所有卡牌升級，回復 10 生命', play: c => { c.me.ap = 0; let n = 0; if (c.me.isPlayer) { G.deck.forEach(x => { if (!x.up) { x.up = true; n++; } }); } else { c.me.deck.forEach(x => { if (!x.up) { x.up = true; n++; } }); } log(`${n} 張牌一下子全都純熟了`); heal(c.me, 10); } },
  kanjianni: { name: '我看見你了', type: '身法', star: 2, ap: 1, text: () => '造成 3 穿刺傷害，對手下回合第一張牌無效', play: c => { c.atk(3, { pierce: true }); c.foe.st.silenced = 1; } },
  duohei: { name: '墮入黑暗吧', type: '身法', star: 3, ap: 1, text: () => '將 4 張【頭暈】洗入對手牌組', play: c => junk(c.foe, 'j_touyun', 4) },
  // ---- 咒術（神通）：武技做不到的派頭 —— 多段雷擊、吟唱延遲爆發、傾瀉真氣、迴響 ----
  luolei: { name: '落雷咒', type: '神通', star: 2, qi: 3, qiU: 2, text: u => `驚雷連落：造成 4 傷害 ×${v(u, 2, 3)}`, play: c => c.atk(4, { hits: v(c.u, 2, 3) }) },
  tianyin: { name: '天音咒', type: '神通', star: 2, qi: 2, qiU: 1, text: u => `吟唱：對手 2 回合後受 ${v(u, 12, 16)} 穿刺傷害`, play: c => { c.foe.st.delayed = { t: 2, d: v(c.u, 12, 16) }; log('天音開始迴盪'); } },
  wuji: { name: '五雷轟頂', type: '神通', star: 2, req: c => c.me.qi >= 3, text: u => `需真氣 ≥3：消耗全部真氣，每點造成 ${v(u, 2, 3)} 傷害`, play: c => { const q = c.me.qi; c.me.qi = 0; log(`五雷轟頂！傾瀉 ${q} 點真氣`); c.atk(q * v(c.u, 2, 3)); } },
  huixiang: { name: '迴響咒', type: '神通', star: 2, qi: 1, qiU: 0, text: () => '迴響：本回合下一張神通打出後回到手牌', play: c => { c.me.st.echo = 1; } },
  // ---- 兵器（1★：第一章可遇到；2★3★ 留待後續章節） ----
  mudun: { name: '木盾', type: '兵器', star: 1, text: u => `每回合開始獲得 ${v(u, 2, 3)} 護甲`, eq: { turnStart: u => armor(B.p, v(u, 2, 3)) } },
  duanjian: { name: '短劍', type: '兵器', star: 1, text: () => '每使用第 2 張武技，造成 1 傷害', eq: { onAtk: (u, n) => { if (n % 2 === 0) attack(B.p, B.e, 1); } } },
  fadima: { name: '發條馬', type: '兵器', star: 1, text: u => `回合結束時造成 ${v(u, 2, 3)} 傷害，獲得 ${v(u, 2, 3)} 護甲`, eq: { turnEnd: u => { attack(B.p, B.e, v(u, 2, 3)); armor(B.p, v(u, 2, 3)); } } },
  // ---- 事件限定（第一章劇情） ----
  jiangcai: { name: '醬菜', type: '吐納', star: 1, exile: true, text: () => '真氣 +1，回復 2 生命。移除（王家老母的心意）', play: c => { gainQi(c.me, 1); heal(c.me, 2); } },
  jidan: { name: '雞蛋', type: '吐納', star: 1, exile: true, text: () => '真氣 +1。移除（王嬸塞的）', play: c => gainQi(c.me, 1) },
  jiuxie: { name: '舊布鞋', type: '兵器', star: 1, text: u => `戰鬥開始獲得 ${v(u, 4, 6)} 護甲（鞋底納得厚，能扛事）`, eq: { battleStart: u => armor(B.p, v(u, 4, 6)) } },
  cz_letter: { name: '村長的舊信', type: '神通', star: 2, text: u => `抽 1 張，本回合下一張武技 +${v(u, 2, 3)} 傷害`, play: c => { draw(c.me, 1); c.me.st.nextAtk = (c.me.st.nextAtk || 0) + v(c.u, 2, 3); } },
  // ---- 雜念（敵人塞進你牌庫，只存在於本場戰鬥） ----
  j_xianyan: { name: '閒言碎語', type: '身法', ap: 1, exile: true, text: () => '什麼也不做。移除（不打就一直佔手牌）', play: c => log(`${c.me.isPlayer ? '你' : c.me.name}把閒話拋到腦後`) },
  j_huiqi: { name: '晦氣', type: '吐納', exile: true, text: () => '失去 2 生命。移除（不打就一直佔手牌）', play: c => loseHp(c.me, 2) },
  j_touyun: { name: '頭暈', type: '雜念', req: () => false, autoDiscard: true, text: () => '無法使用，回合結束自動丟棄' },
  ganchai: { name: '乾柴', type: '雜念', autoDiscard: true, text: () => '抽到時回復 2 生命，回合結束移除', onDraw: c => heal(c.me, 2) },
};
