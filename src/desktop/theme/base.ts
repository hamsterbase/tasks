import { DesktopThemeDefinition } from './types';

export const baseDesktopStyles: DesktopThemeDefinition = {
  sidebarContainerStyle: 'p-4 w-full h-full',
  sidebarBackground: 'bg-bg2',
  sidebarLinkActive: 'bg-brand text-white',
  sidebarLinkInactive: 'hover:bg-bg3',
  sidebarIconSize: 'size-4 flex items-center justify-center',
  sidebarItemHeight: 'h-4',
  sidebarItemGap: 'space-y-0.5',
  sidebarItemTextStyle: 'font-medium text-base',
  sidebarItemContainerStyle: 'block px-2 py-1.5 rounded-lg cursor-pointer',
};
