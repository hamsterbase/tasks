export interface AboutPlugin {
  showAbout(options?: { showICP?: boolean; displayMode?: string }): Promise<void>;
}
