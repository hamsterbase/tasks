import React from 'react';
import { desktopStyles } from '../../theme/main';

export interface SpaceProps {
  size?: 'medium' | 'large';
}

export const Space: React.FC<SpaceProps> = ({ size = 'medium' }) => {
  const className = size === 'medium' ? desktopStyles.SpaceMedium : desktopStyles.SpaceLarge;

  return <div className={className}></div>;
};
