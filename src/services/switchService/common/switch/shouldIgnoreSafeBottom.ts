import { IGetLocalSwitchOptions } from './types';

export function shouldIgnoreSafeBottom(options: IGetLocalSwitchOptions) {
  return options.userAgent.includes('HLTE556N');
}
