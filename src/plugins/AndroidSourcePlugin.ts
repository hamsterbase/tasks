import { registerPlugin } from '@capacitor/core';

export type AndroidSourceType = 'play' | 'xiaomi';

export interface AndroidSourcePlugin {
  getSource(): Promise<{ source: AndroidSourceType }>;
}

const AndroidSource = registerPlugin<AndroidSourcePlugin>('AndroidSource');

export default AndroidSource;
