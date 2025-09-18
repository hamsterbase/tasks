import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

// Utility function to generate MD5 hash
export function getMD5Hash(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex');
}

// Utility function to generate SHA256 hash
export function getSHA256Hash(data: unknown): string {
  const content = typeof data === 'string' ? data : JSON.stringify(data);
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Utility function to validate key format (must be SHA256 hash)
export function isValidKey(key: string): boolean {
  return /^[a-f0-9]{64}$/.test(key);
}

// Types for request bodies
export interface RequestBody {
  folder?: string;
  key?: string;
  data?: string;
}

// Generic validation function
export function validateParams(body: RequestBody, requiredKeys: string[]): { error?: string } & RequestBody {
  const result: { [key: string]: unknown } = {};

  // Check required parameters
  for (const key of requiredKeys) {
    const value = body[key as keyof RequestBody];

    if (key === 'folder' && !value) {
      return { error: 'folder parameter is required' };
    }

    if (key === 'key') {
      if (!value) {
        return { error: 'key parameter is required' };
      }
      if (!isValidKey(value as string)) {
        return { error: 'key must be a valid SHA256 hash' };
      }
    }

    if (key === 'data' && typeof value !== 'string') {
      return { error: 'data parameter must be a string' };
    }

    result[key] = value;
  }

  return result;
}

// Utility function to get folder path
export function getFolderPath(storagePath: string, folder: string): string {
  const hashedFolder = getMD5Hash(folder);
  return path.join(storagePath, hashedFolder);
}

// Ensure directory exists
export async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}
