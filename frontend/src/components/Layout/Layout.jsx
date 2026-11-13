import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import { EntitlementsProvider } from '../../context/EntitlementsContext';
import styles from './Layout.module.css';

function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <EntitlementsProvider>
      <div className={styles.layout}>
        <Sidebar collapsed={sidebarCollapsed} />
        <div className={styles.rightPanel}>
          <Topbar onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)} />
          <main className={styles.content}>
            <Outlet />
          </main>
        </div>
      </div>
    </EntitlementsProvider>
  );
}

export default Layout;
