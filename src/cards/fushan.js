/* ================= 卡牌：負山 ================= */
import { v } from '../utils.js';
import { B } from '../state.js';
import { armor, beng, draw, gainAp, gainQi, loseHp } from '../engine/combat.js';

export const FUSHAN_CARDS = {
  fs_hanshan: { school: 'fushan', name: '撼山拳', type: '武技', star: 1, text: u => `造成 ${v(u, 3, 4)} 傷害，獲得 ${v(u, 2, 3)} 護甲`, play: c => { c.atk(v(c.u, 3, 4)); armor(c.me, v(c.u, 2, 3)); } },
  fs_beishan: { school: 'fushan', name: '背山', type: '武技', star: 1, text: u => `造成等於一半護甲${u ? '+2' : ''}的傷害`, play: c => c.atk(Math.floor(c.me.armor / 2) + v(c.u, 0, 2)) },
  fs_xuequan: { school: 'fushan', name: '血拳', type: '武技', star: 1, text: u => `失去 2 生命，造成 ${v(u, 6, 8)} 傷害`, play: c => { loseHp(c.me, 2); c.atk(v(c.u, 6, 8)); } },
  fs_yishen: { school: 'fushan', name: '以身為盾', type: '武技', star: 2, text: u => `造成 ${v(u, 4, 5)} 傷害；生命低於一半時再獲得 ${v(u, 6, 8)} 護甲`, play: c => { c.atk(v(c.u, 4, 5)); if (c.me.hp < c.me.maxHp / 2) armor(c.me, v(c.u, 6, 8)); } },
  fs_bengshi: { school: 'fushan', name: '崩石', type: '武技', star: 2, beng: true, text: u => `崩：消耗全部護甲，造成等量${u ? '+3' : ''}傷害`, play: c => { const a = beng(c); c.atk(a + v(c.u, 0, 3)); } },
  fs_shanbeng: { school: 'fushan', name: '山崩地裂', type: '武技', star: 3, beng: true, text: u => `崩：消耗全部護甲，造成 2 倍${u ? '+5' : ''}穿刺傷害`, play: c => { const a = beng(c); c.atk(a * 2 + v(c.u, 0, 5), { pierce: true }); } },
  fs_lizhuang: { school: 'fushan', name: '立樁', type: '身法', star: 1, ap: 1, text: u => `獲得 ${v(u, 6, 9)} 護甲`, play: c => armor(c.me, v(c.u, 6, 9)) },
  fs_chenjian: { school: 'fushan', name: '沉肩', type: '身法', star: 1, ap: 1, text: u => `獲得 ${v(u, 4, 6)} 護甲，抽 1 張`, play: c => { armor(c.me, v(c.u, 4, 6)); draw(c.me, 1); } },
  fs_xuerou: { school: 'fushan', name: '血肉鑄甲', type: '身法', star: 2, ap: 1, text: u => `失去 3 生命，獲得 ${v(u, 10, 13)} 護甲`, play: c => { loseHp(c.me, 3); armor(c.me, v(c.u, 10, 13)); } },
  fs_huishan: { school: 'fushan', name: '回山', type: '身法', star: 2, ap: 1, apU: 0, text: u => `下回合開始時，護甲全部保留`, play: c => { c.me.st.huishan = 1; } },
  fs_zhenbu: { school: 'fushan', name: '震步', type: '身法', star: 2, ap: 1, text: u => `到你下回合前：每被攻擊一下，反震 ${v(u, 3, 5)} 傷害`, play: c => { c.me.st.fanzhen = (c.me.st.fanzhen || 0) + v(c.u, 3, 5); } },
  fs_budong: { school: 'fushan', name: '不動明身', type: '神通', star: 2, qi: 3, qiU: 2, text: u => `護甲翻倍`, play: c => armor(c.me, c.me.armor) },
  fs_shanhun: { school: 'fushan', name: '山魂', type: '神通', star: 3, qi: 4, qiU: 3, exile: true, text: u => `本場戰鬥每回合開始獲得 4 護甲。移除`, play: c => { c.me.st.shanhun = (c.me.st.shanhun || 0) + 1; } },
  fs_ranxue: { school: 'fushan', name: '燃血訣', type: '神通', star: 2, qi: 2, qiU: 1, text: u => `失去 5 生命，行動力 +2，抽 2 張`, play: c => { loseHp(c.me, 5); gainAp(c.me, 2); draw(c.me, 2); } },
  fs_shanyue: { school: 'fushan', name: '山嶽鎮', type: '神通', star: 2, qi: 3, qiU: 2, text: u => `敵人下回合行動力 -1`, play: c => { c.foe.st.apDown = 1; } },
  fs_pingxi: { school: 'fushan', name: '屏息', type: '吐納', star: 1, text: u => `真氣 +2，獲得 ${v(u, 3, 5)} 護甲`, play: c => { gainQi(c.me, 2); armor(c.me, v(c.u, 3, 5)); } },
  fs_xueqi: { school: 'fushan', name: '血氣', type: '吐納', star: 1, text: u => `失去 3 生命，真氣 +${v(u, 4, 5)}`, play: c => { loseHp(c.me, 3); gainQi(c.me, v(c.u, 4, 5)); } },
  fs_weiran: { school: 'fushan', name: '巍然', type: '反制', star: 2, ap: 1, apU: 0, text: u => `暗置。敵人下一張武技：先獲得等於其傷害的護甲，傷害減半`, trap: { trigger: 'attack', fire: () => ({ halve: true, armorFromDmg: true }) } },
  fs_huizhen: { school: 'fushan', name: '回震', type: '反制', star: 2, ap: 1, apU: 0, text: u => `暗置。敵人下一張武技被護甲擋下的傷害，全數打回去`, trap: { trigger: 'attack', fire: () => ({ reflect: true }) } },
  fs_zhongdun: { school: 'fushan', name: '重盾', type: '兵器', star: 1, text: u => `戰鬥開始獲得 ${v(u, 8, 11)} 護甲`, eq: { battleStart: u => armor(B.p, v(u, 8, 11)) } },
  fs_kaishan: { school: 'fushan', name: '開山斧', type: '兵器', star: 2, text: u => `每次「崩」，獲得 ${v(u, 3, 5)} 護甲`, eq: { onBeng: u => armor(B.p, v(u, 3, 5)) } },
  fs_fushi: { school: 'fushan', name: '負石', type: '兵器', star: 2, text: u => `山勢改為保留 3/4 護甲${u ? '' : '；行動力上限 -1'}`, eq: { keep: () => 0.75, apMaxMod: u => v(u, -1, 0) } },
  fs_fenshan: { school: 'fushan', name: '殘頁・焚山', type: '武技', star: 3, beng: true, text: u => `崩：消耗全部護甲和一半生命，造成 3 倍${u ? '+5' : ''}傷害（被污染的殘頁，第 3 章可淨化）`, play: c => { const a = beng(c); loseHp(c.me, Math.floor(c.me.hp / 2)); c.atk(a * 3 + v(c.u, 0, 5)); } },
};
