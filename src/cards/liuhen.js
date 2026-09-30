/* ================= 卡牌：留痕 ================= */
import { v } from '../utils.js';
import { B } from '../state.js';
import { addHen, armor, draw, gainAp, gainQi, loseHp, log, zhan } from '../engine/combat.js';
import { CARDS, cname } from './index.js';

export const LIUHEN_CARDS = {
  lh_huahen: { school: 'liuhen', name: '劃痕', type: '武技', star: 1, text: u => `造成 ${v(u, 2, 3)} 傷害，刻 1 痕`, play: c => { c.atk(v(c.u, 2, 3)); addHen(c.foe, 1, c.me); } },
  lh_lianci: { school: 'liuhen', name: '連刺', type: '武技', star: 1, text: u => `造成 1 傷害 ×${v(u, 3, 4)}`, play: c => c.atk(1, { hits: v(c.u, 3, 4) }) },
  lh_huifeng: { school: 'liuhen', name: '回鋒', type: '武技', star: 2, text: u => `造成 ${v(u, 3, 4)} 傷害；若目標痕已滿，抽 1 張`, play: c => { c.atk(v(c.u, 3, 4)); if (c.foe.hen >= c.foe.henCap) draw(c.me, 1); } },
  lh_luanhen: { school: 'liuhen', name: '亂痕', type: '武技', star: 2, text: u => `造成 1 傷害 ×X，X＝本回合已打出的武技數${u ? '+1' : ''}`, play: c => c.atk(1, { hits: (c.me.st.atkCount || 1) + v(c.u, 0, 1) }) },
  lh_pojia: { school: 'liuhen', name: '破甲痕', type: '武技', star: 2, text: u => `造成 ${v(u, 3, 4)} 穿刺傷害，刻 2 痕`, play: c => { c.atk(v(c.u, 3, 4), { pierce: true }); addHen(c.foe, 2, c.me); } },
  lh_yizi: { school: 'liuhen', name: '一字斬', type: '武技', star: 1, zhan: true, text: u => `斬：造成 4 + 每痕 ${v(u, 2, 3)} 傷害`, play: c => { const h = zhan(c); c.atk(4 + h * v(c.u, 2, 3)); } },
  lh_shizi: { school: 'liuhen', name: '十字斬', type: '武技', star: 2, zhan: true, text: u => `斬：造成（每痕 ${v(u, 2, 3)}）傷害 ×2，只清掉一半的痕`, play: c => { const h = zhan(c, true); c.atk(h * v(c.u, 2, 3), { hits: 2 }); } },
  lh_baihen: { school: 'liuhen', name: '百痕一斬', type: '武技', star: 3, zhan: true, text: u => `痕達上限才能打。斬：每痕 ${v(u, 5, 6)} 穿刺傷害`, req: c => c.foe.hen >= c.foe.henCap, play: c => { const h = zhan(c); c.atk(h * v(c.u, 5, 6), { pierce: true }); } },
  lh_youfeng: { school: 'liuhen', name: '游鋒', type: '身法', star: 1, ap: 1, text: u => `抽 2 張，下一張武技多刻 ${v(u, 1, 2)} 痕`, play: c => { draw(c.me, 2); c.me.st.nextHen = (c.me.st.nextHen || 0) + v(c.u, 1, 2); } },
  lh_cangfeng: { school: 'liuhen', name: '藏鋒', type: '身法', star: 1, ap: 1, text: u => `獲得 ${v(u, 5, 7)} 護甲，敵人每有 1 痕再 +1`, play: c => armor(c.me, v(c.u, 5, 7) + c.foe.hen) },
  lh_zhuihen: { school: 'liuhen', name: '追痕', type: '身法', star: 1, ap: 1, apU: 0, text: u => `從牌庫找 1 張「斬」加入手牌`, play: c => { const i = c.me.pile.findIndex(x => CARDS[x.id].zhan); if (i >= 0) { const x = c.me.pile.splice(i, 1)[0]; c.me.hand.push(x); log(`找到【${cname(x)}】`); } else log('牌庫裡沒有斬牌'); } },
  lh_xushi: { school: 'liuhen', name: '蓄勢', type: '身法', star: 2, ap: 1, text: u => `行動力 +2，抽 ${v(u, 1, 2)} 張`, play: c => { gainAp(c.me, 2); draw(c.me, v(c.u, 1, 2)); } },
  lh_henyin: { school: 'liuhen', name: '痕引', type: '身法', star: 2, ap: 1, text: u => `敵人需有 2 痕：消耗 2 痕，抽 2 張，行動力 +${v(u, 1, 2)}`, req: c => c.foe.hen >= 2, play: c => { c.foe.hen -= 2; draw(c.me, 2); gainAp(c.me, v(c.u, 1, 2)); } },
  lh_shihen: { school: 'liuhen', name: '拭痕', type: '身法', star: 1, ap: 1, apU: 0, text: u => `清除自己身上所有痕，每清 1 痕獲得 ${v(u, 2, 3)} 護甲`, play: c => { const n = c.me.hen; c.me.hen = 0; log(`${c.me.name} 拭去 ${n} 痕`); armor(c.me, n * v(c.u, 2, 3)); } },
  lh_jianqi: { school: 'liuhen', name: '劍氣縱橫', type: '神通', star: 2, qi: 3, qiU: 2, text: u => `刻 4 痕`, play: c => addHen(c.foe, 4, c.me) },
  lh_henlie: { school: 'liuhen', name: '痕裂', type: '神通', star: 2, qi: 2, qiU: 1, text: u => `本場戰鬥：敵人回合結束時，每痕受 1 穿刺傷害（可疊加）`, play: c => { c.foe.st.henlie = (c.foe.st.henlie || 0) + 1; } },
  lh_wuhen: { school: 'liuhen', name: '無痕', type: '神通', star: 3, qi: 5, qiU: 4, exile: true, text: u => `本回合「斬」不清痕。移除`, play: c => { c.me.st.wuhen = 1; } },
  lh_kairen: { school: 'liuhen', name: '開刃', type: '神通', star: 2, qi: 2, qiU: 1, text: u => `本場戰鬥敵人痕上限 +2`, play: c => { c.foe.henCap += 2; log(`${c.foe.name} 痕上限 → ${c.foe.henCap}`); } },
  lh_qianren: { school: 'liuhen', name: '千刃', type: '神通', star: 3, qi: 4, qiU: 3, exile: true, text: u => `本場戰鬥敵人痕上限 +4。移除`, play: c => { c.foe.henCap += 4; log(`${c.foe.name} 痕上限 → ${c.foe.henCap}`); } },
  lh_ningshen: { school: 'liuhen', name: '凝神', type: '吐納', star: 1, text: u => `真氣 +${v(u, 2, 3)}，抽 1 張`, play: c => { gainQi(c.me, v(c.u, 2, 3)); draw(c.me, 1); } },
  lh_guanhen: { school: 'liuhen', name: '觀痕', type: '吐納', star: 1, text: u => `真氣 +${v(u, 1, 2)}，敵人每 2 痕再 +1`, play: c => gainQi(c.me, v(c.u, 1, 2) + Math.floor(c.foe.hen / 2)) },
  lh_nihen: { school: 'liuhen', name: '逆痕', type: '反制', star: 2, ap: 1, apU: 0, text: u => `暗置。敵人下一張武技無效，並對它刻 2 痕`, trap: { trigger: 'attack', fire: t => { addHen(t.foe, 2, t.me); return { negate: true }; } } },
  lh_yihen: { school: 'liuhen', name: '移痕', type: '反制', star: 2, ap: 1, apU: 0, text: u => `暗置。下次有人對你刻痕時，改刻到對方身上`, trap: { trigger: 'hen' } },
  lh_kedao: { school: 'liuhen', name: '刻刀', type: '兵器', star: 1, text: u => `每回合第一張武技多刻 ${v(u, 1, 2)} 痕`, eq: { firstAtkHen: u => v(u, 1, 2) } },
  lh_jianxia: { school: 'liuhen', name: '殘劍匣', type: '兵器', star: 2, text: u => `每次打出「斬」，抽 ${v(u, 1, 2)} 張`, eq: { onZhan: u => draw(B.p, v(u, 1, 2)) } },
  lh_jiuqiao: { school: 'liuhen', name: '舊鞘', type: '兵器', star: 2, text: u => `戰鬥開始：敵人帶 2 痕，痕上限 +${v(u, 1, 2)}`, eq: { battleStart: u => { B.e.henCap += v(u, 1, 2); addHen(B.e, 2, B.p); } } },
  lh_henshi: { school: 'liuhen', name: '殘頁・痕噬', type: '武技', star: 3, zhan: true, text: u => `斬：每痕 ${v(u, 6, 7)} 傷害，自己失去「痕數×2」生命（被污染的殘頁，第 3 章可淨化）`, play: c => { const h = zhan(c); c.atk(h * v(c.u, 6, 7)); loseHp(c.me, h * 2); } },
};
