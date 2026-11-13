import { useState, useRef, useEffect } from 'react';
import { PanelLeft, Megaphone, LogOut, CreditCard } from 'lucide-react';
import { getItem, removeItem } from '../../utils/storage';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../api/auth';
import styles from './Topbar.module.css';

function Topbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const user = getItem('user');
  const auth = getItem('auth');
  const displayName = user?.username || auth?.email || 'User';
  const email = user?.email || auth?.email || '';
  const role = user?.role || auth?.role || '';
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // proceed with local logout even if API call fails
    }
    removeItem('token');
    removeItem('auth');
    removeItem('user');
    navigate('/login');
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          className={styles.iconBtn}
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={18} />
        </button>
      </div>
      <div className={styles.right}>
        <button className={styles.iconBtn} aria-label="Announcements">
          <Megaphone size={18} />
        </button>
        <div className={styles.userInfo} ref={ref}>
          <button className={styles.avatar} onClick={() => setOpen(!open)}>
            {initial}
          </button>
          {open && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.dropdownAvatar}>{initial}</div>
                <div>
                  <div className={styles.dropdownName}>{displayName}</div>
                  <div className={styles.dropdownEmail}>{email}</div>
                </div>
              </div>
              <div className={styles.dropdownBody}>
                <span className={styles.dropdownRole}>{role || 'user'}</span>
              </div>
              <div className={styles.dropdownDivider} />
              <button className={styles.dropdownItem} onClick={handleLogout}>
                <LogOut size={15} />
                Sign Out
              </button>
              <button
                className={styles.dropdownItem}
                onClick={() => {
                  setOpen(false);
                  navigate('/subscription');
                }}
              >
                <CreditCard size={15} />
                Subscription
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
