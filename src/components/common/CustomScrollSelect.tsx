import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown
} from 'lucide-react';

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  options: { label: string; value: string }[];
  openUpward?: boolean;
  disabled?: boolean;
}

export const CustomScrollSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  placeholder,
  options,
  openUpward = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative w-full ${isOpen ? 'z-[100]' : 'z-10'}`} ref={containerRef}>
      {/* Target Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-800 font-medium cursor-pointer disabled:bg-slate-100 disabled:text-slate-600 disabled:cursor-not-allowed"
      >
        <span className={selectedOption ? 'text-slate-800' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={14} className="text-slate-400 shrink-0" />
      </button>

      {/* Controlled Height Scrollable Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute z-[100] left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-xl max-h-36 overflow-y-auto divide-y divide-slate-50 py-1 ${
            openUpward ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`px-3 py-1.5 text-xs cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                opt.value === value ? 'bg-blue-50 font-bold text-blue-600' : 'text-slate-700'
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
