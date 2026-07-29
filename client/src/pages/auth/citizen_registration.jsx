// src/pages/auth/citizen_registration.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../assets/auth.css';

export function CitizenRegistration() {
  const [fullName, setFullName] = useState('');
  const [nationalId, setNationalId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    navigate('/citizen/dashboard');
  };

  return (
    <div className="auth-layout">
      <div className="auth-sidebar">
        <div className="flag-bar">
          <span className="flag-green"></span>
          <span className="flag-yellow"></span>
          <span className="flag-red"></span>
          <span className="flag-black"></span>
        </div>
        <h1>Create Citizen Account</h1>
        <p>
          Register for ZivaID to verify your civic records and apply for national identification documents online.
        </p>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <h2 className="auth-title">Citizen Registration</h2>
          <p className="auth-subtitle">Fill in your details below to establish your secure citizen profile.</p>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="fullName">Full Legal Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="e.g. Mufaro Moyo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="nationalId">National ID Number (if existing)</label>
              <input
                id="nationalId"
                type="text"
                placeholder="e.g. 63-1234567-G-42"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="citizen@example.co.zw"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Create Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary">
              Create ZivaID Account
            </button>
          </form>

          <div className="auth-footer">
            Already registered? 
            <Link to="/login/citizen">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CitizenRegistration;