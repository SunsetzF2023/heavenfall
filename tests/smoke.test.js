/* 資料完整性冒煙測試：在無 DOM 環境下驗證各資料表互相引用有效 */
import { describe, expect, it } from 'vitest';
import { CARDS, COMMON_POOL, cost, schoolPool } from '../src/cards/index.js';
import { ENEMIES } from '../src/enemies.js';
import { PAGES } from '../src/map.js';
import { SCHOOLS, SKILLS } from '../src/schools.js';

describe('cards', () => {
  it('COMMON_POOL 內的牌都存在', () => {
    for (const id of COMMON_POOL) expect(CARDS[id], id).toBeDefined();
  });
  it('每張牌都有 name/type/text，且 text 可執行', () => {
    for (const [id, d] of Object.entries(CARDS)) {
      expect(d.name, id).toBeTruthy();
      expect(d.type, id).toBeTruthy();
      expect(typeof d.text(false), id).toBe('string');
      expect(typeof d.text(true), id).toBe('string');
    }
  });
  it('cost 計算正確（升級優先取 apU/qiU）', () => {
    expect(cost({ ap: 1 }, false)).toEqual({ ap: 1, qi: 0 });
    expect(cost({ ap: 1, apU: 0 }, true)).toEqual({ ap: 0, qi: 0 });
  });
});

describe('enemies', () => {
  it('敵人牌組引用的牌都存在', () => {
    for (const [key, e] of Object.entries(ENEMIES)) {
      for (const id of e.deck) expect(CARDS[id], `${key}.${id}`).toBeDefined();
    }
  });
  it('敵人 after 事件有對應 key', () => {
    for (const [key, e] of Object.entries(ENEMIES)) {
      if (e.after) expect(typeof e.after, key).toBe('string');
    }
  });
});

describe('schools', () => {
  it('入門牌存在且屬於該流派', () => {
    for (const [key, s] of Object.entries(SCHOOLS)) {
      for (const id of s.starter) {
        expect(CARDS[id], id).toBeDefined();
        expect(CARDS[id].school, id).toBe(key);
      }
      expect(schoolPool(key).length).toBeGreaterThan(0);
      expect(SKILLS[key].length).toBeGreaterThan(0);
    }
  });
});

describe('pages', () => {
  it('每頁都有 name/kind/desc', () => {
    for (const [key, p] of Object.entries(PAGES)) {
      expect(p.name, key).toBeTruthy();
      expect(p.kind, key).toBeTruthy();
      expect(p.desc, key).toBeTruthy();
    }
  });
  it('sticky 頁為村口與武道大比', () => {
    const sticky = Object.keys(PAGES).filter(k => PAGES[k].sticky).sort();
    expect(sticky).toEqual(['finale', 'gate']);
  });
});
