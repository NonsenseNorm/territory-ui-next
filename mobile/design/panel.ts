import { state,configure,confirmEmail,reset,scenario } from './model';

// Separate designer controls: no production screen imports this module.
function mount() {
  if(document.getElementById('design-tools')) return;
  const style=document.createElement('style');
  style.textContent=`html,body{height:100%;background:#eee}#root{height:100%;max-width:420px;margin:auto;background:#fff}#design-tools{position:fixed;right:12px;top:10px;z-index:99999;font:13px system-ui;color:#222}#design-tools button,#design-tools select{font:inherit;padding:8px 10px;border:1px solid #ccc;border-radius:6px;background:white;color:#222;cursor:pointer}#design-tools>button{box-shadow:0 2px 8px #0002}#design-dialog{position:fixed;inset:auto 12px 12px auto;max-height:85vh;overflow:auto;width:min(340px,calc(100vw - 24px));padding:20px;background:#fff;border:1px solid #bbb;border-radius:12px;box-shadow:0 8px 40px #0003}#design-dialog[hidden]{display:none}#design-dialog h2{font-size:17px;margin:0 0 12px}#design-dialog p{font-size:12px;line-height:1.6}#design-dialog label{display:flex;align-items:center;gap:10px;margin:12px 0}#design-dialog label select{margin-left:auto;max-width:180px}#design-dialog .actions{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}#design-dialog input{accent-color:#222}#design-dialog a{color:#222}`;
  document.head.appendChild(style);
  const host=document.createElement('aside');host.id='design-tools';host.setAttribute('aria-label','デザイナー用コントロール');
  host.innerHTML=`<button id="design-toggle" aria-expanded="false" aria-controls="design-dialog">デザイン操作</button><section id="design-dialog" hidden aria-label="接続モックの設定"><h2>接続モックの設定</h2><p>画面・遷移は本番コードです。下の操作は外部サービスの応答だけを変更します。実際の通信・メール送信・NFC・GPSは使いません。</p><p id="design-status" role="status"></p><div class="actions"><button id="design-confirm">確認メールを開いたことにする</button><button id="design-sample">サンプルで開始</button></div><label><input type="checkbox" data-setting="offline">通信をオフラインにする</label><label><input type="checkbox" data-setting="gpsDenied">GPS権限を拒否</label><label><input type="checkbox" data-setting="outside">場所の範囲外へ移動</label><label><input type="checkbox" data-setting="emptyScan">他の端末から応答なし</label><label><input type="checkbox" data-setting="background">バックグラウンド権限を許可</label><label>NFC読取<select id="design-nfc"><option value="success">成功</option><option value="cancel">キャンセル</option><option value="error">読取失敗</option></select></label><label>応答時間<select id="design-latency"><option value="450">通常（450ms）</option><option value="2000">遅い（2秒）</option><option value="5000">とても遅い（5秒）</option></select></label><label>次の操作を失敗<select id="design-fail"><option value="">失敗なし</option><option value="signup">新規登録</option><option value="login">ログイン</option><option value="nfc">NFC参加・退出</option><option value="ghost">ゴースト変更</option><option value="scan">スキャン開始</option><option value="logout">ログアウト</option><option value="delete">アカウント削除</option></select></label><div class="actions"><a href="/preview">画面・フロー一覧</a><button id="design-reset">初回状態に戻す</button><button id="design-close">閉じる</button></div></section>`;
  document.body.appendChild(host);
  const dialog=host.querySelector<HTMLElement>('#design-dialog')!;
  const toggle=host.querySelector<HTMLButtonElement>('#design-toggle')!;
  function open(value:boolean){dialog.hidden=!value;toggle.setAttribute('aria-expanded',String(value));}
  toggle.onclick=()=>open(dialog.hidden);
  host.querySelector<HTMLButtonElement>('#design-close')!.onclick=()=>{open(false);toggle.focus();};
  host.querySelector<HTMLButtonElement>('#design-confirm')!.onclick=confirmEmail;
  host.querySelector<HTMLButtonElement>('#design-sample')!.onclick=()=>{scenario('offline');window.location.assign('/');};
  host.querySelector<HTMLButtonElement>('#design-reset')!.onclick=()=>{reset();window.location.assign('/');};
  host.querySelectorAll<HTMLInputElement>('input[data-setting]').forEach(input=>input.onchange=()=>configure({[input.dataset.setting!]:input.checked}));
  host.querySelector<HTMLSelectElement>('#design-nfc')!.onchange=event=>configure({nfc:(event.target as HTMLSelectElement).value as 'success'|'cancel'|'error'});
  host.querySelector<HTMLSelectElement>('#design-latency')!.onchange=event=>configure({latency:Number((event.target as HTMLSelectElement).value)});
  host.querySelector<HTMLSelectElement>('#design-fail')!.onchange=event=>configure({failNext:(event.target as HTMLSelectElement).value});
  function update(){
    host.querySelector('#design-status')!.textContent=state.session?'ログイン済み':state.account?(state.account.confirmed?'メール確認済み。ログインできます。':'メール確認待ち'):'未登録・未ログイン';
    host.querySelector<HTMLButtonElement>('#design-confirm')!.disabled=!state.account || state.account.confirmed;
    host.querySelectorAll<HTMLInputElement>('input[data-setting]').forEach(input=>input.checked=Boolean(state.settings[input.dataset.setting as keyof typeof state.settings]));
    host.querySelector<HTMLSelectElement>('#design-nfc')!.value=state.settings.nfc;
    host.querySelector<HTMLSelectElement>('#design-latency')!.value=String(state.settings.latency);
    host.querySelector<HTMLSelectElement>('#design-fail')!.value=state.settings.failNext;
  }
  window.addEventListener('territory-design-change',update);update();
}
if(typeof document!=='undefined') { if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true});else mount(); }
