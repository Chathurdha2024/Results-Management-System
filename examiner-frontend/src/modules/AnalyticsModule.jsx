import React from 'react';
import { Card, Badge } from '../components/ui.jsx';

const AnalyticsModule = () => {
  const passRateValue = 86; // Dynamic value

  const courseStats = [
    { name: 'CS201 Data Structures', avgGpa: '3.42', passRate: 92, status: 'Normal' },
    { name: 'CS203 Database Systems', avgGpa: '2.85', passRate: 74, status: 'Attention' },
    { name: 'CS205 Computer Networks', avgGpa: '2.10', passRate: 45, status: 'Critical' },
  ];

  // Helper for Pass Rate Horizontal Line Color
  const getStatusColor = (value) => {
    if (value >= 85) return 'bg-emerald-500'; // Green for excellent
    if (value >= 70) return 'bg-sky-500';     // Blue for good
    if (value >= 50) return 'bg-amber-500';   // Yellow for warning
    return 'bg-rose-500';                     // Red for critical
  };

  // Distribution Data with specific colors for each GPA bracket
  const distributionData = [
    { range: '0.0 - 1.0', height: 30, color: 'bg-rose-400' },   // Low
    { range: '1.0 - 2.0', height: 50, color: 'bg-amber-400' },  // Below Avg
    { range: '2.0 - 3.0', height: 90, color: 'bg-sky-400' },    // Average
    { range: '3.0 - 3.5', height: 75, color: 'bg-primary-500' },// Good (Purple)
    { range: '3.5 - 4.0', height: 45, color: 'bg-emerald-500' },// Excellent
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pass Rate Overview */}
        <Card title="Batch Performance Overview" subtitle="Average GPA vs Pass Rate">
          <div className="py-4">
            <p className="text-3xl font-bold text-slate-900">3.12</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 font-medium uppercase tracking-wider">Overall Pass Rate</span>
                <span className="font-bold text-slate-900">{passRateValue}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${getStatusColor(passRateValue)}`} 
                  style={{ width: `${passRateValue}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 italic">Color shifts automatically based on percentage</p>
            </div>
          </div>
        </Card>

        {/* Module Insights */}
        <Card title="Module Insights" subtitle="Assigned course health">
          <div className="space-y-3">
            {courseStats.map((course, idx) => (
              <div key={idx} className="flex flex-col gap-1.5 border-b border-slate-50 pb-2 last:border-0">
                <div className="flex items-center justify-between text-xs">
                  <p className="font-semibold text-slate-900">{course.name}</p>
                  <Badge color={course.passRate < 50 ? 'red' : course.passRate < 75 ? 'yellow' : 'green'}>
                    {course.passRate}% Pass
                  </Badge>
                </div>
                {/* Micro progress bar for each course */}
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getStatusColor(course.passRate)}`} 
                    style={{ width: `${course.passRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      
      {/* GPA Distribution Graph */}
      <Card title="GPA Distribution Chart" subtitle="Number of students per GPA bracket">
        <div className="h-48 flex items-end gap-3 px-4 pt-4">
          {distributionData.map((item, i) => (
            <div key={i} className="flex-1 flex flex-col items-center group">
              {/* Data Label on Hover */}
              <span className="text-[10px] font-bold text-slate-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {item.height}%
              </span>
              {/* Bar */}
              <div 
                className={`w-full ${item.color} rounded-t-md transition-all duration-500 hover:brightness-90 cursor-help shadow-sm`} 
                style={{ height: `${item.height}%` }}
                title={`${item.range}: ${item.height}% of students`}
              ></div>
            </div>
          ))}
        </div>
        {/* X-Axis Labels */}
        <div className="flex justify-between border-t border-slate-100 px-4 mt-2 pt-2">
          {distributionData.map((item, i) => (
            <span key={i} className="flex-1 text-center text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
              {item.range}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AnalyticsModule;