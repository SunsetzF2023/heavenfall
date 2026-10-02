/* ================= 可調數值 ================= */
export const CFG = {
  startHp: 20, startAp: 1, startQi: 1, handSize: 3, henCap: 4,
  armorCap: 30, eHandMax: 5,   // 護甲上限；敵人手牌上限（超出則回合末棄回牌庫）
  expTable: [0, 3, 7, 12, 18, 25, 33, 42, 52, 63, 75],   // 到達 Lv(n+1) 所需累積經驗
  startGold: 10,
  price: { 1: 8, 2: 15, 3: 25 },
};
