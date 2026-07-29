// src/pages/auth/authgateway.jsx
import { Link } from 'react-router-dom';
import '../../assets/auth.css';

export function AuthGateway() {
  return (
    <div className="auth-layout">
      {/* Dark Branded Left Sidebar */}
      <div className="auth-sidebar">
        <div className="flag-bar">
          <span className="flag-green"></span>
          <span className="flag-yellow"></span>
          <span className="flag-red"></span>
          <span className="flag-black"></span>
        </div>
        <h1>ZivaID Portal</h1>
        <p>
          The Republic of Zimbabwe's centralized digital identity and civic services platform. 
          Secure, verified, and accessible citizen identity management.
        </p>
      </div>

      {/* Right Interaction Card */}
      <div className="auth-main">
        <div className="auth-card">
          <h2 className="auth-title">Select Portal Access</h2>
          <p className="auth-subtitle">Please select your designated access tier to continue.</p>

          <div>
            <Link to="/login/citizen" className="btn btn-primary" style={{ marginBottom: '12px' }}>
              Citizen Portal Login
            </Link>
            <Link to="/login/admin" className="btn btn-secondary">
              Civic Officer / Admin Portal
            </Link>
          </div>

          <div className="auth-footer">
            Need an account? 
            <Link to="/register/citizen">Register as a Citizen</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthGateway;