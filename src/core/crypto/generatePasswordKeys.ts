import { generateUuid } from 'vscf/base/common/uuid';
import { sha256 } from './sha256';

export interface PasswordKeys {
  salt: string;
  accessKey: string;
  encryptionKey: string;
}

/**
 * 生成密码密钥
 * @param password 密码
 * @param _salt 盐
 * @returns 密码密钥
 */
export function generatePasswordKeys(password: string, _salt?: string): PasswordKeys {
  const salt = _salt || generateUuid();

  let accessKey = password + salt;
  let encryptionKey = salt + password;

  for (let i = 0; i < 100; i++) {
    accessKey = sha256(accessKey + salt);
    encryptionKey = sha256(salt + encryptionKey);
  }

  return {
    salt,
    accessKey,
    encryptionKey,
  };
}
