import { Platform } from 'react-native';
export async function readTag(): Promise<string> {
  if (Platform.OS === 'web') throw new Error('NFCはiOS・Androidの実機で利用してください。');
  const { default: manager, NfcTech, Ndef } = await import('react-native-nfc-manager');
  if (!(await manager.isSupported())) throw new Error('この端末はNFCに対応していません。');
  await manager.start();
  try {
    await manager.requestTechnology(NfcTech.Ndef, { alertMessage: '場所のNFCタグにタッチしてください' });
    const tag = await manager.getTag();
    const record = tag?.ndefMessage?.find(r => Ndef.isType(r, Ndef.TNF_WELL_KNOWN, Ndef.RTD_TEXT));
    if (!record) throw new Error('NFCタグにTextレコードの番号がありません。');
    const value = Ndef.text.decodePayload(Uint8Array.from(record.payload)).trim();
    if (value.length < 1 || value.length > 200) throw new Error('タグ番号の形式が不正です。');
    return value;
  } finally { await manager.cancelTechnologyRequest().catch(() => undefined); }
}
