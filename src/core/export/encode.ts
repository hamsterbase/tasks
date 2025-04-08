import { sha256 } from '@/core/crypto/sha256';
import { encodeBase64, VSBuffer } from 'vscf/base/common/buffer';

export function encodePatch(patch: Uint8Array) {
  const base64Data = encodeBase64(VSBuffer.wrap(patch));
  const content = `hbTaskExport_v1:${sha256(base64Data)}\n${base64Data}`;
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(content);
  return {
    content,
    dataStr,
  };
}
