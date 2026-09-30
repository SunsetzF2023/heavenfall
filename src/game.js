/* ================= 開局 ================= */
import { inst, shuffle } from './utils.js';
import { CFG } from './config.js';
import { G, setG } from './state.js';
import { withSticky } from './map.js';

export function newGame(name, gender) {
  setG({ name, gender, maxHp: CFG.startHp, hp: CFG.startHp, apMax: CFG.startAp, baseQi: CFG.startQi, handSize: CFG.handSize,
    level: 1, exp: 0, gold: CFG.startGold, equipSlots: 0, equipped: [], school: null,
    dao: 0, wu: 0, daoRw: false, wuRw: false, skillCd: {}, pendingTuohen: false, pendingTiegu: false,
    delCount: 0, smithCount: 0, pagesDone: 0, pageDeck: [], pageShown: [], flags: {}, bet: 0,
    deck: ['quanjiao', 'quanjiao', 'quanjiao', 'quanjiao', 'gedang', 'gedang', 'tuna', 'tuna', 'qijin', 'manjin'].map(id => inst(id)) });
  G.stage = 'village';
  G.pageDeck = withSticky(shuffle(['dazui', 'liubanxian', 'huangmao', 'xiaokun', 'cunzhang', 'wangshen', 'wangda', 'wangmama', 'lisao', 'dog', 'peddler', 'teahouse', 'bundle', 'medicine']), 'gate', 4);
  G.pageShown = ['wangsan', 'zhang', G.pageDeck.pop()];
}
