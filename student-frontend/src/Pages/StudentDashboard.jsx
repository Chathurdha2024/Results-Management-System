import React from "react";
import { LogOut } from "lucide-react";

const StudentDashboard = () => {
  const handleLogout = () => {
    // Add your logout logic here (e.g., clearing tokens)
    console.log("Logging out...");
    window.location.href = "/login"; // Standard navigation
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans text-slate-700">
      {/* Top Navigation Bar */}
      <header className="bg-white rounded-xl shadow-sm p-4 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div>
            <p className="text-xs text-gray-400">Result Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={24} />
          </button>
        </div>
      </header>
    </div>
  );
};

export default StudentDashboard;
