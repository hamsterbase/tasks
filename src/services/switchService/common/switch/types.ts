import { ICheckPlatform } from '@/base/browser/checkPlatform';
import type { AndroidSourceType } from '@/plugins/AndroidSourcePlugin';

export interface IGetLocalSwitchOptions {
  checkPlatform: ICheckPlatform;
  userAgent: string;
  androidSource: AndroidSourceType | null;
}
