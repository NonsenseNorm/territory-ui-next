import { state,delay } from './model';
export async function readTag() {await delay(false); if(state.settings.nfc==='cancel') throw new Error('NFCの読み取りをキャンセルしました。'); if(state.settings.nfc==='error') throw new Error('NFCタグを読み取れませんでした。'); return 'DESIGN-TAG-001';}

