import React, { Children, ReactNode } from 'react';
import { desktopStyles } from '@/desktop/theme/main';

export interface ItemGroupProps {
  children: ReactNode;
}

export const ItemGroup: React.FC<ItemGroupProps> = ({ children }) => {
  const childArray = Children.toArray(children);

  if (childArray.length === 0) {
    return null;
  }

  return (
    <div className={desktopStyles.SettingsItemGroupContainer}>
      {childArray.map((child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < childArray.length - 1 && <div className={desktopStyles.SettingsItemGroupDivider}></div>}
        </React.Fragment>
      ))}
    </div>
  );
};
