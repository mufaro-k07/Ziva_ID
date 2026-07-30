// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthGateway from './pages/auth/authgateway';
import CitizenLogin from './pages/auth/citizen_login';
import CitizenRegistration from './pages/auth/citizen_registration';
import AdminLogin from './pages/auth/admin_login';
import CitizenDashboard from './pages/citizen/citizenDashboard';
import AdminDashboard from './pages/admin/adminDashboard';
import IntakeForm from './pages/citizen/intakeForm';
import AdminReview from './pages/admin/adminReview';
import ProtectedRoute from './components/ProtectedRoute';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Gateway & Authentication Flow */}
        <Route path="/" element={<AuthGateway />} />
        <Route path="/login/citizen" element={<CitizenLogin />} />
        <Route path="/register/citizen" element={<CitizenRegistration />} />
        <Route path="/login/admin" element={<AdminLogin />} />

        {/* Citizen Dashboard Route (requires an active session) */}
        <Route
          path="/citizen/dashboard"
          element={
            <ProtectedRoute redirectTo="/login/citizen">
              <CitizenDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/citizen/*" element={<Navigate to="/citizen/dashboard" replace />} />

        {/* Intake Form Route */}
        <Route
          path="/citizen/apply/:docType"
          element={
            <ProtectedRoute redirectTo="/login/citizen">
              <IntakeForm />
            </ProtectedRoute>
          }
        />

        {/* Protected Admin Officer Routes (requires the admin role) */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requireRole="admin" redirectTo="/login/admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/review/:recordId"
          element={
            <ProtectedRoute requireRole="admin" redirectTo="/login/admin">
              <AdminReview />
            </ProtectedRoute>
          }
        />

        {/* Catch-all Route for Undefined Paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;