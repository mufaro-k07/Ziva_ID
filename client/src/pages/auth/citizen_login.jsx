// src/pages/auth/citizen_login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../assets/auth.css';

export function CitizenLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
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
        <h1>Citizen Access</h1>
        <p>
          Access your digital identity dashboard, track Birth Certificate applications, 
          and manage your National ID records securely.
        </p>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <h2 className="auth-title">Citizen Login</h2>
          <p className="auth-subtitle">Enter your registered email and password to access your dashboard.</p>

          <form onSubmit={handleLogin}>
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
              <label htmlFor="password">Password</label>
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
              Log In to Dashboard
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account? 
            <Link to="/register/citizen">Register Here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CitizenLogin;