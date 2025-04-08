import { localize } from '@/nls';
import { sha256 } from '../crypto/sha256';
import { decodeBase64 } from 'vscf/internal/base/common/buffer';

const ErrorMessage = localize('settings.import.invalidFileFormat', 'Invalid file format');

export function decodePatch(result: string): Uint8Array {
  if (typeof result !== 'string') {
    throw new Error(ErrorMessage);
  }
  const [header, data] = result.split('\n');
  if (!header.startsWith('hbTaskExport_v1')) {
    throw new Error(ErrorMessage);
  }
  const hash = `hbTaskExport_v1:${sha256(data)}`;
  if (hash !== header) {
    throw new Error(ErrorMessage);
  }
  const decodedData = decodeBase64(data);
  return decodedData.buffer;
}
