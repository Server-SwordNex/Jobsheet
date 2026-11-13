import { useMemo, useState } from 'react';
import { Users, Wrench, FileText, LifeBuoy, Building2, CheckCircle2, Clock, Search, ExternalLink } from 'lucide-react';
import { getSuperAdminUsersDetails } from '../../../api/endpoints';
import c from '../console/console.module.css';
import { useApi, formatDate, rupees } from '../console/helpers';
import { PageHeader, Card, StatCard, Badge, Loading, ErrorNotice, Empty, Drawer } from '../console/ui';

const TABS = ['overview', 'subusers', 'technicians', 'jobsheets', 'tickets'];
const TAB_LABEL = { overview: 'Overview', subusers: 'Sub-users', technicians: 'Technicians', jobsheets: 'Job sheets', tickets: 'Tickets' };

const statusOf = (u) => u.subscriptionStatus || 'ACTIVE';

export default function SuperAdminDashboard() {
  const { data, error, loading, reload } = useApi(getSuperAdminUsersDetails);
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('all');
  const [status, setStatus] = useState('all');

  const users = useMemo(() => data || [], [data]);

  const stats = useMemo(() => {
    const sum = (key) => users.reduce((n, u) => n + (u[key]?.length || 0), 0);
    return {
      businesses: users.length,
      active: users.filter((u) => statusOf(u) === 'ACTIVE').length,
      expired: users.filter((u) => statusOf(u) === 'EXPIRED').length,
      subusers: sum('subusers'),
      technicians: sum('technicians'),
      jobsheets: sum('jobsheets'),
      openTickets: users.reduce((n, u) => n + (u.tickets?.filter((t) => t.status === 'OPEN').length || 0), 0),
    };
  }, [users]);

  const plansList = useMemo(() => ['all', ...new Set(users.map((u) => u.plan).filter(Boolean))], [users]);

  const shown = users.filter((u) => {
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      (u.companyName || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q);
    return matchSearch && (plan === 'all' || u.plan === plan) && (status === 'all' || statusOf(u) === status);
  });

  const open = (u) => {
    setSelected(u);
    setTab('overview');
  };

  if (loading && !data) return <div className={c.page}><Loading text="Loading businesses..." /></div>;
  if (error) return <div className={c.page}><ErrorNotice message={error} onRetry={reload} /></div>;

  const u = selected;

  return (
    <div className={c.page}>
      <PageHeader
        title="Overview"
        subtitle="Everything happening across SwordNex Jobsheet."
        actions={
          <button className={`${c.btn} ${c.ghost}`} onClick={reload} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        }
      />

      <div className={c.stats}>
        <StatCard label="Businesses" value={stats.businesses} icon={Building2} />
        <StatCard label="Active plans" value={stats.active} icon={CheckCircle2} tone="ok" />
        <StatCard label="Expired" value={stats.expired} icon={Clock} tone="bad" />
        <StatCard label="Team members" value={stats.subusers} icon={Users} tone="info" />
        <StatCard label="Technicians" value={stats.technicians} icon={Wrench} />
        <StatCard label="Job sheets created" value={stats.jobsheets} icon={FileText} />
        <StatCard label="Open tickets" value={stats.openTickets} icon={LifeBuoy} tone={stats.openTickets ? 'bad' : ''} />
      </div>

      <Card title="Businesses" note={`${shown.length} of ${users.length}`}>
        <div className={c.toolbar}>
          <div className={c.search}>
            <Search size={16} />
            <input className={c.input} style={{ paddingLeft: 34 }} placeholder="Search company, contact or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className={c.select} value={plan} onChange={(e) => setPlan(e.target.value)} aria-label="Plan">
            {plansList.map((p) => (
              <option key={p} value={p}>
                {p === 'all' ? 'All plans' : p}
              </option>
            ))}
          </select>
          <select className={c.select} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status">
            <option value="all">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>

        {shown.length === 0 ? (
          <Empty>{users.length === 0 ? 'No businesses have registered yet.' : 'No businesses match these filters.'}</Empty>
        ) : (
          <div className={c.tableWrap}>
            <table className={c.table}>
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Plan</th>
                  <th>Status</th>
                  <th className={c.num}>Team</th>
                  <th className={c.num}>Technicians</th>
                  <th className={c.num}>Job sheets</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((b) => (
                  <tr key={b.uid} className={c.click} onClick={() => open(b)}>
                    <td>
                      <span className={c.strong}>{b.companyName || '-'}</span>
                      <span className={c.sub}>{b.website || ''}</span>
                    </td>
                    <td>
                      <span className={c.strong}>{b.username || '-'}</span>
                      <span className={c.sub}>{b.email}</span>
                    </td>
                    <td>{b.plan || 'Free'}</td>
                    <td>
                      <Badge>{statusOf(b)}</Badge>
                    </td>
                    <td className={c.num}>{b.subusers?.length || 0}</td>
                    <td className={c.num}>{b.technicians?.length || 0}</td>
                    <td className={c.num}>{b.jobsheets?.length || 0}</td>
                    <td>{formatDate(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Drawer open={Boolean(u)} title={u?.companyName || 'Business'} onClose={() => setSelected(null)}>
        {u && (
          <>
            <div className={c.tabs}>
              {TABS.map((t) => (
                <button key={t} type="button" className={`${c.tab} ${tab === t ? c.active : ''}`} onClick={() => setTab(t)}>
                  {TAB_LABEL[t]}
                  {t !== 'overview' && ` (${u[t]?.length || 0})`}
                </button>
              ))}
            </div>

            {tab === 'overview' && (
              <dl className={c.dl} style={{ padding: 0 }}>
                <dt>Contact</dt>
                <dd>{u.username || '-'}</dd>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${u.email}`}>{u.email}</a>
                </dd>
                <dt>Mobile</dt>
                <dd>{u.mobileNo || '-'}</dd>
                <dt>GSTIN</dt>
                <dd>{u.gstin || '-'}</dd>
                <dt>Website</dt>
                <dd>{u.website || '-'}</dd>
                <dt>Address</dt>
                <dd>{[u.addressLine1, u.addressLine2, u.city, u.state, u.pincode].filter(Boolean).join(', ') || '-'}</dd>
                <dt>Joined</dt>
                <dd>{formatDate(u.createdAt)}</dd>
                <dt>Plan</dt>
                <dd>
                  {u.plan || 'Free'} ({u.billingType || 'monthly'}, {Number(u.planPrice) ? rupees(u.planPrice) : 'Free'})
                </dd>
                <dt>Status</dt>
                <dd>
                  <Badge>{statusOf(u)}</Badge>
                </dd>
                <dt>Plan period</dt>
                <dd>
                  {formatDate(u.planStartDate)} to {formatDate(u.planEndDate)}
                </dd>
                <dt>Job sheets</dt>
                <dd>{u.totalJobSheetsCreated || 0} created in total</dd>
              </dl>
            )}

            {tab === 'subusers' &&
              (u.subusers?.length ? (
                <div className={c.tableWrap}>
                  <table className={c.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Branch</th>
                      </tr>
                    </thead>
                    <tbody>
                      {u.subusers.map((s) => (
                        <tr key={s.uid}>
                          <td>
                            <span className={c.strong}>{s.subUserName || s.username || '-'}</span>
                            <span className={c.sub}>Emp ID: {s.empId || '-'}</span>
                          </td>
                          <td>
                            <span>{s.email}</span>
                            <span className={c.sub}>{s.phone || ''}</span>
                          </td>
                          <td>{s.subBranchName || 'Main'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty>No sub-users for this business.</Empty>
              ))}

            {tab === 'technicians' &&
              (u.technicians?.length ? (
                <div className={c.tableWrap}>
                  <table className={c.table}>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Contact</th>
                        <th className={c.num}>Assigned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {u.technicians.map((t) => (
                        <tr key={t.id}>
                          <td className={c.strong}>{t.name}</td>
                          <td>
                            <span>{t.email}</span>
                            <span className={c.sub}>{t.mobileNo || ''}</span>
                          </td>
                          <td className={c.num}>{t.totalAssignedJobs || t.assignedJobsheets?.length || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty>No technicians for this business.</Empty>
              ))}

            {tab === 'jobsheets' &&
              (u.jobsheets?.length ? (
                <div className={c.tableWrap}>
                  <table className={c.table}>
                    <thead>
                      <tr>
                        <th>Job sheet</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {u.jobsheets.map((j) => (
                        <tr key={j.id}>
                          <td className={c.strong}>{j.jobsheetNo}</td>
                          <td>
                            <span>{j.customer || '-'}</span>
                            <span className={c.sub}>{[j.productName, j.modelName].filter(Boolean).join(' ')}</span>
                          </td>
                          <td>
                            <Badge>{j.status || 'initiated'}</Badge>
                          </td>
                          <td>{formatDate(j.createdAt)}</td>
                          <td>
                            {j.pdfLink && (
                              <a href={j.pdfLink} target="_blank" rel="noopener noreferrer" title="Open PDF">
                                <ExternalLink size={15} />
                              </a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty>No job sheets for this business.</Empty>
              ))}

            {tab === 'tickets' &&
              (u.tickets?.length ? (
                <div className={c.tableWrap}>
                  <table className={c.table}>
                    <thead>
                      <tr>
                        <th>Ticket</th>
                        <th>Question</th>
                        <th>Status</th>
                        <th>Raised</th>
                      </tr>
                    </thead>
                    <tbody>
                      {u.tickets.map((t) => (
                        <tr key={t.id || t.ticketId}>
                          <td className={c.mono}>{t.ticketId}</td>
                          <td>
                            <div className={c.clip}>{t.query}</div>
                          </td>
                          <td>
                            <Badge>{t.status}</Badge>
                          </td>
                          <td>{formatDate(t.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <Empty>No support tickets from this business.</Empty>
              ))}
          </>
        )}
      </Drawer>
    </div>
  );
}
