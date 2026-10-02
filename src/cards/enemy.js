/* ================= 卡牌：敵人專屬 ================= */
import { B, G } from '../state.js';
import { armor, gainQi, heal, junk, log } from '../engine/combat.js';

export const ENEMY_CARDS = {
  e_bite: { name: '撕咬', type: '武技', text: () => '造成 4 傷害', play: c => c.atk(4) },
  e_pounce: { name: '撲咬', type: '武技', text: () => '造成 6 傷害', play: c => c.atk(6) },
  e_bark: { name: '狂吠', type: '身法', text: () => '下一次攻擊 +3', play: c => { c.me.st.nextAtk = (c.me.st.nextAtk || 0) + 3; } },
  e_popi: { name: '潑皮無賴', type: '武技', text: () => '造成 2 傷害，從對手口袋摸走 3 銀兩', play: c => { c.atk(2); if (c.foe.isPlayer) { const s = Math.min(3, G.gold); G.gold -= s; B.stolen += s; log(`${c.me.name} 順手摸走你 ${s} 銀兩！`); } else if (c.me.isPlayer) { G.gold += 3; log(`你順手摸來 3 銀兩`); } } },
  e_biaoge: { name: '我表哥是衙役', type: '神通', qi: 1, text: () => '獲得 8 護甲', play: c => armor(c.me, 8) },
  e_dadao: { name: '大刀', type: '武技', text: () => '造成 6 傷害', play: c => c.atk(6) },
  e_yaohe: { name: '吆喝', type: '身法', ap: 1, text: () => '下一次攻擊 +4', play: c => { c.me.st.nextAtk = (c.me.st.nextAtk || 0) + 4; } },
  e_fuchen: { name: '拂塵', type: '武技', text: () => '造成 3 傷害', play: c => c.atk(3) },
  e_xiandan: { name: '仙丹（麵粉搓的）', type: '吐納', text: () => '回復 5 生命，真氣 +1', play: c => { heal(c.me, 5); gainQi(c.me, 1); } },
  e_tianlei: { name: '天雷符（其實是鞭炮）', type: '神通', qi: 2, text: () => '造成 7 傷害，對手獲得 2 燒傷', play: c => { c.atk(7); c.foe.st.burn = (c.foe.st.burn || 0) + 2; log(`${c.foe.name} 被鞭炮點燃`); } },
  e_pianshu: { name: '騙術', type: '反制', text: () => '暗置。對手下一張武技無效', trap: { trigger: 'attack', fire: () => ({ negate: true }) } },
  e_zhuo: { name: '啄', type: '武技', text: () => '造成 4 傷害', play: c => c.atk(4) },
  e_ee: { name: '鵝鵝鵝', type: '武技', text: () => '造成 2 傷害 ×3，對手下回合行動力 -1', play: c => { c.atk(2, { hits: 3 }); c.foe.st.apDown = (c.foe.st.apDown || 0) + 1; } },
  e_zhanchi: { name: '展翅', type: '身法', ap: 1, text: () => '獲得 6 護甲，下一次攻擊 +1', play: c => { armor(c.me, 6); c.me.st.nextAtk = (c.me.st.nextAtk || 0) + 1; } },
  e_xiang: { name: '曲項向天歌', type: '身法', text: () => '下一次攻擊 +4', play: c => { c.me.st.nextAtk = (c.me.st.nextAtk || 0) + 4; } },
  e_zhongquan: { name: '重拳', type: '武技', text: () => '造成 6 傷害', play: c => c.atk(6) },
  e_hengsao: { name: '橫掃', type: '武技', text: () => '造成 5 傷害', play: c => c.atk(5) },
  e_tiebi: { name: '鐵臂', type: '身法', ap: 1, text: () => '獲得 9 護甲', play: c => armor(c.me, 9) },
  e_xuli: { name: '蓄力', type: '神通', qi: 2, text: () => '下一次攻擊傷害翻倍', play: c => { c.me.st.nextDouble = 1; } },
  e_yunqi: { name: '運氣', type: '吐納', text: () => '真氣 +2', play: c => gainQi(c.me, 2) },
  // 李大嘴
  e_tiaobo: { name: '煽風點火', type: '神通', qi: 1, text: () => '往對手牌庫塞 2 張【閒言碎語】，造成 1 傷害', play: c => { junk(c.foe, 'j_xianyan', 2); c.atk(1); } },
  e_zuipao: { name: '嘴炮', type: '武技', text: () => '造成 3 傷害', play: c => c.atk(3) },
  e_hanren: { name: '喊人', type: '身法', ap: 1, text: () => '下一次攻擊 +4', play: c => { c.me.st.nextAtk = (c.me.st.nextAtk || 0) + 4; } },
  e_guazi: { name: '嗑瓜子', type: '吐納', text: () => '回復 3 生命，真氣 +1', play: c => { heal(c.me, 3); gainQi(c.me, 1); } },
  // 劉半仙
  e_qiazhi: { name: '掐指一算', type: '反制', text: () => '暗置。對手下一張武技無效', trap: { trigger: 'attack', fire: () => ({ negate: true }) } },
  e_xueguang: { name: '血光之災', type: '身法', ap: 1, exile: true, text: () => '對手獲得「血光之災」：5 回合後直接死亡。移除', play: c => { c.foe.st.doom = 5; log(`血光之災纏上了 ${c.foe.name}！`); } },
  e_yintang: { name: '你印堂發黑', type: '神通', qi: 1, text: () => '往對手牌庫塞 1 張【晦氣】，對手下回合行動力 -1', play: c => { junk(c.foe, 'j_huiqi', 1); c.foe.st.apDown = (c.foe.st.apDown || 0) + 1; } },
  e_kaiguang: { name: '開光', type: '吐納', text: () => '真氣 +3', play: c => gainQi(c.me, 3) },
  // 黃毛阿杰
  e_shehuiyao: { name: '社會搖', type: '身法', ap: 1, text: () => '獲得 6 護甲', play: c => armor(c.me, 6) },
  e_shuaitou: { name: '甩頭', type: '武技', text: () => '造成 4 傷害', play: c => c.atk(4) },
  e_laotie: { name: '老鐵666', type: '吐納', text: () => '真氣 +1，下一次攻擊 +3', play: c => { gainQi(c.me, 1); c.me.st.nextAtk = (c.me.st.nextAtk || 0) + 3; } },
  e_jiaoxiongdi: { name: '叫兄弟', type: '神通', qi: 2, text: () => '造成 2 傷害 ×3，獲得 2 護甲', play: c => { c.atk(2, { hits: 3 }); armor(c.me, 2); } },
  // 小坤子
  e_yunqiu: { name: '運球', type: '身法', ap: 1, text: () => '獲得 4 護甲，下一次攻擊 +3', play: c => { armor(c.me, 4); c.me.st.nextAtk = (c.me.st.nextAtk || 0) + 3; } },
  e_kuaxia: { name: '胯下運球', type: '反制', text: () => '暗置。對手下一張武技無效', trap: { trigger: 'attack', fire: () => ({ negate: true }) } },
  e_guanlan: { name: '灌籃', type: '武技', text: () => '造成 7 傷害', play: c => c.atk(7) },
  e_changtiao: { name: '唱跳 Rap', type: '吐納', text: () => '真氣 +3', play: c => gainQi(c.me, 3) },
  e_jinitaimei: { name: '雞你太美', type: '神通', qi: 2, text: () => '造成 3 傷害 ×2，塞 1 張【閒言碎語】入對手牌庫（太洗腦了）', play: c => { c.atk(3, { hits: 2 }); junk(c.foe, 'j_xianyan', 1); } },
  // 野獸
  e_chongzhuang: { name: '衝撞', type: '武技', text: () => '造成 8 傷害', play: c => c.atk(8) },
  e_pizao: { name: '皮糙肉厚', type: '身法', ap: 1, text: () => '獲得 7 護甲', play: c => armor(c.me, 7) },
  e_langhao: { name: '狼嚎', type: '身法', text: () => '下一次攻擊 +3，本回合造成傷害 +1', play: c => { c.me.st.nextAtk = (c.me.st.nextAtk || 0) + 3; c.me.st.dmgUp = (c.me.st.dmgUp || 0) + 1; } },
  e_liya: { name: '利牙', type: '武技', text: () => '造成 2 傷害 ×3', play: c => c.atk(2, { hits: 3 }) },
  e_duya: { name: '毒牙', type: '武技', text: () => '造成 2 穿刺傷害，對手獲得 2 中毒', play: c => { c.atk(2, { pierce: true }); c.foe.st.poison = (c.foe.st.poison || 0) + 2; log(`${c.foe.name} 中毒了`); } },
  e_chanrao: { name: '纏繞', type: '身法', text: () => '造成 1 傷害，對手下回合行動力 -1', play: c => { c.atk(1); c.foe.st.apDown = (c.foe.st.apDown || 0) + 1; } },
  e_touqian: { name: '順手牽羊', type: '武技', text: () => '造成 1 傷害，從對手口袋摸走 2 銀兩', play: c => { c.atk(1); if (c.foe.isPlayer) { const s = Math.min(2, G.gold); G.gold -= s; B.stolen += s; log(`${c.me.name} 搶走你 ${s} 銀兩！`); } else if (c.me.isPlayer) { G.gold += 2; log(`你順手摸了 2 銀兩`); } } },
  e_xiangjiao: { name: '香蕉皮', type: '反制', text: () => '暗置。對手下一張武技無效', trap: { trigger: 'attack', fire: () => ({ negate: true }) } },
  e_zhuanao: { name: '抓撓', type: '武技', text: () => '造成 2 傷害 ×2，對手抽牌時隨機丟 1 張', play: c => { c.atk(2, { hits: 2 }); c.foe.st.drawDiscard = (c.foe.st.drawDiscard || 0) + 1; } },
  e_tietou: { name: '鐵頭功', type: '武技', text: () => '造成 4 穿刺傷害', play: c => c.atk(4, { pierce: true }) },
  // 村霸王大
  e_baohufei: { name: '收保護費', type: '武技', text: () => '造成 3 傷害，從對手口袋收 4 銀兩「保護費」', play: c => { c.atk(3); if (c.foe.isPlayer) { const s = Math.min(4, G.gold); G.gold -= s; B.stolen += s; log(`${c.me.name} 收走你 ${s} 銀兩「保護費」！`); } else if (c.me.isPlayer) { G.gold += 4; log(`你收了一筆「保護費」：銀兩 +4`); } } },
  // 吊睛白額虎
  e_hupu: { name: '猛虎撲食', type: '武技', text: () => '造成 8 傷害', play: c => c.atk(8) },
  e_huxiao: { name: '虎嘯山林', type: '身法', ap: 1, text: () => '獲得 5 護甲，下一次攻擊 +4，對手下回合少抽 1 張', play: c => { armor(c.me, 5); c.me.st.nextAtk = (c.me.st.nextAtk || 0) + 4; c.foe.st.drawDown = (c.foe.st.drawDown || 0) + 1; } },
  // 黑風寨二當家
  e_feidao: { name: '飛刀', type: '神通', qi: 1, text: () => '造成 2 穿刺傷害 ×3', play: c => c.atk(2, { hits: 3, pierce: true }) },
};
