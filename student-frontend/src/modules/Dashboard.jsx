import React, { useState } from 'react';
import { Card, Badge } from '../components/ui.jsx';

const Dashboard = () => {
  const [showTimetable, setShowTimetable] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Focus: Upcoming Exams
  const upcomingExams = [
    { subject: 'Data Structures', date: '15 Mar 2026', venue: 'Hall A1', session: 'Morning' },
    { subject: 'Operating Systems', date: '18 Mar 2026', venue: 'Hall B3', session: 'Afternoon' },
  ];

  // Focus: CA Marks Status
  const caMarksStatus = [
    { subject: 'Database Systems', component: 'Mid-Term', status: 'Released' },
    { subject: 'Computer Networks', component: 'Lab Assessment', status: 'Pending' },
    { subject: 'Software Engineering', component: 'Viva Voce', status: 'Released' },
  ];

  // Focus: Results and Exam related alerts
  const notifications = [
    { type: 'Result', title: 'Semester 3 Final Results Released', time: '2h ago' },
    { type: 'CA', title: 'Data Structures CA Marks Published', time: '5h ago' },
    { type: 'Exam', title: 'Hall Tickets available for download', time: '1 day ago' },
    { type: 'Exam', title: 'Updated Exam Schedule for March 2026', time: '2 days ago' },
  ];

  const fullTimetableData = [
    { id: 1, date: '15 Mar 2026', time: '09:00 AM - 12:00 PM', code: 'CS201', subject: 'Data Structures', venue: 'Hall A1' },
    { id: 2, date: '18 Mar 2026', time: '01:30 PM - 04:30 PM', code: 'CS202', subject: 'Operating Systems', venue: 'Hall B3' },
    { id: 3, date: '21 Mar 2026', time: '09:00 AM - 11:00 AM', code: 'CS203', subject: 'Database Systems', venue: 'Lab 1' },
    { id: 4, date: '24 Mar 2026', time: '10:00 AM - 01:00 PM', code: 'CS204', subject: 'Computer Networks', venue: 'Hall A2' },
  ];

  const latestResults = {
    semester: 'Semester 3 (Fall 2025)',
    sgpa: 3.84,
    cgpa: 3.72,
    creditsEarned: 18,
    courses: [
      { code: 'CS201', subject: 'Data Structures', credits: 4, grade: 'A+' },
      { code: 'CS202', subject: 'Operating Systems', credits: 4, grade: 'A' },
      { code: 'CS203', subject: 'Database Systems', credits: 3, grade: 'B+' },
      { code: 'MA201', subject: 'Linear Algebra', credits: 3, grade: 'A-' },
    ]
  };

  // Static student info for the result sheet display
  const studentInfo = {
    name: "Alex Johnson",
    id: "STU-2024-089",
    degree: "B.Sc. Computer Science",
    status: "Good Standing"
  };

  const getGradeStyle = (grade) => {
    if (grade.startsWith('A')) return 'bg-green-100 text-green-700 border-green-200';
    if (grade.startsWith('B')) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (grade.startsWith('C')) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    if (grade.startsWith('D') || grade.startsWith('F')) return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <div className="space-y-6 relative">
      {/* --- TOP PERFORMANCE STATS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cumulative GPA</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-900">3.72</p>
            <Badge color="green">Academic Excellence</Badge>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Degree Completion</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-slate-900">70%</p>
            <p className="text-xs text-slate-500 font-medium">84 / 120 Credits</p>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div className="h-full w-7/12 rounded-full bg-blue-500 shadow-sm" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Upcoming Exam Session</p>
          <div className="mt-2 flex gap-8 text-sm">
            <div>
              <p className="text-2xl font-bold text-slate-900">Mar 15</p>
              <p className="text-xs text-slate-500 font-bold uppercase">First Paper</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">02</p>
              <p className="text-xs text-slate-500 font-bold uppercase">Papers Left</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAIN DASHBOARD GRID --- */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        
        {/* Upcoming Exams Section */}
        <Card title="Exam Schedule" subtitle="Next scheduled papers">
          <div className="space-y-3">
            {upcomingExams.map((exam, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all">
                <div>
                  <p className="text-sm font-bold text-slate-900">{exam.subject}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{exam.date} • {exam.venue}</p>
                </div>
                <Badge color="red">{exam.session}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* CA Marks Status Section */}
        <Card title="CA Marks Status" subtitle="Continuous Assessment Releases">
          <div className="space-y-3">
            {caMarksStatus.map((ca, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                <div>
                  <p className="text-sm font-bold text-slate-900">{ca.subject}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{ca.component}</p>
                </div>
                <Badge color={ca.status === 'Released' ? 'green' : 'yellow'}>{ca.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* System Notifications Section */}
        <Card title="Result Alerts" subtitle="Official Release Dates">
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {notifications.map((n, idx) => (
              <div key={idx} className="flex items-start justify-between gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors border-l-2 border-slate-100 hover:border-primary">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{n.time}</p>
                </div>
                <Badge color={n.type === 'Result' ? 'green' : n.type === 'Exam' ? 'red' : 'yellow'}>{n.type}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* --- QUICK ACTIONS --- */}
      <Card title="Academic Tools" subtitle="Access detailed reports">
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setShowTimetable(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm transition-all"
          >
            <span>📅</span> Full Exam Timetable
          </button>
          
          <button 
            onClick={() => setShowResults(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-white border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all"
          >
            <span>📊</span> Semester Result Sheets
          </button>
        </div>
      </Card>

      {/* --- EXAM TIMETABLE MODAL --- */}
      {showTimetable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b bg-slate-50/50 rounded-t-2xl">
              <h2 className="text-xl font-bold text-slate-900">Official Exam Timetable</h2>
              <button onClick={() => setShowTimetable(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="p-4 rounded-l-lg font-bold">DATE</th>
                    <th className="p-4 font-bold">TIME</th>
                    <th className="p-4 font-bold">COURSE</th>
                    <th className="p-4 rounded-r-lg font-bold">VENUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fullTimetableData.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/30">
                      <td className="p-4 font-bold text-slate-900">{item.date}</td>
                      <td className="p-4 text-slate-600">{item.time}</td>
                      <td className="p-4 font-semibold text-slate-800">{item.subject}</td>
                      <td className="p-4"><Badge color="blue">{item.venue}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- UPDATED RESULTS MODAL --- */}
      {showResults && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-sm">U</div>
                <h2 className="text-lg font-bold text-slate-900">Academic Transcript View</h2>
              </div>
              <button onClick={() => setShowResults(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto bg-slate-100/50 p-6 md:p-10">
              
              {/* Paper / Sheet Container */}
              <div className="mx-auto max-w-3xl bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
                
                {/* Official Header Section */}
                <div className="p-8 border-b border-slate-100">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">OFFICIAL RESULT SHEET</p>
                      <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{latestResults.semester}</h1>
                      <p className="text-sm text-slate-500 mt-1">Date of Issue: 28 Feb 2026</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-3 py-1 rounded text-xs font-bold border ${latestResults.sgpa >= 3.5 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {latestResults.sgpa >= 3.5 ? 'DISTINCTION' : 'PASS'}
                      </div>
                    </div>
                  </div>

                  {/* Student Details Grid */}
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50/50 rounded-lg border border-slate-100">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Student Name</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{studentInfo.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Student ID</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">{studentInfo.id}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Degree</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5 truncate">{studentInfo.degree}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                      <p className="text-sm font-semibold text-green-700 mt-0.5">{studentInfo.status}</p>
                    </div>
                  </div>
                </div>

                {/* Results Table */}
                <div className="p-0">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-white border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-8 py-4 font-semibold w-24">Code</th>
                        <th className="px-4 py-4 font-semibold">Course Title</th>
                        <th className="px-4 py-4 font-semibold text-center w-24">Credits</th>
                        <th className="px-8 py-4 font-semibold text-right w-24">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {latestResults.courses.map((course, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="px-8 py-4 font-medium text-slate-500">{course.code}</td>
                          <td className="px-4 py-4 font-bold text-slate-800">{course.subject}</td>
                          <td className="px-4 py-4 text-center text-slate-600">{course.credits}</td>
                          <td className="px-8 py-4 text-right">
                             <span className={`inline-block w-8 text-center py-0.5 rounded text-xs font-bold border ${getGradeStyle(course.grade)}`}>
                                {course.grade}
                             </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {/* Table Footer / Summary Row */}
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                      <tr>
                        <td colSpan="2" className="px-8 py-4 text-right font-bold text-slate-500 uppercase text-xs">Term Totals</td>
                        <td className="px-4 py-4 text-center font-bold text-slate-900 text-base">{latestResults.creditsEarned}</td>
                        <td className="px-8 py-4 text-right">
                           <div className="flex flex-col items-end">
                              <span className="text-[10px] text-slate-400 font-bold uppercase">SGPA</span>
                              <span className="text-lg font-black text-slate-900 leading-none">{latestResults.sgpa}</span>
                           </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              <p className="text-center text-slate-400 text-xs mt-6">
                This is a computer-generated document. No signature is required.
              </p>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 border-t border-slate-200 bg-white flex justify-end items-center gap-3">
                <button className="text-slate-600 hover:text-slate-900 font-semibold text-sm px-4 py-2 transition-colors">
                  Report Issue
                </button>
                <button className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-50 transition-all shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download PDF
                </button>
                <button onClick={() => setShowResults(false)} className="bg-slate-900 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-slate-800 transition-all shadow-sm">
                  Done
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;