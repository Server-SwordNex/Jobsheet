import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { getItem } from '../../utils/storage';
import { getJobsheetsByUser } from '../../api/jobsheets';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './Calendar.module.css';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function Calendar() {
  const user = getItem('user') || {};
  const uid = user.uid || user.id;
  const [jobsheets, setJobsheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    getJobsheetsByUser(uid)
      .then(setJobsheets)
      .catch(() => setJobsheets([]))
      .finally(() => setLoading(false));
  }, [uid]);

  const jobsByDate = useMemo(() => {
    const map = {};
    (jobsheets || []).forEach((js) => {
      if (!js.date) return;
      const key = js.date;
      if (!map[key]) map[key] = [];
      map[key].push(js);
    });
    return map;
  }, [jobsheets]);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const pad = firstDay;
  const totalCells = Math.ceil((pad + daysInMonth) / 7) * 7;

  const prevMonth = () => { if (month === 0) { setYear(y => y - 1); setMonth(11); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setYear(y => y + 1); setMonth(0); } else setMonth(m => m + 1); };

  const dateStr = (d) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Calendar</h1>
          <p className={styles.subtitle}>{MONTHS[month]} {year}</p>
        </div>
        <div className={styles.nav}>
          <button className={styles.navBtn} onClick={prevMonth}><ChevronLeft size={18} /></button>
          <span className={styles.navTitle}>{MONTHS[month]} {year}</span>
          <button className={styles.navBtn} onClick={nextMonth}><ChevronRight size={18} /></button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.grid}>
          {DAYS.map((d) => (
            <div key={d} className={styles.dayHeader}>{d}</div>
          ))}
          {Array.from({ length: totalCells }, (_, i) => {
            const dayNum = i - pad + 1;
            if (dayNum < 1 || dayNum > daysInMonth) return <div key={i} className={styles.emptyCell} />;
            const ds = dateStr(dayNum);
            const jobs = jobsByDate[ds] || [];
            const isToday = ds === todayStr;
            return (
              <div key={i} className={`${styles.cell} ${isToday ? styles.today : ''}`}>
                <span className={styles.dayNum}>{dayNum}</span>
                <div className={styles.jobsList}>
                  {jobs.slice(0, 4).map((js) => (
                    <span key={js.id || js._id || js.jobsheetNo} className={styles.jobChip}>
                      {js.jobsheetNo || '—'}
                    </span>
                  ))}
                  {jobs.length > 4 && (
                    <span className={styles.moreChip}>+{jobs.length - 4} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && jobsheets.length === 0 && (
        <div className={styles.emptyState}>
          <FileText size={40} />
          <p>No job sheets yet</p>
        </div>
      )}
    </div>
  );
}

export default Calendar;
