import React from 'react';

const StatCard = ({ label, value, icon, colorClass = 'bg-blue-600' }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 flex overflow-hidden min-w-[220px]">
      
      {/* Left Accent */}
      <div className={`w-1.5 ${colorClass}`} />

      <div className="flex-1 p-4 flex justify-between items-center">
        <div className="space-y-0.5">
          <p className="text-gray-500 text-sm font-medium tracking-tight">
            {label}
          </p>
          <h3 className="text-2xl font-bold text-slate-900">
            {value}
          </h3>
        </div>

        {/* Icon */}
        <div className="text-blue-600 opacity-80 scale-[1.25]">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
