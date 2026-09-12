import { checkPlatform } from '@/base/browser/checkPlatform';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function triggerCompletionHaptic(): void {
  if (!checkPlatform().isNative) {
    return;
  }
  void Haptics.impact({ style: ImpactStyle.Light }).catch(() => {
    // Haptics are confirmation-only feedback; unsupported hardware must not block the status update.
  });
}
