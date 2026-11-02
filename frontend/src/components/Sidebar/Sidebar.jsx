import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  CalendarDays,
  Wrench,
  BarChart3,
  Settings,
} from 'lucide-react';
import iconLogo from '../../assets/jobsheet-icon.png';
import { getItem } from '../../utils/storage';
import styles from './Sidebar.module.css';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Job Sheets', path: '/job-sheets', icon: FilePlus },
  { label: 'Calendar', path: '/calendar', icon: CalendarDays },
  { label: 'Technicians', path: '/technicians', icon: Wrench },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Drafts', path: '/drafts', icon: FileText },
];

const bottomItems = [
  { label: 'Settings', path: '/settings', icon: Settings },
];

function Sidebar({ collapsed }) {
  const location = useLocation();
  const user = getItem('user') || {};
  const auth = getItem('auth') || {};
  const role = user.role || auth.role || '';

  const filteredNavItems = navItems.filter((item) => {
    if (item.path === '/reports' && role === 'team') {
      return false;
    }
    return true;
  });

  const isActive = (path) => {
    if (path === '/job-sheets') {
      return location.pathname.startsWith('/job-sheets') || location.pathname.startsWith('/create-job-sheet');
    }
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
      <div className={styles.logoArea}>
        <img src={iconLogo} alt="SwordNex" className={styles.logoIconImg} />
        {!collapsed && (
          <div className={styles.logoTextWrap}>
            <span className={styles.logoText}>SwordNex</span>
            <span className={styles.logoSub}>Jobsheet</span>
          </div>
        )}
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/dashboard'}
                className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
              >
                <item.icon size={20} className={styles.navIcon} />
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.bottomSection}>
        <ul className={styles.navList}>
          {bottomItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end
                className={`${styles.navLink} ${isActive(item.path) ? styles.active : ''}`}
              >
                <item.icon size={20} className={styles.navIcon} />
                {!collapsed && <span className={styles.navLabel}>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
