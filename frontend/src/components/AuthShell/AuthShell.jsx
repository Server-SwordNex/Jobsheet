import { Link } from "react-router-dom";
import { ClipboardList, MessageCircle, Wrench, Search } from "lucide-react";
import logo from "../../assets/jobsheet-icon.png";
import ui from "./AuthShell.module.css";

const FEATURES = [
  { icon: ClipboardList, title: "Job sheets in seconds", text: "Professional PDFs with technician and cost details." },
  { icon: MessageCircle, title: "Customer updates on WhatsApp", text: "Keep customers informed as the work progresses." },
  { icon: Wrench, title: "Technicians & team", text: "Assign jobs and add staff who work under your business." },
  { icon: Search, title: "Track any job", text: "Customers look up their job with a Job ID and mobile number." },
];

/* Left: scrolling form. Right: brand panel that stays in place.
   Same layout family as the SwordNex Invoice, Billing and Payroll sign-in pages. */
const AuthShell = ({ title, subtitle, children, footerNote }) => (
  <div className={ui.shell}>
    <main className={ui.formSide}>
      <div className={ui.formInner}>
        <Link to="/search" className={ui.logo}>
          <img src={logo} alt="" />
          <span className={ui.logoText}>
            <span>Swordnex</span>
            <strong>Jobsheet</strong>
          </span>
        </Link>

        <h1 className={ui.title}>{title}</h1>
        {subtitle && <p className={ui.subtitle}>{subtitle}</p>}

        {children}
      </div>

      <footer className={ui.footer}>
        {footerNote || `© ${new Date().getFullYear()} SwordNex. All rights reserved.`}
      </footer>
    </main>

    <aside className={ui.panel} aria-hidden="true">
      <div>
        <h2 className={ui.panelTitle}>Smart job tracking for service businesses.</h2>
        <p className={ui.panelText}>Create job sheets, update your customers and track every repair from one dashboard.</p>
      </div>

      <div className={ui.mock}>
        <div className={ui.mockHead}>
          <div>
            <small>JOB SHEET</small>
            <strong>JS-2611-0042</strong>
          </div>
          <span className={ui.paid}>Completed</span>
        </div>
        <div className={ui.mockRow}>
          <span>Samsung S24 · Screen replacement</span>
          <span>₹6,500.00</span>
        </div>
        <div className={ui.mockRow}>
          <span>Service charge</span>
          <span>₹500.00</span>
        </div>
        <div className={ui.mockRow}>
          <span>Discount</span>
          <span>-₹200.00</span>
        </div>
        <div className={ui.mockTotal}>
          <span>Total</span>
          <span>₹6,800.00</span>
        </div>
      </div>

      <div className={ui.features}>
        {FEATURES.map(({ icon: Icon, title: t, text }) => (
          <div key={t} className={ui.feature}>
            <div className={ui.featureIcon}>
              <Icon size={18} />
            </div>
            <div>
              <strong>{t}</strong>
              <span>{text}</span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  </div>
);

export default AuthShell;
