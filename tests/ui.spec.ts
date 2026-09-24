import { test, expect } from '@playwright/test';

test('connection, ghost mode, scan and exit work without backend requests', async ({ page }) => {
  const errors: string[] = []; const external: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:3100')) external.push(request.url()); });
  await page.goto('/');
  await expect(page.getByText('ステッカーにタッチ')).toBeVisible();
  await expect(page.getByRole('button', { name: '街をスキャン' })).toBeDisabled();
  await page.getByRole('button', { name: 'NFCタグを読み取って参加' }).click();
  await expect(page.getByAltText('読み込み中')).toBeVisible();
  await expect(page.getByText('オンラインです')).toBeVisible();
  await page.getByRole('switch', { name: 'ゴーストモード' }).click();
  await expect(page.getByRole('switch')).toBeChecked();
  await expect(page.getByText('位置情報を隠しています')).toBeVisible();
  await page.getByRole('button', { name: '街をスキャン' }).click();
  await page.getByRole('button', { name: 'スキャンする' }).click();
  await expect(page.getByRole('button', { name: '位置情報の応答を待っています…' })).toBeDisabled();
  await expect(page.locator('.scan-row')).toHaveCount(2);
  await page.getByRole('link', { name: '戻る' }).click();
  await expect(page.getByText('位置情報を隠しています')).toBeVisible();
  await page.getByRole('button', { name: 'NFCタグを読み取って退出' }).click();
  await expect(page.getByText('ステッカーにタッチ')).toBeVisible();
  expect(errors).toEqual([]); expect(external).toEqual([]);
});

test('registration, login, account and guarded deletion', async ({ page }) => {
  await page.goto('/register');
  await page.getByRole('textbox', { name: 'メールアドレス' }).fill('designer@example.test');
  await page.getByLabel('パスワード', { exact: true }).fill('preview123');
  await page.getByRole('button', { name: '新規登録', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('確認メールを送信しました');
  await page.getByRole('button', { name: 'ログインへ' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('heading', { name: 'おかえりなさい' })).toBeVisible();
  await page.getByRole('textbox', { name: 'メールアドレス' }).fill('designer@example.test');
  await page.getByLabel('パスワード', { exact: true }).fill('preview123');
  await page.getByRole('button', { name: 'ログイン', exact: true }).click();
  await page.getByRole('button', { name: 'アカウント', exact: true }).click();
  await expect(page.getByText('designer@example.test')).toBeVisible();
  await page.getByRole('button', { name: 'アカウントを削除' }).click();
  await expect(page.getByRole('button', { name: '完全に削除する' })).toBeDisabled();
  await page.getByRole('textbox', { name: '削除の確認' }).fill('削除');
  await page.getByRole('button', { name: '完全に削除する' }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test('all catalog states render without overflow at narrow mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/preview');
  const links = await page.locator('.catalog-group a').evaluateAll(nodes => nodes.map(node => node.getAttribute('href')!));
  expect(links.length).toBeGreaterThan(20);
  for (const href of links) {
    await page.goto(href);
    await expect(page.locator('.phone')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), href).toBe(true);
    for (const img of await page.locator('img').all()) expect(await img.evaluate(node => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  expect(errors).toEqual([]);
});

test('logout returns to login and clears the simulated session', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'NFCタグを読み取って参加' }).click();
  await expect(page.getByText('オンラインです')).toBeVisible();
  await page.getByRole('button', { name: 'アカウント', exact: true }).click();
  await page.getByRole('button', { name: 'ログアウト', exact: true }).click();
  await page.getByRole('button', { name: 'ログアウトする' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.goto('/');
  await expect(page.getByText('ステッカーにタッチ')).toBeVisible();
});

