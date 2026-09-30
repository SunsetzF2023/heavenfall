/* ================= 流派與技能 ================= */
import { B, G } from './state.js';
import { armor } from './engine/combat.js';

export const SCHOOLS = {
  liuhen: { name: '留痕', motto: '一擊留一痕，百痕成一斬', starter: ['lh_huahen', 'lh_huahen', 'lh_yizi', 'lh_youfeng'],
    passive: '多段武技每一段都刻 1 痕。痕上限 4；痕滿後再刻痕會爆痕：造成等於痕上限的傷害，痕歸零',
    master: '蘇小刀', masterSay: '「天下武功，唯快不破。我開理髮店的，一天剪一百顆頭，你說快不快？」' },
  fushan: { name: '負山', motto: '身負一山，山不動，我不倒', starter: ['fs_hanshan', 'fs_hanshan', 'fs_lizhuang', 'fs_bengshi'],
    passive: '山勢：回合開始時護甲不清空，保留一半',
    master: '石敢當', masterSay: '「我開搬家公司的，一個人扛鋼琴上七樓。想學？先把這塊石碑扛起來。」' },
};
export const SKILLS = {
  liuhen: [
    { lv: 1, id: 'tuohen', name: '拓痕', where: 'map', cd: 2, text: '下一場戰鬥，敵人開局帶 2 痕', use: () => { G.pendingTuohen = true; } },
    { lv: 3, id: 'ninghen', name: '凝痕', where: 'battle', cd: 2, text: '本回合每次攻擊多刻 1 痕', use: () => { B.p.st.ninghen = 1; } },
  ],
  fushan: [
    { lv: 1, id: 'tiegu', name: '鐵骨', where: 'map', cd: 2, text: '下一場戰鬥，開局獲得 8 護甲', use: () => { G.pendingTiegu = true; } },
    { lv: 3, id: 'dingshan', name: '定山', where: 'battle', cd: 2, text: '獲得等於已損失生命一半的護甲', use: () => armor(B.p, Math.floor((B.p.maxHp - B.p.hp) / 2)) },
  ],
};
