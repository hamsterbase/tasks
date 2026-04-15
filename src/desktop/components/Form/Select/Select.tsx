import { ChevronDownIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import { DesktopMenuController } from '@/desktop/overlay/desktopMenu/DesktopMenuController';
import { useService } from '@/hooks/use-service';
import { IInstantiationService } from 'vscf/platform/instantiation/common';
import React, { useRef } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ value, onChange, options, className = '' }) => {
  const selectRef = useRef<HTMLDivElement>(null);
  const instantiationService = useService(IInstantiationService);

  const selectedOption = options.find((option) => option.value === value);

  const handleToggle = () => {
    if (selectRef.current) {
      const rect = selectRef.current.getBoundingClientRect();

      const menuConfig = options.map((option) => ({
        label: option.label,
        checked: option.value === value,
        onSelect: () => onChange(option.value),
      }));

      DesktopMenuController.create(
        {
          menuConfig,
          x: rect.right,
          y: rect.bottom,
          placement: 'bottom-end',
        },
        instantiationService
      );
    }
  };

  return (
    <div ref={selectRef} className={`${desktopStyles.SelectContainer} ${className}`}>
      <button
        type="button"
        className="flex min-w-32 cursor-pointer items-center gap-2 rounded-md border border-line-light bg-bg2 px-2 py-1 text-xs text-t1 transition-colors"
        onClick={handleToggle}
      >
        <span className="flex-1 truncate text-left">{selectedOption?.label || ''}</span>
        <ChevronDownIcon
          absoluteStrokeWidth
          className="size-3.5 flex-shrink-0 text-t3 transition-transform"
          style={{ strokeWidth: 2 }}
        />
      </button>
    </div>
  );
};
