import React from 'react';
import { Check } from 'lucide-react';

interface MenuManagementPermissionToggleProps {
  active: boolean;
  label: string;
  description: string;
  tone?: 'brand' | 'accent';
  disabled?: boolean;
  onClick: () => void;
}

export const MenuManagementPermissionToggle: React.FC<MenuManagementPermissionToggleProps> = ({
  active,
  label,
  description,
  tone = 'brand',
  disabled = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl border px-3.5 py-2.5 text-left transition cursor-pointer ${
        active
          ? tone === 'accent'
            ? 'border-2 border-amber-500 bg-amber-50 shadow-xs shadow-amber-500/10'
            : 'border-2 border-blue-600 bg-blue-50/70 shadow-xs shadow-blue-500/10'
          : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50/60'
      } ${disabled ? 'cursor-not-allowed opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-900">{label}</p>
          <p className="mt-0.5 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
        <span
          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
            active
              ? tone === 'accent'
                ? 'border-amber-500 bg-amber-500 text-white'
                : 'border-blue-600 bg-blue-600 text-white'
              : 'border-slate-200 bg-white text-transparent'
          }`}
        >
          <Check className="h-3.5 w-3.5" />
        </span>
      </div>
    </button>
  );
};
