import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import ui from "./AuthShell.module.css";

/* A labelled input with an optional left icon and an error line. */
export const Field = ({ label, required, hint, error, icon: Icon, className = "", children, ...input }) => (
  <div className={`${ui.field} ${className}`}>
    {label && (
      <div className={ui.labelRow}>
        <label className={ui.label} htmlFor={input.name}>
          {label}
          {required && <span className={ui.req}> *</span>}
        </label>
        {hint}
      </div>
    )}
    {children || (
      <div className={ui.inputWrap}>
        {Icon && <Icon className={ui.inputIcon} size={17} />}
        <input
          id={input.name}
          className={`${ui.input} ${Icon ? ui.hasIcon : ""} ${error ? ui.invalid : ""}`}
          {...input}
        />
      </div>
    )}
    {error && <p className={ui.errorText}>{error}</p>}
  </div>
);

export const SelectField = ({ label, required, error, children, ...select }) => (
  <div className={ui.field}>
    <label className={ui.label} htmlFor={select.name}>
      {label}
      {required && <span className={ui.req}> *</span>}
    </label>
    <select id={select.name} className={`${ui.select} ${error ? ui.invalid : ""}`} {...select}>
      {children}
    </select>
    {error && <p className={ui.errorText}>{error}</p>}
  </div>
);

export const PasswordField = ({ label = "Password", required, error, hint, icon: Icon, ...input }) => {
  const [show, setShow] = useState(false);
  return (
    <div className={ui.field}>
      <div className={ui.labelRow}>
        <label className={ui.label} htmlFor={input.name}>
          {label}
          {required && <span className={ui.req}> *</span>}
        </label>
        {hint}
      </div>
      <div className={ui.inputWrap}>
        {Icon && <Icon className={ui.inputIcon} size={17} />}
        <input
          id={input.name}
          type={show ? "text" : "password"}
          className={`${ui.input} ${Icon ? ui.hasIcon : ""} ${ui.hasEye} ${error ? ui.invalid : ""}`}
          {...input}
        />
        <button
          type="button"
          className={ui.eye}
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className={ui.errorText}>{error}</p>}
    </div>
  );
};

export const SectionTitle = ({ children, note }) => (
  <div className={ui.section}>
    <span>{children}</span>
    {note && <small>{note}</small>}
  </div>
);

export const Button = ({ loading, children, ...rest }) => (
  <button className={ui.btn} {...rest} disabled={rest.disabled || loading}>
    {loading && <Loader2 className={ui.spin} size={18} />}
    {children}
  </button>
);
