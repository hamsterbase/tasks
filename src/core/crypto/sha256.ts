import * as CryptoJS from 'crypto-js';

export function sha256(input: string): string {
  const hash = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
  return hash;
}
