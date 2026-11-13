import { useState, useRef, useEffect } from 'react';
import { PanelLeft, Megaphone, LogOut, CreditCard } from 'lucide-react';
import { getItem, removeItem } from '../../utils/storage';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../api/auth';
import { getAnnouncementsByRole } from '../../api/endpoints';
import { useEntitlements } from '../../context/EntitlementsContext';
import styles from './Topbar.module.css';

function Topbar({ onToggleSidebar }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const [announcements, setAnnouncements] = useState([]);
  const [annOpen, setAnnOpen] = useState(false);
  const [seenIds, setSeenIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('seenAnnouncements') || '[]');
    } catch {
      return [];
    }
  });
  const annRef = useRef(null);

  const { entitlements } = useEntitlements();
  const pricingOn = entitlements ? entitlements.pricingEnabled !== false : true;
  const user = getItem('user');
  const auth = getItem('auth');
  const displayName = user?.username || auth?.email || 'User';
  const email = user?.email || auth?.email || '';
  const role = user?.role || auth?.role || '';
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    // the server decides which announcements this account may see
    getAnnouncementsByRole()
      .then((res) => setAnnouncements(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setAnnouncements([]));
  }, []);

  const unreadCount = announcements.filter((a) => !seenIds.includes(a.id)).length;

  const toggleAnnouncements = () => {
    const next = !annOpen;
    setAnnOpen(next);
    setOpen(false);
    if (next && announcements.length) {
      const ids = announcements.map((a) => a.id);
      setSeenIds(ids);
      try {
        localStorage.setItem('seenAnnouncements', JSON.stringify(ids));
      } catch {
        // storage unavailable: unread badge just won't persist
      }
    }
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
      if (annRef.current && !annRef.current.contains(e.target)) setAnnOpen(false);
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
        <div className={styles.annWrap} ref={annRef}>
          <button className={styles.iconBtn} aria-label="Announcements" onClick={toggleAnnouncements}>
            <Megaphone size={18} />
            {unreadCount > 0 && <span className={styles.annBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {annOpen && (
            <div className={styles.annPanel}>
              <div className={styles.annTitle}>Announcements</div>
              {announcements.length === 0 ? (
                <div className={styles.annEmpty}>No announcements right now.</div>
              ) : (
                announcements.map((a) => (
                  <div key={a.id} className={styles.annItem}>
                    <div className={styles.annItemTitle}>{a.title}</div>
                    <div className={styles.annItemMsg}>{a.message}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
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
              {pricingOn && (
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
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;
