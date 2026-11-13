import { useNavigate, NavLink, Outlet, Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { removeItem, getItem } from '../../../utils/storage';
import iconLogo from '../../../assets/jobsheet-icon.png';
import styles from './SuperAdminLayout.module.css';

const navLinks = [
  { label: 'Dashboard', path: '/superadmin/dashboard' },
  { label: 'Plan', path: '/superadmin/plans' },
  { label: 'Announcement', path: '/superadmin/announcements' },
  { label: 'Support Tickets', path: '/superadmin/tickets' },
];

function SuperAdminLayout() {
  const navigate = useNavigate();
  const auth = getItem('auth');

  const handleLogout = () => {
    removeItem('token');
    removeItem('auth');
    navigate('/login');
  };

  return (
    <div className={styles.layout}>
      <header className={styles.topbar}>
        <Link to="/superadmin/dashboard" className={styles.topbarLeft} aria-label="Go to Super Admin Dashboard">
          <img src={iconLogo} alt="SwordNex" className={styles.logoImg} />
          <span className={styles.logoText}>SwordNex</span>
        </Link>
        <div className={styles.topbarRight}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              <User size={16} />
            </div>
            <span className={styles.userEmail}>{auth?.email || 'Super Admin'}</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} aria-label="Logout">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <nav className={styles.nav}>
        {navLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === '/superadmin/dashboard'}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <main className={styles.content}>
        <Outlet />
      </main>
    </div>
  );
}

export default SuperAdminLayout;
