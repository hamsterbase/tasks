import classNames from 'classnames';
import React from 'react';

interface SettingsTitleProps {
  title: string;
  description?: string;
  level?: 1 | 2;
  action?: React.ReactNode;
}

export const SettingsTitle: React.FC<SettingsTitleProps> = ({ title, description, level = 1, action }) => {
  return (
    <div className="flex mb-8">
      <div className="flex flex-col gap-1 flex-1">
        <h2
          className={classNames('font-medium text-t1 leading-5', {
            'text-2xl': level === 1,
            'text-xl': level === 2,
          })}
        >
          {title}
        </h2>
        {description && <p className="text-base font-normal text-t3 leading-5">{description}</p>}
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  );
};
