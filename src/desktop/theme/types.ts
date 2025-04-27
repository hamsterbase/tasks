export interface DesktopThemeDefinition {
  sidebarBackground: string;
  sidebarLinkActive: string;
  sidebarLinkInactive: string;
  sidebarIconSize: string;
  sidebarItemHeight: string;
  sidebarItemTextStyle: string;
  sidebarItemContainerStyle: string;
}

export function extendsStyle(key: keyof DesktopThemeDefinition) {
  return `extend::${key}`;
}
