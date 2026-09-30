/* ================= 狀態 =================
   全域單例狀態。ESM 中 import 綁定是 live binding——其他模組直接
   `import { G, B } from './state.js'` 即可讀到最新值；
   但只有本模組能重新賦值，外部一律透過 setG/setB/setS/setNotice。
   G：整局　B：戰鬥　S：目前畫面（渲染函式）　notice：地圖頂部提示
*/
export let G = null;
export let B = null;
export let S = null;
export let notice = '';

export const setG = x => { G = x; };
export const setB = x => { B = x; };
export const setS = x => { S = x; };
export const setNotice = x => { notice = x; };
export const addNotice = x => { notice += x; };

export const hero = () => (G.gender === 'f' ? '小姑娘' : '小兄弟');
export const render = () => S();
