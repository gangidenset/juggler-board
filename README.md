# ジャグラー設定推測ボード

ジャグラーシリーズの台データ（G数・BB・RB・差枚）から設定を推測・検証するツールです。
データはすべて端末内（ブラウザ／アプリ内）に保存され、外部には送信されません。

- **Web版（PWA）**: https://gangidenset.github.io/juggler-board/
  - iPhone: Safariで開く → 共有 → 「ホーム画面に追加」
  - Android: Chromeで開く → ︙ → 「ホーム画面に追加」
- **Android版（APK）**: [最新版をダウンロード](https://github.com/gangidenset/juggler-board/releases/latest/download/juggler-board.apk)

## 構成
| パス | 内容 |
|---|---|
| `01_公開用_スマホ/` | アプリ本体（`index.html`）とPWA用ファイル。GitHub Pagesでそのまま公開 |
| `android-app/` | Androidアプリ化の設定（Capacitor）とアイコン |
| `.github/workflows/pages.yml` | push時にGitHub Pagesへ公開 |
| `.github/workflows/android.yml` | push時にAPKを作成し、Releasesに置く |

## 更新手順
1. `01_公開用_スマホ/index.html` を更新
2. `01_公開用_スマホ/sw.js` の `CACHE_VERSION` を上げる（PWAの古いキャッシュを入れ替えるため）
3. commit → push すると、Web版とAndroid版が自動で更新される
