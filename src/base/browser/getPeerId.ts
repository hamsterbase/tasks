import { LoroDoc } from 'loro-crdt';
import { checkPlatform } from './checkPlatform';
import { Preferences } from '@capacitor/preferences';

export async function getPeerId(): Promise<`${number}`> {
  if (checkPlatform().isNative) {
    const peerId = (await Preferences.get({ key: 'peerId' })) as { value: `${number}` };
    if (peerId.value) {
      return peerId.value;
    }
    const doc = new LoroDoc();
    await Preferences.set({ key: 'peerId', value: doc.peerIdStr });
    return doc.peerIdStr;
  }
  const peerId: string | null = sessionStorage.getItem('peerId');
  if (peerId) {
    return peerId as `${number}`;
  }
  const doc = new LoroDoc();
  sessionStorage.setItem('peerId', doc.peerIdStr);
  return doc.peerIdStr as `${number}`;
}

export async function resetPeerId() {
  if (checkPlatform().isNative) {
    await Preferences.remove({ key: 'peerId' });
  } else {
    sessionStorage.removeItem('peerId');
  }
}
