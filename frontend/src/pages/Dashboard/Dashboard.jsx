import { useEffect, useMemo, useState } from 'react';
import { FileText, Wrench, IndianRupee, Percent, TrendingUp, Users, CalendarDays, Clock, BarChart3 } from 'lucide-react';
import { getItem } from '../../utils/storage';
import { getDashboardData } from '../../api/dashboard';
import { getJobsheetsByUser } from '../../api/jobsheets';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './Dashboard.module.css';

const statusColors = { initiated: '#8B8FA3', 'in-progress': '#F59E0B', completed: '#10B981', cancelled: '#F20519' };

function BarChartCustom({ data }) {
  if (!data || data.length === 0) return <p className={styles.emptyText}>No data</p>;
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div className={styles.barChart}>
      {data.map((d) => (
        <div key={d.label} className={styles.barCol}>
          <span className={styles.barVal}>{d.count}</span>
          <div className={styles.barTrack}>
            <div className={styles.barFill} style={{ height: `${(d.count / max) * 100}%` }} />
          </div>
          <span className={styles.barLabel}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function PieChartCustom({ data, size }) {
  if (!data || data.length === 0) return <p className={styles.emptyText}>No data</p>;
  const [hovered, setHovered] = useState(null);
  const total = data.reduce((s, d) => s + d.count, 0);
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;
  let cur = -Math.PI / 2;
  const slices = data.map((d) => {
    const angle = (d.count / total) * 2 * Math.PI;
    const start = cur;
    const end = cur + angle;
    cur = end;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    const large = angle > Math.PI ? 1 : 0;
    const mid = start + angle / 2;
    const mx = cx + r * 0.65 * Math.cos(mid);
    const my = cy + r * 0.65 * Math.sin(mid);
    const path = `M${cx},${cy} L${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)} Z`;
    return { ...d, path, mx, my, pct: ((d.count / total) * 100).toFixed(1) };
  });
  return (
    <div className={styles.pieWrap}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {total === 0 && <circle cx={cx} cy={cy} r={r} fill="#eee" />}
        {slices.map(s => (
          <path
            key={s.label}
            d={s.path}
            fill={s.color}
            className={styles.pieSlice}
            opacity={hovered && hovered !== s.label ? 0.4 : 1}
            onMouseEnter={() => setHovered(s.label)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        <circle cx={cx} cy={cy} r={r * 0.45} fill="#fff" />
        {hovered ? (
          <>
            <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--dark)" style={{ textTransform: 'capitalize' }}>{hovered}</text>
            <text x={cx} y={cy + 12} textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--accent)">{slices.find(s => s.label === hovered)?.count}</text>
          </>
        ) : (
          <>
            <text x={cx} y={cy - 2} textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--dark)">{total}</text>
            <text x={cx} y={cy + 14} textAnchor="middle" fontSize="7" fill="rgba(0,0,0,0.4)" fontWeight="500">Total</text>
          </>
        )}
      </svg>
      <div className={styles.pieLegend}>
        {slices.map(s => (
          <div
            key={s.label}
            className={styles.pieLegendRow}
            onMouseEnter={() => setHovered(s.label)}
            onMouseLeave={() => setHovered(null)}
            style={{ opacity: hovered && hovered !== s.label ? 0.4 : 1 }}
          >
            <span className={styles.pieDot} style={{ background: s.color }} />
            <span className={styles.pieLegendLabel}>{s.label}</span>
            <span className={styles.pieLegendCount}>{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ icon, value, label, iconBg, iconColor }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon} style={{ background: iconBg, color: iconColor }}>{icon}</div>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

function Dashboard() {
  const user = getItem('user') || {};
  const uid = user.uid || user.id;
  const [data, setData] = useState(null);
  const [allJobsheets, setAllJobsheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    Promise.all([
      getDashboardData(uid),
      getJobsheetsByUser(uid).catch(() => []),
    ])
      .then(([d, j]) => { setData(d); setAllJobsheets(j); })
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [uid]);

  const weeklyData = useMemo(() => {
    const getMon = (d) => {
      const date = new Date(d + (d.length === 10 ? 'T00:00:00' : ''));
      const day = date.getDay();
      date.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    const addWeeks = (d, n) => {
      const date = new Date(d + 'T00:00:00');
      date.setDate(date.getDate() + n * 7);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };
    const fmt = (d) => {
      const date = new Date(d + 'T00:00:00');
      return date.toLocaleDateString('en', { month: 'short', day: 'numeric' });
    };
    const map = {};
    let firstWeek = null;
    (allJobsheets || []).forEach((js) => {
      if (!js.date) return;
      const mon = getMon(js.date);
      map[mon] = (map[mon] || 0) + 1;
      if (!firstWeek || mon < firstWeek) firstWeek = mon;
    });
    const todayMon = getMon(new Date().toISOString().slice(0, 10));
    if (!firstWeek) return [];
    const result = [];
    let cur = firstWeek;
    while (cur <= todayMon) {
      const end = addWeeks(cur, 1);
      result.push({ label: `${fmt(cur)}-${fmt(end).split(' ')[1]}`, count: map[cur] || 0 });
      cur = addWeeks(cur, 1);
    }
    return result;
  }, [allJobsheets]);

  if (loading) return <LoadingSpinner />;
  if (!data) return <div className={styles.container}><p className={styles.emptyState}>No dashboard data available.</p></div>;

  const { jobsheets, technicians, planUsage } = data;
  const sc = jobsheets?.statusCounts || {};

  if (!jobsheets?.total) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.heading}>Dashboard</h1>
            <p className={styles.subtitle}>Welcome back{user.username ? `, ${user.username}` : ''}.</p>
          </div>
        </div>
        <div className={styles.emptyDashboard}>
          <BarChart3 size={48} />
          <h2>No activity yet</h2>
          <p>Create your first jobsheet to see dashboard insights.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Dashboard</h1>
          <p className={styles.subtitle}>Welcome back{user.username ? `, ${user.username}` : ''}.</p>
        </div>
      </div>

      {/* ─── Stat Cards ─── */}
      <div className={styles.statsGrid}>
        <StatCard icon={<FileText size={20} />} value={jobsheets?.total ?? 0} label="Total Job Sheets" iconBg="rgba(242,5,25,0.08)" iconColor="var(--accent)" />
        <StatCard icon={<TrendingUp size={20} />} value={`₹${Number(jobsheets?.totalRevenue ?? 0).toLocaleString('en-IN')}`} label="Total Revenue" iconBg="rgba(16,185,129,0.08)" iconColor="#10B981" />
        <StatCard icon={<Percent size={20} />} value={`₹${Number(jobsheets?.totalDiscount ?? 0).toLocaleString('en-IN')}`} label="Total Discount" iconBg="rgba(245,158,11,0.08)" iconColor="#F59E0B" />
        <StatCard icon={<IndianRupee size={20} />} value={`₹${Number(jobsheets?.totalAdditionalCharges ?? 0).toLocaleString('en-IN')}`} label="Additional Charges" iconBg="rgba(99,102,241,0.08)" iconColor="#6366F1" />
        <StatCard icon={<Wrench size={20} />} value={technicians?.totalTechnicians ?? 0} label="Technicians" iconBg="rgba(139,92,246,0.08)" iconColor="#8B5CF6" />
        <StatCard icon={<Users size={20} />} value={technicians?.totalAssignedJobs ?? 0} label="Assigned Jobs" iconBg="rgba(59,130,246,0.08)" iconColor="#3B82F6" />
      </div>

      {/* ─── Two Column Layout ─── */}
      <div className={styles.twoCol}>

        {/* Weekly Trend */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <CalendarDays size={16} />
            <span>Weekly Trend</span>
          </div>
          <div className={styles.cardBody}>
            <BarChartCustom data={weeklyData} />
          </div>
        </div>

        {/* Status Distribution */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <TrendingUp size={16} />
            <span>Status Overview</span>
          </div>
          <div className={styles.cardBody}>
            <PieChartCustom
              data={Object.entries(statusColors).map(([key, color]) => ({ label: key, count: sc[key] || 0, color }))}
              size={200}
            />
          </div>
        </div>


        {/* Recent Job Sheets */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Clock size={16} />
            <span>Recent Job Sheets</span>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.recentList}>
              {(jobsheets?.recent || []).map((js) => (
                <div key={js._id || js.id || js.jobsheetNo} className={styles.recentRow}>
                  <span className={styles.recentJobNo}>{js.jobsheetNo || '—'}</span>
                  <span className={styles.recentCustomer}>{js.customer || '—'}</span>
                  <span className={styles.recentStatus} style={{ background: `${statusColors[js.status] || '#8B8FA3'}1A`, color: statusColors[js.status] || '#8B8FA3' }}>{js.status || 'initiated'}</span>
                  <span className={styles.recentDate}>{js.date || '—'}</span>
                </div>
              ))}
              {(!jobsheets?.recent || jobsheets.recent.length === 0) && <p className={styles.emptyText}>No recent jobsheets</p>}
            </div>
          </div>
        </div>

        {/* Plan Usage */}
        <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Users size={16} />
          <span>Plan Usage</span>
        </div>
        <div className={styles.cardBody}>
          {planUsage ? (
            <div className={styles.planGrid}>
              <div className={styles.planStat}>
                <span className={styles.planValue}>{planUsage.totalJobSheetsCreated ?? 0}</span>
                <span className={styles.planLabel}>Created</span>
              </div>
              <div className={styles.planStat}>
                <span className={styles.planValue}>{planUsage.jobSheetLimit ?? '∞'}</span>
                <span className={styles.planLabel}>Limit</span>
              </div>
              <div className={styles.planStat}>
                <span className={styles.planValue}>{planUsage.currentStaffs ?? 0}</span>
                <span className={styles.planLabel}>Staffs</span>
              </div>
              <div className={styles.planStat}>
                <span className={styles.planValue}>{planUsage.staffLimit ?? '∞'}</span>
                <span className={styles.planLabel}>Staff Limit</span>
              </div>
              {planUsage.plan && (
                <div className={styles.planStat}>
                  <span className={styles.planValue}>{planUsage.plan.planName || planUsage.plan.name || '—'}</span>
                  <span className={styles.planLabel}>Plan</span>
                </div>
              )}
              {planUsage.subscription && (
                <div className={styles.planStat}>
                  <span className={styles.planValue}>{planUsage.subscription.status || '—'}</span>
                  <span className={styles.planLabel}>Subscription</span>
                </div>
              )}
            </div>
          ) : (
            <p className={styles.emptyText}>No plan data</p>
          )}
        </div>
      </div>

      </div>
    </div>
  );
}

export default Dashboard;
