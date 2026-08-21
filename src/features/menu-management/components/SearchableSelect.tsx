import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';

export interface SearchableSelectOption<TValue> {
  value: TValue;
  label: string;
  keywords?: string[];
}

interface SearchableSelectProps<TValue> {
  value: TValue | null;
  options: SearchableSelectOption<TValue>[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  nullOptionLabel?: string;
  disabled?: boolean;
  density?: 'compact' | 'normal';
  onChange: (value: TValue | null) => void;
}

export function SearchableSelect<TValue extends string | number>({
  value,
  options,
  placeholder = 'เลือกรายการ',
  searchPlaceholder = 'ค้นหา...',
  emptyMessage = 'ไม่พบข้อมูลที่ตรงกับคำค้นหา',
  nullOptionLabel,
  disabled = false,
  density = 'compact',
  onChange,
}: SearchableSelectProps<TValue>) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((opt) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    const matchLabel = opt.label.toLowerCase().includes(query);
    const matchKeywords = opt.keywords?.some((k) => k.toLowerCase().includes(query));
    return matchLabel || matchKeywords;
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full text-xs">
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 text-left transition outline-none cursor-pointer ${
          density === 'compact' ? 'h-9 py-1.5' : 'h-10 py-2'
        } ${
          isOpen ? 'border-blue-600 ring-2 ring-blue-500/15' : 'hover:border-slate-300'
        } ${disabled ? 'cursor-not-allowed bg-slate-50 opacity-60' : ''}`}
      >
        <span className={`truncate text-sm ${selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {selectedOption ? selectedOption.label : nullOptionLabel ?? placeholder}
        </span>
        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1.5 w-full min-w-[14rem] max-h-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-900/10">
          <div className="p-2 border-b border-slate-100 flex items-center gap-1.5 bg-slate-50/50">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-xs text-slate-800 outline-none placeholder:text-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <div className="max-h-48 overflow-y-auto p-1 divide-y divide-slate-50">
            {nullOptionLabel && (
              <button
                type="button"
                onClick={() => {
                  onChange(null);
                  setIsOpen(false);
                  setSearch('');
                }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition cursor-pointer ${
                  value === null
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {nullOptionLabel}
              </button>
            )}

            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition cursor-pointer flex items-center justify-between ${
                    value === option.value
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                </button>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-slate-400">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
