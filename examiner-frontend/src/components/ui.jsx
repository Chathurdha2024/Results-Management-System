import React from 'react';

export const Card = ({ title, subtitle, children, actions }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
    <div className="text-sm text-slate-700">{children}</div>
  </div>
);

export const Badge = ({ color = 'slate', children }) => {
  const colorMap = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-100 text-emerald-700',
    red: 'bg-rose-100 text-rose-700',
    yellow: 'bg-amber-100 text-amber-700',
    blue: 'bg-sky-100 text-sky-700',
    purple: 'bg-violet-100 text-violet-700',
  };
  return (
    <span
      className={
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ' +
        (colorMap[color] || colorMap.slate)
      }
    >
      {children}
    </span>
  );
};

export const PillButton = ({ active, icon, children, onClick }) => (
  <button
    onClick={onClick}
    className={
      'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ' +
      (active
        ? 'bg-primary-50 text-primary-700 border border-primary-100'
        : 'text-slate-600 hover:bg-slate-100')
    }
  >
    <span className="text-lg">{icon}</span>
    <span className="truncate">{children}</span>
  </button>
);

