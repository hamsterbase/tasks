import * as CryptoJS from 'crypto-js';

const magicKey = 'hamsterbase_tasks';

export function encryptData(data: string, key: string): string {
  const encrypted = CryptoJS.AES.encrypt(JSON.stringify({ data, magicKey }), key).toString();
  return encrypted;
}

export function decryptData(encryptedData: string, key: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
    const value = JSON.parse(decrypted);
    if (value.magicKey !== magicKey) {
      throw new Error('Invalid data');
    }
    return value.data;
  } catch {
    throw new Error('Invalid data');
  }
}
