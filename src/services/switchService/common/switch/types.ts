import { ICheckPlatform } from '@/base/browser/checkPlatform';

export interface IGetLocalSwitchOptions {
  checkPlatform: ICheckPlatform;
  userAgent: string;
}
