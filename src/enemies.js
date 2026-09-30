/* ================= 敵人 =================
   intro 可以是字串或函式（依 G.flags 動態變化）。
   牌組可混入通用牌與敵人專屬牌（e_ 前綴）。
*/
import { G } from './state.js';

export const ENEMIES = {
  dog: { name: '野狗', lv: 1, hp: 10, ap: 1, qi: 0, draw: 1, deck: ['e_bite', 'e_bite', 'e_pounce', 'e_bark'], exp: 1, gold: [3, 5], intro: '汪！（翻譯：此路是我開。）' },
  wangsan: { name: '流氓王三', lv: 1, hp: 14, ap: 1, qi: 1, draw: 2, deck: ['quanjiao', 'quanjiao', 'gedang', 'e_popi', 'e_biaoge', 'geqian'], exp: 1, gold: [6, 9], intro: '「喲，要去求仙？求仙也得先交過路費！」', after: 'wangsan' },
  dazui: { name: '李大嘴', lv: 1, hp: 15, ap: 1, qi: 1, draw: 2, deck: ['e_tiaobo', 'e_zuipao', 'e_zuipao', 'e_hanren', 'e_guazi', 'ezuoju'], exp: 1, gold: [4, 7], intro: '「聽說你要出村？你爹當年就是出了村，才落得那個下場……大家快來看啊！」', after: 'dazui' },
  liubanxian: { name: '劉半仙', lv: 1, hp: 14, ap: 1, qi: 2, draw: 2, deck: ['e_qiazhi', 'e_xueguang', 'e_yintang', 'e_kaiguang', 'e_fuchen'], exp: 1, gold: [6, 9], intro: '「我掐指一算，你今日出村，必有血光之災。破財可消災，十兩。」', after: 'liubanxian' },
  huangmao: { name: '精神小伙 黃毛阿杰', lv: 1, hp: 17, ap: 1, qi: 0, draw: 2, deck: ['e_shehuiyao', 'e_shuaitou', 'e_shuaitou', 'e_laotie', 'e_jiaoxiongdi', 'ganbei'], exp: 1, gold: [5, 8], intro: '「兄弟，在這片，我阿杰說了算。」（BGM：社會搖）', after: 'huangmao' },
  xiaokun: { name: '小坤子', lv: 2, hp: 19, ap: 1, qi: 1, draw: 2, deck: ['e_yunqiu', 'e_kuaxia', 'e_guanlan', 'e_changtiao', 'e_jinitaimei', 'quanjiao', 'zaji'], exp: 2, gold: [6, 10], intro: '「全民製作人們大家好，我是練習時長兩年半的個人練習生小坤子。喜歡唱、跳、Rap、籃球。」', after: 'xiaokun' },
  boar: { name: '野豬', lv: 2, hp: 24, ap: 1, qi: 0, draw: 2, deck: ['e_chongzhuang', 'e_pizao', 'e_bite', 'e_bite', 'chongfeng'], exp: 2, gold: [4, 7], intro: '一頭獠牙比你手臂還長的野豬，正在拱你的包袱。' },
  wolf: { name: '山狼', lv: 2, hp: 18, ap: 1, qi: 0, draw: 2, deck: ['e_bite', 'e_liya', 'e_liya', 'e_langhao', 'kanjianni'], exp: 2, gold: [4, 7], intro: '村長爺爺說的是真的——村外有狼。' },
  snake: { name: '竹葉青', lv: 1, hp: 11, ap: 1, qi: 0, draw: 1, deck: ['e_duya', 'e_duya', 'e_chanrao', 'duye'], exp: 1, gold: [3, 5], intro: '草叢裡嘶嘶作響。' },
  monkey: { name: '野猴子', lv: 1, hp: 13, ap: 1, qi: 0, draw: 2, deck: ['e_touqian', 'e_touqian', 'e_xiangjiao', 'e_zhuanao', 'zhuantou'], exp: 1, gold: [2, 4], intro: '一隻猴子蹲在樹上，盯著你的錢袋。' },
  bandit: { name: '山賊', lv: 2, hp: 22, ap: 1, qi: 0, draw: 2, deck: ['e_dadao', 'e_dadao', 'gedang', 'e_yaohe', 'quanjiao', 'konghe', 'lueduo'], exp: 2, gold: [6, 10], intro: '「此山是我栽——」「那你挺辛苦的。」' },
  qingxu: { name: '清虛道長（自稱）', lv: 2, hp: 20, ap: 1, qi: 2, draw: 2, deck: ['e_fuchen', 'e_fuchen', 'e_xiandan', 'e_tianlei', 'e_pianshu', 'duohei'], exp: 2, gold: [8, 12], intro: () => G.flags.beat_wangda ? '（盯著你看了三秒）「……你不會就是把我堂弟打趴的那個吧？貧道今日身子不爽利，要不改天再——喂別過來！」' : '「貧道觀你骨骼清奇，這本《如來神掌》只賣十兩……什麼？你要驗貨？」', after: 'qingxu' },
  zhoutong: { name: '落魄拳師 周通', lv: 3, hp: 22, ap: 1, qi: 1, draw: 2, deck: ['e_zhongquan', 'e_hengsao', 'gedang', 'e_yaohe', 'e_yunqi'], exp: 3, gold: [5, 8], intro: '「連輸三屆了。這一屆，總該輪到我了吧……小兄弟，對不住了。」', after: 'zhoutong' },
  goose: { name: '村口大鵝', lv: 3, hp: 24, ap: 1, qi: 0, draw: 2, elite: true, deck: ['e_zhuo', 'e_zhuo', 'e_ee', 'e_zhanchi', 'e_xiang', 'heiyu'], exp: 3, gold: [10, 15], intro: '全村最強的存在。連村長爺爺都繞著牠走。' },
  wangda: { name: '村霸 王大', lv: 2, hp: 28, ap: 1, qi: 1, draw: 2, elite: true, deck: ['e_baohufei', 'e_baohufei', 'e_hanren', 'e_biaoge', 'e_tietou', 'quanjiao', 'konghe', 'nuichui'], exp: 3, gold: [12, 16], intro: '「在林家村，想出村？先問過我王大。我弟王三呢？叫他出來收錢！」', after: 'wangda' },
  tiger: { name: '吊睛白額虎', lv: 3, hp: 34, ap: 1, qi: 0, draw: 2, elite: true, deck: ['e_hupu', 'e_huxiao', 'e_bite', 'e_liya', 'e_liya', 'yaosui', 'xianxue'], exp: 4, gold: [12, 16], intro: '山崗上的告示寫著：「近有大蟲傷人，過往客商務必結伴而行。」你一個人。' },
  erdangjia: { name: '黑風寨二當家', lv: 3, hp: 32, ap: 1, qi: 1, draw: 2, elite: true, deck: ['e_dadao', 'e_dadao', 'e_feidao', 'e_tiebi', 'e_yaohe', 'e_yunqi', 'zaji', 'lueduo'], exp: 4, gold: [15, 20], intro: '「大當家說了，這條路上的人，一個都不能少——都得交錢。」' },
  boss: { name: '擂台霸主 趙鐵柱', lv: 4, hp: 46, ap: 1, qi: 2, draw: 2, boss: true, deck: ['e_zhongquan', 'e_zhongquan', 'e_hengsao', 'e_tiebi', 'e_xuli', 'e_yunqi', 'e_tietou', 'nuichui', 'kuangbao', 'hanchang'], exp: 5, gold: [20, 20], intro: '「新人？在武道界，拳頭就是道理。上台！」' },
};
