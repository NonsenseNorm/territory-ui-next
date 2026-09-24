import {test,expect,type Page} from '@playwright/test';
async function tools(page:Page) {await page.getByRole('button',{name:'デザイン操作',exact:true}).click();}
async function close(page:Page) {await page.getByRole('button',{name:'閉じる',exact:true}).click();}
async function start(page:Page,label='ログイン済み・NFC未参加') {await page.goto('/preview');await page.getByRole('button',{name:label+' →',exact:true}).click();}

test('real auth guard, registration, confirmation, login, persistence and logout',async({page})=>{
  const external:string[]=[];const errors:string[]=[];
  page.on('request',request=>{if(!request.url().startsWith('http://127.0.0.1:3110'))external.push(request.url());});
  page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/account');await expect(page).toHaveURL(/\/login$/);
  await page.getByRole('button',{name:'新規登録へ',exact:true}).click();
  await page.getByLabel('メールアドレス',{exact:true}).fill('new@example.test');
  await page.getByLabel('パスワード',{exact:true}).fill('preview123');
  await page.getByRole('button',{name:'新規登録',exact:true}).click();
  await expect(page.getByText(/確認メールを送信しました/)).toBeVisible();
  await page.getByRole('button',{name:'ログインへ',exact:true}).click();await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('メールアドレス',{exact:true}).fill('new@example.test');
  await page.getByLabel('パスワード',{exact:true}).fill('preview123');
  await page.getByRole('button',{name:'ログイン',exact:true}).click();
  await expect(page.getByText('メールアドレスの確認が完了していません。')).toBeVisible();
  await tools(page);await page.getByRole('button',{name:'確認メールを開いたことにする',exact:true}).click();await close(page);
  await page.getByRole('button',{name:'ログイン',exact:true}).click();
  await expect(page.getByText('ステッカーにタッチ')).toBeVisible();
  await page.reload();await expect(page.getByText('ステッカーにタッチ')).toBeVisible();
  await page.getByRole('button',{name:'アカウント',exact:true}).click();await expect(page.getByText('new@example.test')).toBeVisible();
  await page.getByRole('button',{name:'ログアウト',exact:true}).click();
  await page.getByRole('button',{name:'戻る',exact:true}).click();await expect(page).toHaveURL(/\/account$/);
  await page.getByRole('button',{name:'ログアウト',exact:true}).click();await page.getByRole('button',{name:'ログアウトする',exact:true}).click();
  await expect(page).toHaveURL(/\/login$/);await page.goto('/account');await expect(page).toHaveURL(/\/login$/);
  expect(external).toEqual([]);expect(errors).toEqual([]);
});

test('NFC failure retry, join, ghost, scan and original boundary exit logic',async({page})=>{
  await start(page);
  await tools(page);await page.locator('#design-fail').selectOption('nfc');await close(page);
  await page.getByRole('button',{name:'NFCタグを読み取って参加',exact:true}).click();
  await expect(page.getByText('通信に失敗しました。再試行してください。')).toBeVisible();
  await page.getByRole('button',{name:'NFCタグを読み取って参加',exact:true}).click();
  await expect(page.getByText('オンラインです')).toBeVisible({timeout:10000});
  await page.getByRole('switch',{name:'ゴーストモード'}).click();await expect(page.getByText('位置情報を隠しています')).toBeVisible();
  await page.getByRole('button',{name:'街をスキャン',exact:true}).click();await page.getByRole('button',{name:'スキャンする',exact:true}).click();
  await expect(page.getByText('サンプルカフェ')).toBeVisible({timeout:12000});
  await page.goBack();await expect(page.getByText('位置情報を隠しています')).toBeVisible();
  await tools(page);await page.getByLabel('場所の範囲外へ移動',{exact:true}).check();await close(page);
  await expect(page.getByText('ステッカーにタッチ')).toBeVisible({timeout:15000});
  await expect(page.getByRole('button',{name:'街をスキャン',exact:true})).toBeDisabled();
});

test('original delete confirmation, failure, retry and signed-out redirect',async({page})=>{
  await start(page,'削除確認');
  await expect(page.getByRole('button',{name:'完全に削除する',exact:true})).toBeDisabled();
  await page.getByLabel('削除の確認',{exact:true}).fill('削除');
  await tools(page);await page.locator('#design-fail').selectOption('delete');await close(page);
  await page.getByRole('button',{name:'完全に削除する',exact:true}).click();await expect(page.getByText('通信に失敗しました。再試行してください。')).toBeVisible();
  await page.getByRole('button',{name:'完全に削除する',exact:true}).click();await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel('メールアドレス',{exact:true}).fill('designer@example.test');await page.getByLabel('パスワード',{exact:true}).fill('preview123');
  await page.getByRole('button',{name:'ログイン',exact:true}).click();await expect(page.getByText('メールアドレスまたはパスワードが正しくありません。')).toBeVisible();
});
