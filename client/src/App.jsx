// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGateway from './pages/auth/authgateway';
import CitizenLogin from './pages/auth/citizen_login';
import CitizenRegistration from './pages/auth/citizen_registration';
import AdminLogin from './pages/auth/admin_login';
import CitizenDashboard from './pages/citizen/citizenDashboard';
import AdminDashboard from './pages/admin/adminDashboard'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Gateway & Authentication Flow */}
        <Route path="/" element={<AuthGateway />} />
        <Route path="/login/citizen" element={<CitizenLogin />} />
        <Route path="/register/citizen" element={<CitizenRegistration />} />
        <Route path="/login/admin" element={<AdminLogin />} />

        {/* Dashboards (Temporary Placeholder Targets) */}
        {/* Citizen Dashboard Route */}
        <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
        <Route path="/citizen/*" element={<Navigate to="/citizen/dashboard" replace />} />

        {/* Admin Dashboard Route */}
        {/* Protected Admin Officer Dashboard */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Catch-all Route for Undefined Paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;