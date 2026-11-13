import { useEffect } from "react";
import { Loader2, X, ArrowLeft } from "lucide-react";
import c from "./console.module.css";
import { statusTone } from "./helpers.js";

export const PageHeader = ({ title, subtitle, actions, onBack, backLabel = "Back" }) => (
  <>
    {onBack && (
      <button type="button" className={c.back} onClick={onBack}>
        <ArrowLeft size={16} /> {backLabel}
      </button>
    )}
    <div className={c.pageHead}>
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className={c.row}>{actions}</div>}
    </div>
  </>
);

export const Card = ({ title, note, actions, pad, children }) => (
  <section className={c.card}>
    {(title || actions) && (
      <div className={c.cardHead}>
        <div>
          <h2>{title}</h2>
          {note && <small>{note}</small>}
        </div>
        {actions && <div className={c.row}>{actions}</div>}
      </div>
    )}
    {pad ? <div className={c.cardPad}>{children}</div> : children}
  </section>
);

export const StatCard = ({ label, value, icon: Icon, tone = "", onClick }) => {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag className={`${c.card} ${c.stat}`} onClick={onClick} type={onClick ? "button" : undefined}>
      <span className={`${c.statIcon} ${tone ? c[tone] : ""}`}>{Icon && <Icon size={20} />}</span>
      <span>
        <div className={c.statValue}>{value}</div>
        <div className={c.statLabel}>{label}</div>
      </span>
    </Tag>
  );
};

export const Badge = ({ tone, children }) => {
  const t = tone ?? statusTone(children);
  return <span className={`${c.badge} ${t ? c[t] : ""}`}>{children}</span>;
};

export const Loading = ({ text = "Loading..." }) => (
  <div className={c.loading}>
    <Loader2 className={c.spin} size={22} />
    {text}
  </div>
);

export const ErrorNotice = ({ message, onRetry }) => (
  <div className={`${c.notice} ${c.bad}`}>
    <span style={{ flex: 1 }}>{message}</span>
    {onRetry && (
      <button type="button" className={`${c.btn} ${c.ghost} ${c.small}`} onClick={onRetry}>
        Retry
      </button>
    )}
  </div>
);

export const Empty = ({ children }) => <div className={c.empty}>{children}</div>;

export const Field = ({ label, hint, children }) => (
  <div className={c.field}>
    <label>{label}</label>
    {children}
    {hint && <span className={c.hint}>{hint}</span>}
  </div>
);

const useEscape = (open, onClose) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
};

/* slide-in panel from the right (record details, ticket details) */
export const Drawer = ({ open, title, onClose, children }) => {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <>
      <div className={c.overlay} onClick={onClose} />
      <aside className={c.drawer} role="dialog" aria-modal="true">
        <div className={c.drawerHead}>
          <h2>{title}</h2>
          <button type="button" className={c.iconBtn} onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className={c.drawerBody}>{children}</div>
      </aside>
    </>
  );
};

export const Modal = ({ open, title, onClose, footer, children }) => {
  useEscape(open, onClose);
  if (!open) return null;
  return (
    <>
      <div className={c.overlay} onClick={onClose} />
      <div className={c.modalWrap}>
        <div className={c.modal} role="dialog" aria-modal="true">
          <div className={c.drawerHead}>
            <h2>{title}</h2>
            <button type="button" className={c.iconBtn} onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          </div>
          <div className={c.modalBody}>{children}</div>
          {footer && <div className={c.modalFoot}>{footer}</div>}
        </div>
      </div>
    </>
  );
};
