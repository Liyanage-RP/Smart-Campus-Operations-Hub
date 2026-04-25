import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineUser } from 'react-icons/hi';
import { FcGoogle } from 'react-icons/fc';
import './LoginPage.css';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
        toast.success('Account created successfully!');
      } else {
        await login(email, password);
        toast.success('Welcome back!');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/login/oauth2/code/google';
  };

  return (
    <div className="login-page">
      <div className="login-bg-effects">
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
      </div>

      <div className="login-container">
        <div className="login-card glass-card">
          <div className="login-header">
            <span className="login-logo">🏛️</span>
            <h1 className="login-title">Smart Campus</h1>
            <p className="login-subtitle">Operations Hub</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {isRegister && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="input-icon-wrapper">
                  <HiOutlineUser className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    id="register-name"
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email</label>
              <div className="input-icon-wrapper">
                <HiOutlineMail className="input-icon" />
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@smartcampus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="login-email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrapper">
                <HiOutlineLockClosed className="input-icon" />
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  id="login-password"
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading} id="login-submit">
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>

            <div className="login-divider">
              <span>or</span>
            </div>

            <button type="button" className="btn btn-secondary btn-lg google-btn" onClick={handleGoogleLogin}>
              <FcGoogle size={20} />
              Continue with Google
            </button>
          </form>

          <p className="login-toggle">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button type="button" onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </p>

          <div className="login-demo-credentials">
            <p className="demo-title">Demo Credentials</p>
            <div className="demo-grid">
              <button type="button" onClick={() => { setEmail('admin@smartcampus.edu'); setPassword('admin123'); setIsRegister(false); }}>
                <strong>Admin</strong><span>admin@smartcampus.edu</span>
              </button>
              <button type="button" onClick={() => { setEmail('student@smartcampus.edu'); setPassword('student123'); setIsRegister(false); }}>
                <strong>Student</strong><span>student@smartcampus.edu</span>
              </button>
              <button type="button" onClick={() => { setEmail('tech@smartcampus.edu'); setPassword('tech123'); setIsRegister(false); }}>
                <strong>Technician</strong><span>tech@smartcampus.edu</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
