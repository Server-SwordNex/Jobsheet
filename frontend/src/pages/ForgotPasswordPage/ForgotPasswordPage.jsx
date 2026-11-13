import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Mail, Lock } from 'lucide-react';
import { forgotPasswordSendOtp, forgotPasswordVerifyOtp, forgotPasswordResetPassword } from '../../api/security';
import AuthShell from '../../components/AuthShell/AuthShell';
import ui from '../../components/AuthShell/AuthShell.module.css';
import { Field, PasswordField, Button } from '../../components/AuthShell/AuthFields';

const COPY = {
  1: { title: 'Forgot your password?', subtitle: "Enter your email and we'll send you a 6-digit code." },
  2: { title: 'Check your email', subtitle: 'Enter the 6-digit code we sent you.' },
  3: { title: 'Choose a new password', subtitle: 'Pick a password you have not used before.' },
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return undefined;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const run = async (fn) => {
    setError('');
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      setError(err?.error || err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendCode = (e) => {
    e?.preventDefault();
    if (!email.trim()) return setError('Enter your email address.');
    return run(async () => {
      await forgotPasswordSendOtp(email.trim());
      setCooldown(60);
      setOtp('');
      setStep(2);
      toast.success('If this email is registered, a code is on its way.');
    });
  };

  const verifyCode = (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setError('Enter the 6-digit code.');
    return run(async () => {
      const res = await forgotPasswordVerifyOtp(email.trim(), otp);
      setResetToken(res?.token || '');
      setStep(3);
    });
  };

  const resetPassword = (e) => {
    e.preventDefault();
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    return run(async () => {
      await forgotPasswordResetPassword(email.trim(), password, resetToken);
      toast.success('Password reset. Please sign in with your new password.');
      navigate('/login');
    });
  };

  return (
    <AuthShell title={COPY[step].title} subtitle={COPY[step].subtitle}>
      {step === 1 && (
        <form className={ui.form} onSubmit={sendCode} noValidate>
          {error && <div className={ui.alert}>{error}</div>}
          <Field
            label="Email address"
            name="email"
            type="email"
            icon={Mail}
            autoComplete="username"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <Button type="submit" loading={loading}>
            Send code
          </Button>
        </form>
      )}

      {step === 2 && (
        <form className={ui.form} onSubmit={verifyCode} noValidate>
          {error && <div className={ui.alert}>{error}</div>}
          <p className={ui.switchLine} style={{ margin: 0, textAlign: 'left' }}>
            Code sent to <strong>{email.trim()}</strong>
          </p>
          <input
            className={`${ui.input} ${ui.otp}`}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="······"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            autoFocus
          />
          <Button type="submit" loading={loading}>
            Verify code
          </Button>
          <button type="button" className={ui.btnGhost} disabled={loading || cooldown > 0} onClick={sendCode}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </button>
          <button
            type="button"
            className={ui.link}
            onClick={() => {
              setError('');
              setStep(1);
            }}
            disabled={loading}
          >
            Use a different email
          </button>
        </form>
      )}

      {step === 3 && (
        <form className={ui.form} onSubmit={resetPassword} noValidate>
          {error && <div className={ui.alert}>{error}</div>}
          <PasswordField
            label="New password"
            name="password"
            icon={Lock}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <PasswordField
            label="Confirm password"
            name="confirm"
            icon={Lock}
            autoComplete="new-password"
            placeholder="Repeat the password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button type="submit" loading={loading}>
            Reset password
          </Button>
        </form>
      )}

      <p className={ui.switchLine}>
        Remembered it?{' '}
        <Link to="/login" className={ui.link}>
          Back to sign in
        </Link>
      </p>
    </AuthShell>
  );
}
