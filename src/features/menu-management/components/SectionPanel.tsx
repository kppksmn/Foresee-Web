import React from 'react';

interface SectionPanelProps {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  tone?: 'default' | 'muted' | 'danger';
  density?: 'compact' | 'normal';
  children: React.ReactNode;
}

export const SectionPanel: React.FC<SectionPanelProps> = ({
  title,
  description,
  icon: Icon,
  tone = 'default',
  density = 'compact',
  children,
}) => {
  return (
    <div
      className={`rounded-xl border transition-colors ${
        tone === 'danger'
          ? 'border-rose-200 bg-rose-50/20'
          : tone === 'muted'
            ? 'border-slate-200 bg-slate-50/30'
            : 'border-slate-200 bg-white'
      } ${density === 'compact' ? 'p-4' : 'p-5'}`}
    >
      <div className="mb-3 flex items-start gap-2.5">
        {Icon && (
          <div
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
              tone === 'danger'
                ? 'bg-rose-100 text-rose-600'
                : 'bg-blue-50 text-blue-600'
            }`}
          >
            <Icon size={16} />
          </div>
        )}
        <div>
          <h3
            className={`text-sm font-bold leading-none ${
              tone === 'danger' ? 'text-rose-900' : 'text-slate-900'
            }`}
          >
            {title}
          </h3>
          {description && (
            <p className="mt-1 text-xs text-slate-500 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3">{children}</div>
    </div>
  );
};
