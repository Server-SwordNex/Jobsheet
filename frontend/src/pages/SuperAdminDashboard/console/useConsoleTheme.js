import { useCallback, useEffect, useState } from "react";

/* Light / dark theme of the super admin console. Independent of the rest of the app; remembered per
   browser; dark by default (same as the Billing and Payroll consoles). */

const STORAGE_KEY = "superAdminTheme";
const EVENT = "superadmin-theme-change";

const read = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
};

export const useConsoleTheme = () => {
  const [theme, setTheme] = useState(read);

  useEffect(() => {
    const sync = () => setTheme(read());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);

  const toggle = useCallback(() => {
    const next = read() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable: the theme still changes for this page view */
    }
    setTheme(next);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { theme, isDark: theme === "dark", toggle };
};
