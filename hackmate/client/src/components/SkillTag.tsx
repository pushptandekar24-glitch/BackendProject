import React from 'react';
import { X } from 'lucide-react';

interface SkillTagProps {
  label: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
  variant?: 'indigo' | 'slate' | 'violet';
}

export const SkillTag: React.FC<SkillTagProps> = ({
  label,
  onRemove,
  size = 'sm',
  variant = 'indigo',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'text-xs px-2.5 py-1'
      : 'text-sm px-3 py-1.5';

  const variantClasses = {
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200/60 hover:bg-indigo-100/70',
    violet: 'bg-violet-50 text-violet-700 border-violet-200/60 hover:bg-violet-100/70',
    slate: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/70',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border transition-colors ${sizeClasses} ${variantClasses}`}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-1.5 text-indigo-400 hover:text-indigo-800 focus:outline-none"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};

