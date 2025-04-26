export interface DesktopThemeDefinition {
  sidebarBackground: string;
}

export function extendsStyle(key: keyof DesktopThemeDefinition) {
  return `extend::${key}`;
}
