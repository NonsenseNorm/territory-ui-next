import Link from 'next/link';
const groups = [
  { title: 'ホーム・接続状態', links: [['/', '操作できるホーム'], ['/?state=offline','待機'], ['/?state=loading','読み込み中'], ['/?state=complete','完了'], ['/?state=online','オンライン'], ['/?state=ghost','ゴーストモード'], ['/?state=error','通信エラー']] },
  { title: '認証', links: [['/login','ログイン'], ['/login?state=busy','ログイン処理中'], ['/login?state=error','ログインエラー'], ['/register','新規登録'], ['/register?state=sent','確認メール案内']] },
  { title: '街をスキャン', links: [['/scan?state=unjoined','未参加'], ['/scan?state=ready','スキャン開始前'], ['/scan?state=starting','開始中'], ['/scan?state=waiting','応答待ち'], ['/scan?state=results','結果あり'], ['/scan?state=empty','応答なし'], ['/scan?state=error','取得エラー']] },
  { title: 'アカウント', links: [['/account','アカウント'], ['/logout','ログアウト確認'], ['/logout?state=busy','ログアウト処理中'], ['/delete-account','削除確認'], ['/delete-account?state=error','削除エラー']] },
];
export default function Preview() { return <main className="catalog"><div className="catalog-intro"><h1>なわばり · 画面一覧</h1><p className="body-text">React Native版のUIを確認するためのNext.jsプロトタイプです。画面内の文言・SVG・余白を元の実装に合わせています。</p><p className="body-text">すべてデモです。アカウント作成、メール送信、NFC読取、位置情報取得、削除は実行されません。入力には架空のメールアドレスとパスワードをお使いください。</p></div><div className="catalog-grid">{groups.map(group => <section className="catalog-group" key={group.title}><h2>{group.title}</h2><ul>{group.links.map(([href, label]) => <li key={href}><Link href={href}>{label}</Link></li>)}</ul></section>)}</div><p className="catalog-note">状態別リンクは、その状態を固定して比較するためのものです。操作を通して確認するときは「操作できるホーム」から始めてください。<br />PCでは幅420px、スマートフォンでは画面幅に合わせて表示します。ブラウザーの戻る操作でこの一覧に戻れます。</p></main>; }

