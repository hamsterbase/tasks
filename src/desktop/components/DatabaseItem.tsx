import { localize } from '@/nls';
import React from 'react';
import { SettingButton } from './Settings/Button/Button';

interface DatabaseItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isCurrent?: boolean;
  actionButtons?: React.ReactNode;
  properties?: Array<{
    label: string;
    value: string;
  }>;
  onClick?: () => void;
}

export const DatabaseItem: React.FC<DatabaseItemProps> = ({
  icon,
  title,
  description,
  isCurrent = false,
  actionButtons,
  properties,
  onClick,
}) => {
  const shProperties = isCurrent && properties && properties.length > 0;

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Main row */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1">
          {/* Icon wrapper */}
          <div className="w-11 h-11 bg-bg3 rounded-lg flex items-center justify-center flex-shrink-0">
            <div className="size-5 flex items-center justify-center">{icon}</div>
          </div>

          {/* Content */}
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2 h-6">
              <span className="text-base font-medium text-t1 leading-6">{title}</span>
              {isCurrent && <span className="text-sm font-normal text-brand leading-[18px]">当前数据库</span>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-normal text-t3 leading-[18px]">{description}</span>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {isCurrent && actionButtons && <div className="flex items-center gap-2 shrink-0">{actionButtons}</div>}
        {!isCurrent && (
          <SettingButton variant="text" size="small" inline onClick={onClick} color="primary">
            {localize('database.switch', 'Switch to Database')}
          </SettingButton>
        )}
      </div>

      {/* Properties section - only shown when current */}
      {shProperties && (
        <div className="shrink-0">
          {properties.map((prop, index) => (
            <div key={index} className="flex flex-col gap-1 h-[46px] justify-center">
              <div className="text-base font-medium text-t1 leading-6">{prop.label}</div>
              <div className="text-sm font-normal text-t3 leading-[18px]">{prop.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
