import { ChevronDownIcon } from '@/components/icons';
import { desktopStyles } from '@/desktop/theme/main';
import React, { useEffect, useRef, useState } from 'react';

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
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className={`${desktopStyles.SelectContainer} ${className}`}>
      <div className={desktopStyles.SelectTrigger} onClick={() => setIsOpen(!isOpen)}>
        <span className={desktopStyles.SelectTriggerText}>{selectedOption?.label || ''}</span>
        <ChevronDownIcon
          className={`${desktopStyles.SelectTriggerIcon} ${isOpen ? desktopStyles.SelectTriggerIconOpen : ''}`}
          size={20}
        />
      </div>
      {isOpen && (
        <div className={desktopStyles.SelectDropdown}>
          {options.map((option) => (
            <div key={option.value} className={desktopStyles.SelectOption} onClick={() => handleSelect(option.value)}>
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
