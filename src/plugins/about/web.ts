import { AboutPlugin } from './definitions';

export class AboutWeb implements AboutPlugin {
  async showAbout(): Promise<void> {
    // Web implementation - do nothing
    return Promise.resolve();
  }
}
