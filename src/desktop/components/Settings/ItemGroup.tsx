import React, { ReactNode } from 'react';
import { desktopStyles } from '@/desktop/theme/main';

export interface ItemGroupProps {
  children: ReactNode;
}

export const ItemGroup: React.FC<ItemGroupProps> = ({ children }) => {
  return <div className={desktopStyles.SettingsItemGroupContainer}>{children}</div>;
};
