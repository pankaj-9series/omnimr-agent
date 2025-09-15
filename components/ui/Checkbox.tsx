import React from 'react';
import CheckIcon from '../icons/CheckIcon';

interface CheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({ label, name, checked, onChange, disabled = false, className = '' }) => {
  const id = `checkbox-${name}`;
  
  return (
    <label htmlFor={id} className={`flex items-center text-sm group ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'} ${className}`}>
      <div className="relative flex items-center">
        <input
          id={id}
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="peer sr-only" // Hide the default checkbox
        />
        <div className={`w-5 h-5 bg-white border-2 rounded-md flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          disabled ? 'border-slate-200 bg-slate-100' : 'border-slate-300 group-hover:border-sky-500 peer-checked:bg-sky-600 peer-checked:border-sky-600'
        }`}>
          <CheckIcon className={`w-3.5 h-3.5 text-white transition-opacity duration-200 ${checked ? 'opacity-100' : 'opacity-0'}`} />
        </div>
      </div>
      {label && <span className={`ml-3 ${disabled ? 'text-slate-500' : 'text-slate-700 group-hover:text-slate-900'}`}>{label}</span>}
    </label>
  );
};

export default Checkbox;
