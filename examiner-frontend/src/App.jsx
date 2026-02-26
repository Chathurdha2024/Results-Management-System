import React, { useState } from "react";
import { PillButton } from "./components/ui.jsx";
import StaffDashboard from "./modules/StaffDashboard.jsx";
import EvaluationModule from "./modules/EvaluationModule.jsx";
import DutyRosterModule from "./modules/ExamScheduleModule.jsx";
import AnalyticsModule from "./modules/AnalyticsModule.jsx";
import ProfileModule from "./modules/ProfileModule.jsx";

const sections = {
  DASHBOARD: "Dashboard",
  EVALUATION: "Result Evaluation",
  DUTY_ROSTER: "Exam Schedule",
  ANALYTICS: "Academic Analytics",
  PROFILE: "Staff Profile",
};

const navItems = [
  { key: sections.DASHBOARD, label: "Dashboard" },
  { key: sections.EVALUATION, label: "Result Evaluation" },
  { key: sections.DUTY_ROSTER, label: "Exam Schedule" },
  { key: sections.ANALYTICS, label: "Academic Analytics" },
  { key: sections.PROFILE, label: "Staff Profile" },
];

const App = () => {
  const [activeSection, setActiveSection] = useState(sections.DASHBOARD);

  const renderSection = () => {
    switch (activeSection) {
      case sections.DASHBOARD:
        return <StaffDashboard />;
      case sections.EVALUATION:
        return <EvaluationModule />;
      case sections.DUTY_ROSTER:
        return <DutyRosterModule />;
      case sections.ANALYTICS:
        return <AnalyticsModule />;
      case sections.PROFILE:
        return <ProfileModule />;
      default:
        return <StaffDashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-semibold italic">
                E
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Examiner Portal
                </p>
                <p className="text-[11px] text-slate-500">
                  Evaluation & Academic System
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-xs font-semibold text-white">
                  RF
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium text-slate-900">
                    Dr. S.W.Weerasinghe
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Staff ID: EMP9420
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-4 flex gap-4">
          <aside className="w-56 shrink-0 hidden md:block">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <PillButton
                  key={item.key}
                  active={activeSection === item.key}
                  icon={item.icon}
                  onClick={() => setActiveSection(item.key)}
                >
                  {item.label}
                </PillButton>
              ))}
            </nav>
          </aside>
          <section className="flex-1">
            <div className="mb-4">
              <h1 className="text-base font-semibold text-slate-900">
                {activeSection}
              </h1>
            </div>
            {renderSection()}
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;
