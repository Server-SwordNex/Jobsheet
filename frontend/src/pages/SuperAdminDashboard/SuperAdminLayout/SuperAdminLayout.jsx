import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Gauge, Layers, Megaphone, LifeBuoy, ExternalLink, LogOut, Moon, Sun } from 'lucide-react';
import { getItem, removeItem } from '../../../utils/storage';
import { getAllSupportTickets } from '../../../api/support';
import iconLogo from '../../../assets/jobsheet-icon.png';
import c from '../console/console.module.css';
import { useConsoleTheme } from '../console/useConsoleTheme';

/* the other SwordNex consoles (same shared super admin login) */
const LINKS = [
  { label: 'Invoice console', href: 'https://invoices.swordnex.com/superadmin/login' },
  { label: 'Billing console', href: 'https://swordnex-billing-app.web.app/superadmin/login' },
  { label: 'Payroll console', href: 'https://swordnex-payroll-app.web.app/superadmin/login' },
  { label: 'Products portal', href: 'https://productsswordnex.web.app/superadmin/login' },
];

const item = ({ isActive }) => `${c.navItem} ${isActive ? c.active : ''}`;

function SuperAdminLayout() {
  const navigate = useNavigate();
  const { theme, isDark, toggle } = useConsoleTheme();
  const [openTickets, setOpenTickets] = useState(0);

  const email = getItem('user')?.email || getItem('auth')?.email || 'Super admin';

  useEffect(() => {
    getAllSupportTickets()
      .then((tickets) => setOpenTickets((tickets || []).filter((t) => t.status === 'OPEN').length))
      .catch(() => {});
  }, []);

  const signOut = () => {
    removeItem('token');
    removeItem('auth');
    removeItem('user');
    navigate('/superadmin/login', { replace: true });
  };

  return (
    <div className={c.sa} data-theme={theme}>
      <aside className={c.side}>
        <div className={c.brand}>
          <img src={iconLogo} alt="" />
          <div>
            <strong>SwordNex Jobsheet</strong>
            <small>Super admin</small>
          </div>
        </div>

        <nav className={c.nav}>
          <NavLink to="/superadmin/dashboard" className={item}>
            <Gauge size={17} /> <span className={c.grow}>Overview</span>
          </NavLink>

          <div className={c.navGroup}>Manage</div>
          <NavLink to="/superadmin/plans" className={item}>
            <Layers size={17} /> <span className={c.grow}>Plans &amp; pricing</span>
          </NavLink>
          <NavLink to="/superadmin/announcements" className={item}>
            <Megaphone size={17} /> <span className={c.grow}>Announcements</span>
          </NavLink>
          <NavLink to="/superadmin/tickets" className={item}>
            <LifeBuoy size={17} /> <span className={c.grow}>Support tickets</span>
            {openTickets > 0 && <span className={`${c.pill} ${c.pillHot}`}>{openTickets}</span>}
          </NavLink>

          <div className={c.navGroup}>Other consoles</div>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={c.navItem}>
              <ExternalLink size={16} /> <span className={c.grow}>{l.label}</span>
            </a>
          ))}
        </nav>

        <div className={c.sideFoot}>
          <span className={c.who} title={email}>
            {email}
          </span>
          <button
            type="button"
            className={c.iconBtn}
            onClick={toggle}
            aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button type="button" className={c.iconBtn} onClick={signOut} aria-label="Sign out" title="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <main className={c.main}>
        <Outlet />
      </main>
    </div>
  );
}

export default SuperAdminLayout;
