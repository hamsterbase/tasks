import { desktopStyles } from '@/desktop/theme/main';
import React, { useEffect, useRef } from 'react';

interface TimeScrollColumnProps {
  values: number[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  formatValue: (value: number) => string;
  className?: string;
}

export const TimeScrollColumn: React.FC<TimeScrollColumnProps> = ({
  values,
  selectedValue,
  onValueChange,
  formatValue,
  className = '',
}) => {
  const selectedButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (selectedButtonRef.current) {
      selectedButtonRef.current.scrollIntoView({
        block: 'center',
      });
    }
  }, [selectedValue]);

  return (
    <div className={`${desktopStyles.TimePickerScrollColumn} ${className}`}>
      {values.map((value) => (
        <button
          key={value}
          ref={value === selectedValue ? selectedButtonRef : null}
          onClick={() => onValueChange(value)}
          className={`${desktopStyles.TimePickerScrollItem} ${
            value === selectedValue ? desktopStyles.TimePickerScrollItemSelected : ''
          }`}
        >
          {formatValue(value)}
        </button>
      ))}
    </div>
  );
};
