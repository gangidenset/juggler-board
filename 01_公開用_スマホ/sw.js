/* ジャグラー設定推測ボード Service Worker
   - アプリ本体とExcel読み込みライブラリ(SheetJS)を端末に保存し、電波がなくても起動・インポートできるようにする
   - index.html は「ネット優先」：つながれば最新版、つながらなければ保存済みの版を表示
   - アプリを更新して再公開したら CACHE_VERSION の数字を上げる（古い保存分が消えて入れ替わる） */
const CACHE_VERSION = 'v1';
const CACHE_NAME = 'juggler-board-' + CACHE_VERSION;
const XLSX_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];
const NETWORK_TIMEOUT_MS = 3000;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE);
    // ライブラリは取得に失敗してもインストール自体は止めない（初回インポート時に再取得される）
    try{
      const res = await fetch(XLSX_SRC, {mode:'cors'});
      if(res.ok) await cache.put(XLSX_SRC, res);
    }catch(e){}
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith('juggler-board-') && k !== CACHE_NAME).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

function withTimeout(promise, ms){
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }, e => { clearTimeout(t); reject(e); });
  });
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if(!sameOrigin && req.url !== XLSX_SRC) return;

  // ページ本体：ネット優先（電波が弱いときは3秒で保存版に切り替え）
  if(req.mode === 'navigate'){
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      try{
        const res = await withTimeout(fetch(req), NETWORK_TIMEOUT_MS);
        if(res.ok) cache.put('./index.html', res.clone());
        return res;
      }catch(e){
        return (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
      }
    })());
    return;
  }

  // アイコン・ライブラリなど：保存版優先、なければ取得して保存
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const hit = await cache.match(req.url === XLSX_SRC ? XLSX_SRC : req);
    if(hit) return hit;
    const res = await fetch(req.url === XLSX_SRC ? new Request(XLSX_SRC, {mode:'cors'}) : req);
    if(res.ok) cache.put(req.url === XLSX_SRC ? XLSX_SRC : req, res.clone());
    return res;
  })());
});
