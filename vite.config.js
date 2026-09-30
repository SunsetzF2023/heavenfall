import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// base './' — 產出相對路徑資源，讓 GitHub Pages 專案子路徑（/heavenfall/）可正常載入。
// `npm run build:single` 使用 vite-plugin-singlefile 把整個遊戲打回單一 HTML，
// 保留原本「下載 index.html 離線雙擊即玩」的分發方式。
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'single' ? [viteSingleFile()] : [],
  build: {
    outDir: mode === 'single' ? 'dist-single' : 'dist',
  },
}));
