import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock } from 'lucide-react';
import { login } from '../../api/auth';
import { setItem } from '../../utils/storage';
import AuthShell from '../../components/AuthShell/AuthShell';
import ui from '../../components/AuthShell/AuthShell.module.css';
import { Field, PasswordField, Button } from '../../components/AuthShell/AuthFields';

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const cleanEmail = email.trim();
      // "team" = a normal business or team-member sign-in (the super admin has its own page)
      const data = await login(cleanEmail, password, 'team');
      setItem('token', data.token);
      setItem('auth', { token: data.token, role: data.user?.role || 'team', email: cleanEmail });
      setItem('user', data.user);
      toast.success('Signed in successfully');
      navigate(data.user?.role === 'superadmin' ? '/superadmin/dashboard' : '/dashboard');
    } catch (err) {
      // a valid SwordNex account (from another app) that has no Jobsheet business yet
      if (err?.code === 'NEEDS_ACTIVATION' && err.activationToken) {
        navigate('/activate', { state: { activationToken: err.activationToken, email: email.trim() } });
        return;
      }
      setError(err?.error || err?.message || (typeof err === 'string' ? err : null) || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your job sheets.">
      <form className={ui.form} onSubmit={handleSubmit} noValidate>
        {error && <div className={ui.alert}>{error}</div>}

        <Field
          label="Email address"
          name="email"
          type="email"
          icon={Mail}
          autoComplete="username"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          autoFocus
        />

        <PasswordField
          label="Password"
          name="password"
          icon={Lock}
          autoComplete="current-password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (error) setError('');
          }}
          hint={
            <Link to="/forgot-password" className={ui.link} style={{ fontSize: 13 }}>
              Forgot password?
            </Link>
          }
        />

        <Button type="submit" loading={loading}>
          {loading ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      <p className={ui.switchLine}>
        Don&apos;t have an account?{' '}
        <Link to="/register" className={ui.link}>
          Create one
        </Link>
      </p>
      <p className={ui.switchLine} style={{ marginTop: 6 }}>
        Looking for a job sheet?{' '}
        <Link to="/search" className={ui.link}>
          Track it here
        </Link>
      </p>
    </AuthShell>
  );
}
