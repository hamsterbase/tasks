export interface DesktopThemeDefinition {
  sidebarContainerStyle: string;
  sidebarBackground: string;
  sidebarLinkActive: string;
  sidebarLinkInactive: string;
  sidebarIconSize: string;
  sidebarItemHeight: string;
  sidebarItemGap: string;
  sidebarItemTextStyle: string;
  sidebarItemContainerStyle: string;
}

export function extendsStyle(key: keyof DesktopThemeDefinition) {
  return `extend::${key}`;
}
