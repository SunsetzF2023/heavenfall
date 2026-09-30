/* ================= 卡牌：凡人卡組・通用・雜念 =================
   type：武技(不耗資源) 身法(耗行動力) 神通(耗真氣) 吐納(補真氣) 反制(暗置) 兵器(裝備)
   ap/qi：消耗；apU/qiU：升級後消耗
*/
import { v } from '../utils.js';
import { B, G } from '../state.js';
import { armor, draw, gainQi, gainAp, loseHp, log } from '../engine/combat.js';

export const COMMON_CARDS = {
  // ---- 凡人卡組 ----
  quanjiao: { name: '拳腳', type: '武技', star: 1, text: u => `造成 ${v(u, 2, 3)} 傷害`, play: c => c.atk(v(c.u, 2, 3)) },
  gedang: { name: '格擋', type: '身法', star: 1, ap: 1, text: u => `獲得 ${v(u, 4, 6)} 護甲`, play: c => armor(c.me, v(c.u, 4, 6)) },
  tuna: { name: '吐納', type: '吐納', star: 1, text: u => `真氣 +${v(u, 2, 3)}`, play: c => gainQi(c.me, v(c.u, 2, 3)) },
  qijin: { name: '氣勁', type: '神通', star: 1, qi: 2, text: u => `造成 ${v(u, 5, 8)} 傷害`, play: c => c.atk(v(c.u, 5, 8)) },
  manjin: { name: '蠻勁', type: '神通', star: 1, qi: 1, text: u => `造成 ${v(u, 5, 7)} 傷害`, play: c => c.atk(v(c.u, 5, 7)) },
  // ---- 通用（商店/寶物/升級） ----
  feiti: { name: '飛踢', type: '武技', star: 1, text: u => `造成 ${v(u, 4, 6)} 傷害`, play: c => c.atk(v(c.u, 4, 6)) },
  lianhuan: { name: '連環拳', type: '武技', star: 1, text: u => `造成 1 傷害 ×${v(u, 3, 4)}`, play: c => c.atk(1, { hits: v(c.u, 3, 4) }) },
  zhamabu: { name: '紮馬步', type: '身法', star: 1, ap: 1, text: u => `獲得 ${v(u, 3, 5)} 護甲，抽 1 張`, play: c => { armor(c.me, v(c.u, 3, 5)); draw(c.me, 1); } },
  shenhuxi: { name: '深呼吸', type: '吐納', star: 1, text: u => `真氣 +${v(u, 3, 4)}`, play: c => gainQi(c.me, v(c.u, 3, 4)) },
  heshui: { name: '喝口水', type: '吐納', star: 1, text: u => `真氣 +1，抽 ${v(u, 1, 2)} 張`, play: c => { gainQi(c.me, 1); draw(c.me, v(c.u, 1, 2)); } },
  diushitou: { name: '丟石頭', type: '武技', star: 1, text: u => `造成 ${v(u, 1, 2)} 傷害，抽 1 張`, play: c => { c.atk(v(c.u, 1, 2)); draw(c.me, 1); } },
  lanlv: { name: '懶驢打滾', type: '反制', star: 1, ap: 1, apU: 0, text: u => `暗置。敵人下一張武技無效${u ? '（0 行動力）' : ''}`, trap: { trigger: 'attack', fire: () => ({ negate: true }) } },
  benpao: { name: '奔跑', type: '身法', star: 2, ap: 1, text: u => `行動力 +${v(u, 2, 3)}`, play: c => gainAp(c.me, v(c.u, 2, 3)) },
  caidao: { name: '菜刀', type: '兵器', star: 1, text: u => `每回合第一張武技 +${v(u, 2, 3)} 傷害`, eq: { firstAtkBonus: u => v(u, 2, 3) } },
  biandan: { name: '扁擔', type: '兵器', star: 1, text: u => `戰鬥開始獲得 ${v(u, 5, 8)} 護甲`, eq: { battleStart: u => armor(B.p, v(u, 5, 8)) } },
  baozi: { name: '熱包子', type: '吐納', star: 1, exile: true, text: u => `真氣 +${v(u, 2, 3)}，抽 1 張。移除`, play: c => { gainQi(c.me, v(c.u, 2, 3)); draw(c.me, 1); } },
  cz_card: { name: '村長的叮囑', type: '神通', star: 2, qi: 1, qiU: 0, text: u => `抽 2 張，本回合下一張武技 +3 傷害`, play: c => { draw(c.me, 2); c.me.st.nextAtk = (c.me.st.nextAtk || 0) + 3; } },
  saotang: { name: '掃堂腿', type: '武技', star: 2, text: u => `造成 ${v(u, 3, 4)} 傷害，敵人下回合行動力 -1`, play: c => { c.atk(v(c.u, 3, 4)); c.foe.st.apDown = 1; } },
  shihui: { name: '撒石灰', type: '反制', star: 2, ap: 1, apU: 0, text: u => `暗置。敵人下一張武技無效，你抽 1 張`, trap: { trigger: 'attack', fire: t => { draw(t.me, 1); return { negate: true }; } } },
  zhuangsi: { name: '裝死', type: '身法', star: 1, ap: 1, text: u => `獲得 ${v(u, 7, 10)} 護甲`, play: c => armor(c.me, v(c.u, 7, 10)) },
  wangbaquan: { name: '王八拳', type: '武技', star: 2, text: u => `造成 1 傷害 ×X，X＝打出後的手牌數${u ? '+1' : ''}`, play: c => c.atk(1, { hits: Math.max(1, c.me.hand.length + v(c.u, 0, 1)) }) },
  jiuming: { name: '大喊救命', type: '神通', star: 1, qi: 1, qiU: 0, text: u => `抽 ${v(u, 2, 3)} 張`, play: c => draw(c.me, v(c.u, 2, 3)) },
  shaobing: { name: '燒餅', type: '吐納', star: 1, exile: true, text: u => `真氣 +2，獲得 ${v(u, 3, 5)} 護甲。移除`, play: c => { gainQi(c.me, 2); armor(c.me, v(c.u, 3, 5)); } },
  bandeng: { name: '板凳', type: '兵器', star: 2, text: u => `每回合開始獲得 ${v(u, 2, 3)} 護甲`, eq: { turnStart: u => armor(B.p, v(u, 2, 3)) } },
  yunqiu: { name: '運球', type: '身法', star: 1, ap: 1, text: u => `抽 1 張，下一次攻擊 +${v(u, 2, 3)}`, play: c => { draw(c.me, 1); c.me.st.nextAtk = (c.me.st.nextAtk || 0) + v(c.u, 2, 3); } },
  lanqiu: { name: '籃球', type: '兵器', star: 2, text: u => `戰鬥開始真氣 +${v(u, 1, 2)}`, eq: { battleStart: u => gainQi(B.p, v(u, 1, 2)) } },
  shehuiyao: { name: '社會搖', type: '身法', star: 2, ap: 1, text: u => `獲得 ${v(u, 4, 6)} 護甲，行動力 +1`, play: c => { armor(c.me, v(c.u, 4, 6)); gainAp(c.me, 1); } },
  // ---- 雜念（敵人塞進你牌庫，只存在於本場戰鬥） ----
  j_xianyan: { name: '閒言碎語', type: '身法', ap: 1, exile: true, text: () => '什麼也不做。移除（不打就一直佔手牌）', play: () => log('你把閒話拋到腦後') },
  j_huiqi: { name: '晦氣', type: '吐納', exile: true, text: () => '失去 2 生命。移除（不打就一直佔手牌）', play: c => loseHp(c.me, 2) },
  popi: { name: '潑皮手段', type: '武技', star: 1, text: u => `造成 ${v(u, 3, 4)} 傷害，銀兩 +1`, play: c => { c.atk(v(c.u, 3, 4)); if (c.me.isPlayer) G.gold += 1; } },
};
