import { useLocation, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  FileText, 
  Users, 
  UserCheck, 
  LogOut 
} from 'lucide-react';


// 1. Accept onLogout prop here
const Navbar = ({ onLogout }) => {
  const location = useLocation(); 

  const isActive = (path) => location.pathname === path;
  

  return (
    <nav className="fixed top-0 left-0 w-screen bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-50">

      {/* Brand Logo */}
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-full">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-xl leading-none text-slate-900 tracking-tight text-left">RMS</h1>
          <p className="text-[10px] text-gray-500 uppercase font-medium">Result Management System</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="hidden lg:flex items-center gap-2">
        <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" path="/dashboard" active={isActive("/dashboard")} />
        <NavItem icon={<BookOpen size={18} />} label="Programs" path="/programs" active={isActive("/programs")} />
        <NavItem icon={<Calendar size={18} />} label="Exams" path="/exams" active={isActive("/exams")} />
        <NavItem icon={<FileText size={18} />} label="Results" path="/results" active={isActive("/results")} />
        <NavItem icon={<Users size={18} />} label="Students" path="/students" active={isActive("/students")} />
        <NavItem icon={<UserCheck size={18} />} label="Examiners" path="/examiners" active={isActive("/examiners")} />
      </div>

      {/* Logout */}
      <div className="flex items-center border-l pl-4 ml-2 border-gray-200">
        <button 
          className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 flex items-center gap-2"
          onClick={onLogout} // 2. Call the function passed from App.js
        >
          <LogOut size={24} />
          {/* Optional: Add text label if you want */}
          {/* <span className="font-medium">Logout</span> */}
        </button>
      </div>
    </nav>
  );
};

// NavItem Helper
const NavItem = ({ icon, label, path, active }) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(path)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-blue-100 text-blue-700 font-semibold' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </button>
  );
};

export default Navbar;