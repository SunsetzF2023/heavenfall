/* 引擎規則單元測試：combat.js 無 DOM 依賴，直接對 unit 物件操作 */
import { beforeEach, describe, expect, it } from 'vitest';
import { setB, setG } from '../src/state.js';
import { CFG } from '../src/config.js';
import { inst } from '../src/utils.js';
import {
  addHen, armor, attack, canPlay, draw, mkUnit, resolveCard, sweepHand,
  turnStartTick, zhan,
} from '../src/engine/combat.js';

const me = () => mkUnit({ name: '我', isPlayer: true, apMax: 3, ap: 3, qi: 9, maxHp: 20, hp: 20, battleDeck: [] });
const foe = () => mkUnit({ name: '對手', apMax: 2, ap: 1, qi: 0, maxHp: 30, hp: 30, deck: [] });

beforeEach(() => {
  setG({ equipped: [], deck: [], gold: 0, handSize: CFG.handSize });
  setB({ log: [] });
});

describe('canPlay', () => {
  it('反制牌可以打出（過去被 !d.play 擋死）', () => {
    expect(canPlay(me(), foe(), inst('lanlv'))).toBe(true);
  });
  it('兵器與雜念不可打出', () => {
    expect(canPlay(me(), foe(), inst('caidao'))).toBe(false);
    expect(canPlay(me(), foe(), inst('j_touyun'))).toBe(false);
  });
});

describe('痕', () => {
  it('痕滿後再刻會爆痕：痕歸零並受上限等值穿刺傷', () => {
    const e = foe(); e.hen = e.henCap; e.armor = 9;
    addHen(e, 1, me());
    expect(e.hen).toBe(0);
    expect(e.hp).toBe(30 - e.henCap);   // 穿刺，護甲不擋
    expect(e.armor).toBe(9);
  });
  it('斬清痕／半清', () => {
    const p = me(), e = foe(); e.hen = 4;
    expect(zhan({ me: p, foe: e }, true)).toBe(4);
    expect(e.hen).toBe(2);
  });
  it('無痕時斬不清痕', () => {
    const p = me(), e = foe(); e.hen = 4; p.st.wuhen = 1;
    zhan({ me: p, foe: e });
    expect(e.hen).toBe(4);
  });
  it('移痕反制：刻痕轉刻到出手者身上', () => {
    const p = me(), e = foe();
    e.traps.push({ card: inst('lh_yihen') });
    addHen(e, 2, p);
    expect(p.hen).toBe(2);
    expect(e.hen).toBe(0);
    expect(e.traps.length).toBe(0);
  });
});

describe('攻擊結算', () => {
  it('dmgScale 只加在每次攻擊的第一下（多段不吃多倍）', () => {
    const p = me(), e = foe(); p.st.dmgScale = 2;
    const total = attack(p, e, 2, { hits: 3 });
    expect(total).toBe((2 + 2) + 2 + 2);   // 8，不是 (2+2)*3=12
  });
  it('護甲有上限', () => {
    const p = me();
    armor(p, 40);
    expect(p.armor).toBe(CFG.armorCap);
  });
});

describe('反制', () => {
  it('打出反制牌會暗置進 traps', () => {
    const p = me(), e = foe();
    resolveCard(p, e, inst('lanlv'));
    expect(p.traps.length).toBe(1);
  });
  it('對手打武技時觸發 negate，攻擊無效且消耗反制', () => {
    const p = me(), e = foe();
    p.traps.push({ card: inst('lanlv') });
    resolveCard(e, p, inst('e_bite'));   // 敵方打 4 傷害武技
    expect(p.hp).toBe(20);
    expect(p.traps.length).toBe(0);
  });
});

describe('抽牌與雜念', () => {
  it('drawDiscard：抽到牌時隨機丟 1 張進 removed（雙方一致）', () => {
    const e = foe();
    e.pile = [inst('e_bite'), inst('e_pounce')];
    e.st.drawDiscard = 1;
    draw(e, 1);
    expect(e.hand.length).toBe(0);
    expect(e.removed.length).toBe(1);
  });
  it('sweepHand 把手牌中的雜念掃進 removed', () => {
    const e = foe();
    e.hand = [inst('j_touyun'), inst('e_bite')];
    sweepHand(e);
    expect(e.hand.length).toBe(1);
    expect(e.removed.length).toBe(1);
  });
});

describe('卡牌效果', () => {
  it('匠人怒錘：打散當前與下回合行動力', () => {
    const p = me(), e = foe(); e.ap = 1; e.apMax = 2;
    resolveCard(p, e, inst('nuichui'));
    expect(e.ap).toBe(0);
    expect(e.st.apDown).toBe(2);
    expect(e.hp).toBeLessThan(30);   // 基礎 + 打散加成
  });
});

describe('咒術機制', () => {
  it('天音咒：吟唱 2 回合後穿刺爆發', () => {
    const e = foe(); e.armor = 9;
    e.st.delayed = { t: 2, d: 12 };
    turnStartTick(e);
    expect(e.hp).toBe(30);
    expect(e.st.delayed.t).toBe(1);
    turnStartTick(e);
    expect(e.hp).toBe(18);           // 穿刺，護甲不擋
    expect(e.st.delayed).toBe(0);
  });
  it('小周天：每回合開始真氣 +1 共 N 回合', () => {
    const e = foe(); e.st.qiRegen = [1, 2];
    turnStartTick(e);
    expect(e.qi).toBe(1);
    expect(e.st.qiRegen).toEqual([1, 1]);
    turnStartTick(e);
    expect(e.qi).toBe(2);
    expect(e.st.qiRegen).toBe(0);
  });
  it('迴響：神通打出後回到手牌（只作用一次，自身不回彈）', () => {
    const p = me(), e = foe();
    p.st.echo = 1;
    const ci = inst('qijin');
    resolveCard(p, e, ci);
    expect(p.hand[p.hand.length - 1]).toBe(ci);
    expect(p.st.echo).toBe(0);
    // 迴響咒自己不該把自己彈回來
    const p2 = me(), e2 = foe();
    resolveCard(p2, e2, inst('huixiang'));
    expect(p2.st.echo).toBe(1);
    expect(p2.hand.length).toBe(0);
  });
  it('五雷轟頂：真氣 ≥3 才能打，傾瀉全部真氣', () => {
    const p = me(), e = foe();
    p.qi = 2;
    expect(canPlay(p, e, inst('wuji'))).toBe(false);
    p.qi = 5;
    expect(canPlay(p, e, inst('wuji'))).toBe(true);
    resolveCard(p, e, inst('wuji'));
    expect(p.qi).toBe(0);
    expect(e.hp).toBe(30 - 5 * 2);   // 未升級每點 2 傷
  });
});
