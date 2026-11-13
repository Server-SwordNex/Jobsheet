import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Loader2, Lock, Mail, Moon, ShieldCheck, Sun } from 'lucide-react';
import { setItem } from '../../utils/storage';
import { superAdminLogin } from '../../api/auth';
import { useConsoleTheme } from '../SuperAdminDashboard/console/useConsoleTheme';
import s from './SuperAdminLogin.module.css';

export default function SuperAdminLogin() {
  const navigate = useNavigate();
  const { theme, isDark, toggle } = useConsoleTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cleanEmail = email.trim();
      const data = await superAdminLogin(cleanEmail, password.trim());
      setItem('token', data.token);
      setItem('auth', { token: data.token, role: 'superadmin', email: cleanEmail });
      if (data.user) setItem('user', data.user);

      toast.success('Welcome back, super admin');
      navigate('/superadmin/dashboard');
    } catch (err) {
      const msg =
        err?.error || err?.message || (typeof err === 'string' ? err : null) || 'Unauthorized Access: Invalid Admin Credentials';
      setError(msg === 'Failed to fetch' ? 'Cannot reach the server. Please try again.' : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.screen} data-theme={theme}>
      <div className={s.glow} />
      <button
        type="button"
        className={s.toggle}
        onClick={toggle}
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {isDark ? <Sun size={17} /> : <Moon size={17} />}
      </button>

      <div className={s.wrap}>
        <div className={s.head}>
          <div className={s.badge}>
            <ShieldCheck size={26} />
          </div>
          <h1>SwordNex Jobsheet super admin</h1>
          <p>Every business, plan and record in one console</p>
        </div>

        <form className={s.card} onSubmit={handleSubmit}>
          {error && <div className={s.error}>{error}</div>}

          <div className={s.field}>
            <label htmlFor="sa-email">Email</label>
            <div className={s.inputWrap}>
              <Mail className={s.icon} size={16} />
              <input
                id="sa-email"
                className={s.input}
                type="email"
                name="email"
                autoComplete="username"
                autoFocus
                required
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className={s.field}>
            <label htmlFor="sa-password">Password</label>
            <div className={s.inputWrap}>
              <Lock className={s.icon} size={16} />
              <input
                id="sa-password"
                className={s.input}
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                required
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={s.eye}
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className={s.button} disabled={loading}>
            {loading && <Loader2 className={s.spin} size={17} />}
            Sign in
          </button>
        </form>

        <p className={s.foot}>
          Not a super admin? <Link to="/login">Business sign in</Link>
        </p>
      </div>
    </div>
  );
}
