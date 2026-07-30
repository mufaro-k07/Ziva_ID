import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../../lib/auth-client';
import '../../assets/auth.css';

export function AdminLogin() {
  const [officerId, setOfficerId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: signInError } = await signIn.email({
      email: officerId,
      password,
    });

    setLoading(false);

    if (signInError) {
      setError(signInError.message || 'Invalid credentials.');
      return;
    }

    if (data.user.role !== 'admin') {
      setError('This account does not have administrator access.');
      return;
    }

    navigate('/admin/dashboard');
  };

  return (
    <div className="auth-layout">
      <div className="auth-sidebar" style={{ backgroundColor: '#18181B' }}>
        <div className="flag-bar">
          <span className="flag-green"></span>
          <span className="flag-yellow"></span>
          <span className="flag-red"></span>
          <span className="flag-black"></span>
        </div>
        <h1>Registrar General Portal</h1>
        <p>
          Restricted access for authorized Civic Officers and ZivaID System Administrators. 
          All actions are logged in accordance with strict audit requirements.
        </p>
      </div>

      <div className="auth-main">
        <div className="auth-card admin-card">
          <h2 className="auth-title">Civic Officer Login</h2>
          <p className="auth-subtitle">Enter your official Staff Email / Officer ID and secure password.</p>

          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleAdminLogin}>
            <div className="form-group">
              <label htmlFor="officerId">Officer ID or Staff Email</label>
              <input
                id="officerId"
                type="text"
                placeholder="officer.id@rg.gov.zw"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
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

            <button type="submit" className="btn btn-admin" disabled={loading}>
              {loading ? 'Authenticating…' : 'Authenticate Officer Session'}
            </button>
          </form>

          <div className="auth-footer">
            Return to 
            <Link to="/">Portal Gateway</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;