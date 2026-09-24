# なわばり — Next.js UIプロトタイプ

React Native / Expo版「なわばり」のUIを、デザイナーへの引き渡し用にNext.jsで再現した独立プロジェクトです。

## 起動

Node.js 20.9以上を用意してください（検証環境: Node.js 24）。

```sh
npm ci
npm run dev
```

[画面一覧](http://localhost:3000/preview) を最初に開いてください。アプリのホームは [http://localhost:3000](http://localhost:3000) です。

環境変数、Supabaseアカウント、Android SDK、USB端末は不要です。React Native側と依存関係・設定ファイルを共有しません。

## デザイナー向け

- 元アプリのSVG 4枚をそのまま使用。サイズ・文字・余白・色・ボタンの有効/無効状態を移植しています。
- PCでは幅420px、スマートフォンでは画面幅に合わせて表示します。ブラウザーの端末モードで360pxや390pxに変更して確認できます。
- OSのステータスバー・ソフトウェアキーボード・ネイティブのNFCダイアログは含みません。フォントの字形や標準スイッチの細部はブラウザーとAndroidで異なります。
- `/preview` は引き渡し用の画面・状態一覧です。アプリのUIには追加のデザイン確認用コントロールを重ねていません。
- `?state=` で開いた読み込み・完了・応答待ちなどの状態は固定表示です。連続した操作は `/` から確認してください。
- 全画面に直接アクセスできます。デザイン確認のため認証ガードはありません。

## 画面

| URL | 画面 |
|---|---|
| `/` | NFC待機・参加・退出・ゴースト切替 |
| `/login` | ログイン |
| `/register` | 新規登録・メール確認案内 |
| `/scan` | スキャン・応答待ち・結果 |
| `/account` | アカウント |
| `/logout` | ログアウト確認 |
| `/delete-account` | アカウント削除確認 |
| `/preview` | 全画面・24状態へのリンク |

状態別URLの例: `/?state=online`、`/?state=ghost`、`/login?state=error`、`/scan?state=results`、`/scan?state=empty`。

## デモの動き

1. ホームのアンテナを押すと、読み込み → 完了 → オンラインに切り替わります。もう一度押すと退出します。
2. オンライン中はゴーストモードとスキャンが操作できます。
3. スキャンは2秒後に架空の2件の結果を表示し、30秒で受付終了になります。
4. ログインは架空のメールアドレスと任意のパスワードで動作します。新規登録は8文字以上を入力するとメール確認案内を表示します。
5. 削除確認は「削除」を入力したときだけ進めます。

**UIのみのデモです。** 実際のアカウント作成・認証・メール送信・NFC読取・GPS取得・ログアウトAPI・削除APIは呼び出しません。結果の場所・ユーザー・座標・時刻は架空の固定値です。入力に本物のパスワードを使わないでください。入力したパスワードは送信・保存されず、画面内の一時状態だけで扱います。デモの状態は再読み込みでリセットされます。

## 編集箇所

| ファイル | 内容 / 元のReact Native実装 |
|---|---|
| `app/globals.css` | 色・角丸・余白・タイポグラフィ。冒頭のCSS変数で共通値を変更 |
| `components/ui.tsx` | 共通ボタンと画面ヘッダー / `mobile/components/ui.tsx`、`mobile/app/_layout.tsx` |
| `components/connection-screen.tsx` | ホーム・アンテナ / `mobile/app/index.tsx`、`ConnectionScreen.tsx` |
| `components/auth-form.tsx` | ログイン・新規登録 / `AuthForm.tsx` |
| `components/scan-screen.tsx` | スキャン / `mobile/app/scan.tsx` |
| `components/account-screen.tsx` | アカウント / `mobile/app/account.tsx` |
| `components/end-account.tsx` | ログアウト・削除 / `EndAccount.tsx` |
| `components/demo-provider.tsx` | ブラウザー内だけのデモ状態 |
| `lib/demo.ts` | 架空の表示データ |
| `public/*.svg` | 元アプリから変更せずコピーした4枚のSVG |

## 確認・ビルド

```sh
npm run build
npm run typecheck
npx playwright install chromium
npm run test:ui
npm start
```

Playwrightはビルド済みアプリを3100番で起動して、画面遷移、参加・退出、ゴースト、スキャン、認証フォーム、削除確認、全状態の幅320px表示を検証します。通常の開発・プレビューは3000番です。

既存Chromeを使う場合、PowerShellで `$env:PLAYWRIGHT_CHANNEL='chrome'` を指定するとブラウザーの追加インストールを省略できます。

GitHubにはこのディレクトリの内容だけをアップロードします。React Native、Supabase、APK、環境ファイルは含みません。

