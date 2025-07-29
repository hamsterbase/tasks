import { formatTheme } from '@/base/common/formatTheme';

export const desktopStyles = {
  sidebarContainerStyle: 'p-4 w-full h-full',
  sidebarBackground: 'bg-bg3',
  sidebarLinkActive: 'bg-brand text-white',
  sidebarLinkInactive: 'hover:bg-bg3',
  sidebarIconSize: 'size-4 flex items-center justify-center',
  sidebarItemHeight: 'h-4',
  sidebarItemGap: 'space-y-0.5',
  sidebarItemTextStyle: 'font-medium text-base',
  sidebarItemContainerStyle: 'block px-2 py-1.5 rounded-lg cursor-pointer',
};

export type DesktopThemeDefinition = typeof desktopStyles;

formatTheme(desktopStyles);
