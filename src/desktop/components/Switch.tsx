import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled = false }) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <div className={`relative w-10 h-6 rounded-full transition-colors ${checked ? 'bg-brand' : 'bg-bg2'}`}>
        <div
          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${
            checked ? 'left-5' : 'left-1'
          }`}
        />
      </div>
    </label>
  );
};
