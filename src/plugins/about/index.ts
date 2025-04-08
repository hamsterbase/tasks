import { registerPlugin } from '@capacitor/core';
import { AboutPlugin } from './definitions';
import { AboutWeb } from './web';

const About = registerPlugin<AboutPlugin>('About', {
  web: () => new AboutWeb(),
});

export * from './definitions';
export { About };
