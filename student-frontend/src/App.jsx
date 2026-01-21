import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import StudentLogin from './Pages/StudentLogin';
import StudentDashboard from './Pages/StudentDashboard'; // Ensure this file exists

function App() {
  return (
    <Router>
      <Routes>
        {/* Default path shows Login */}
        <Route path="/" element={<StudentLogin />} />
        
        {/* Dashboard path */}
        <Route path="/student-dashboard" element={<StudentDashboard />} />
        
        {/* Redirect any unknown routes to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;