/* ================= 基本工具 ================= */
export const R = n => Math.floor(Math.random() * n);
export const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = R(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pick = (a, n) => shuffle(a.slice()).slice(0, n);
export const v = (u, a, b) => (u ? b : a);
let UID = 1;
export const inst = (id, up = false) => ({ id, up, uid: UID++ });
