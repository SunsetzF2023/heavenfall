/* ================= 卡牌總表 =================
   各流派/通用/敵人卡分檔存放，這裡合併成唯一的 CARDS 表。
   加新卡：改對應領域檔即可，不用動引擎。
*/
import { G } from '../state.js';
import { COMMON_CARDS } from './common.js';
import { LIUHEN_CARDS } from './liuhen.js';
import { FUSHAN_CARDS } from './fushan.js';
import { ENEMY_CARDS } from './enemy.js';

export const CARDS = { ...COMMON_CARDS, ...LIUHEN_CARDS, ...FUSHAN_CARDS, ...ENEMY_CARDS };

// 通用卡池：商店/包袱/升級獎勵的來源。事件限定牌（popi、醬菜等）與雜念不入池；
// ★3 牌不入池，由盲盒或特定管道取得。
export const COMMON_POOL = [
  'feiti', 'lianhuan', 'zhamabu', 'shenhuxi', 'heshui', 'diushitou', 'lanlv', 'benpao',
  'caidao', 'biandan', 'saotang', 'shihui', 'zhuangsi', 'wangbaquan', 'jiuming', 'shaobing', 'bandeng',
  'chuanci', 'heiyu', 'xiaoshitou', 'pichai', 'geqian', 'kuangbao', 'nuichui', 'yaosui',
  'zhuantou', 'zonghuo', 'jili', 'duye', 'konghe', 'lueduo',
  'xuemeigui', 'yuejizhen', 'ezuoju', 'ganbei', 'zaji', 'chongfeng', 'xianxue', 'kanjianni',
  'mudun', 'duanjian', 'fadima',
  'xiaozhoutian', 'luolei', 'tianyin', 'wuji', 'huixiang',
];
export const schoolPool = s => Object.keys(CARDS).filter(k => CARDS[k].school === s);
export const cardPool = () => COMMON_POOL.concat(G.school ? schoolPool(G.school) : []);
export const cname = ci => CARDS[ci.id].name + (ci.up ? '+' : '');
export const cost = (d, u) => ({ ap: u && d.apU !== undefined ? d.apU : (d.ap || 0), qi: u && d.qiU !== undefined ? d.qiU : (d.qi || 0) });
export const costStr = ci => { const c = cost(CARDS[ci.id], ci.up); const s = []; if (c.ap) s.push(`行動${c.ap}`); if (c.qi) s.push(`真氣${c.qi}`); return s.length ? '・' + s.join('・') : ''; };
export const stars = d => d.star ? '★'.repeat(d.star) : '';
