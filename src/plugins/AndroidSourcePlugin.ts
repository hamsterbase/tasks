import { registerPlugin } from '@capacitor/core';

export interface AndroidSourcePlugin {
  getSource(): Promise<{ source: string }>;
}

const AndroidSource = registerPlugin<AndroidSourcePlugin>('AndroidSource');

export default AndroidSource;
