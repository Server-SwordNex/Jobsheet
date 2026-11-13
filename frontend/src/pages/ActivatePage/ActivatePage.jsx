import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Globe, FileText, MapPin, User, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import { setItem } from '../../utils/storage';
import { completeSignUp, fetchPricingEnabled, isActivationExpired } from '../../utils/signup';
import { indianStates } from '../../utils/indianStates';
import AuthShell from '../../components/AuthShell/AuthShell';
import ui from '../../components/AuthShell/AuthShell.module.css';
import { Field, SelectField, SectionTitle, Button } from '../../components/AuthShell/AuthFields';

/* Shown after a sign-in with a SwordNex account that has no Jobsheet business yet (made in
   another SwordNex app). The activation token proves the password was right; the plan is chosen
   on the next screen, which then creates the business. */
export default function ActivatePage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [form, setForm] = useState({
    companyName: '',
    website: '',
    gstin: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    pincode: '',
    username: '',
    mobileNo: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // opened directly (no sign-in behind it): go and sign in first
  if (!state?.activationToken) return <Navigate to="/login" replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== name)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!form.companyName.trim()) found.companyName = 'Enter your company name.';
    if (!form.username.trim()) found.username = 'Enter your name.';
    if (!form.mobileNo.trim()) found.mobileNo = 'Enter your mobile number.';
    if (!form.addressLine1.trim()) found.addressLine1 = 'Enter your address.';
    if (!form.city.trim()) found.city = 'Enter your city.';
    if (!form.state.trim()) found.state = 'Choose your state.';
    if (!form.pincode.trim()) found.pincode = 'Enter your pincode.';
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementsByName(Object.keys(found)[0])[0]?.focus();
      return;
    }

    const registerData = { formData: { ...form, email: state.email }, activationToken: state.activationToken };
    setSubmitting(true);
    try {
      if (await fetchPricingEnabled()) {
        setItem('registerData', registerData);
        navigate('/pricing');
        return;
      }
      // pricing is switched off: Jobsheet is free, so there is no plan to choose
      await completeSignUp(registerData, null);
      toast.success('Your Jobsheet business is ready.');
      navigate('/dashboard');
    } catch (err) {
      if (isActivationExpired(err)) {
        toast.error('Your sign-in expired. Please sign in again.');
        navigate('/login', { replace: true });
        return;
      }
      setErrors({ pincode: err?.error || err?.message || 'Could not set up your business. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title="Set up your Jobsheet business"
      subtitle={`You're signed in with your SwordNex account${state.email ? ` (${state.email})` : ''}. Tell us about your business.`}
    >
      <form className={ui.form} onSubmit={handleSubmit} noValidate>
        <SectionTitle>Your business</SectionTitle>
        <Field label="Company name" required name="companyName" icon={Building2} placeholder="Your company" value={form.companyName} onChange={handleChange} error={errors.companyName} autoFocus />
        <div className={ui.grid2}>
          <Field label="Website (optional)" name="website" icon={Globe} placeholder="www.example.com" value={form.website} onChange={handleChange} />
          <Field label="GSTIN (optional)" name="gstin" icon={FileText} placeholder="15-character GSTIN" value={form.gstin} onChange={handleChange} />
        </div>

        <SectionTitle>Your details</SectionTitle>
        <div className={ui.grid2}>
          <Field label="Your name" required name="username" icon={User} autoComplete="name" placeholder="Full name" value={form.username} onChange={handleChange} error={errors.username} />
          <Field
            label="WhatsApp number"
            required
            name="mobileNo"
            type="tel"
            icon={Phone}
            inputMode="numeric"
            maxLength={10}
            placeholder="10-digit number"
            value={form.mobileNo}
            onChange={(e) => handleChange({ target: { name: 'mobileNo', value: e.target.value.replace(/\D/g, '') } })}
            error={errors.mobileNo}
          />
        </div>

        <SectionTitle>Address</SectionTitle>
        <Field label="Address line 1" required name="addressLine1" icon={MapPin} placeholder="Street address" value={form.addressLine1} onChange={handleChange} error={errors.addressLine1} />
        <Field label="Address line 2 (optional)" name="addressLine2" placeholder="Area, landmark" value={form.addressLine2} onChange={handleChange} />
        <div className={ui.grid2}>
          <Field label="City" required name="city" placeholder="City" value={form.city} onChange={handleChange} error={errors.city} />
          <SelectField label="State" required name="state" value={form.state} onChange={handleChange} error={errors.state}>
            <option value="">Select state</option>
            {indianStates.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectField>
        </div>
        <Field label="Pincode" required name="pincode" inputMode="numeric" maxLength={6} placeholder="6-digit pincode" value={form.pincode} onChange={(e) => handleChange({ target: { name: 'pincode', value: e.target.value.replace(/\D/g, '') } })} error={errors.pincode} />

        <Button type="submit" loading={submitting}>
          Continue
        </Button>
      </form>

      <p className={ui.switchLine}>
        Not you?{' '}
        <Link to="/login" className={ui.link}>
          Sign in with a different account
        </Link>
      </p>
    </AuthShell>
  );
}
