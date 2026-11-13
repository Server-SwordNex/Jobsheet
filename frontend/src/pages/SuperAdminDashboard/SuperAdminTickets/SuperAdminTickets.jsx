import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { getAllSupportTickets, updateSupportTicketStatus } from '../../../api/support';
import c from '../console/console.module.css';
import { useApi, errMsg, formatDateTime, toDate } from '../console/helpers';
import { PageHeader, Card, Badge, Loading, ErrorNotice, Empty, Drawer } from '../console/ui';

const STATUSES = ['OPEN', 'IN_PROGRESS', 'PENDING', 'RESOLVED', 'CLOSED'];
const label = (s) => s.replace('_', ' ').toLowerCase().replace(/^./, (m) => m.toUpperCase());

export default function SuperAdminTickets() {
  const { data, error, loading, reload } = useApi(getAllSupportTickets);
  const [filter, setFilter] = useState('ALL');
  const [open, setOpen] = useState(null);
  const [busy, setBusy] = useState(false);

  const tickets = useMemo(
    () => [...(data || [])].sort((a, b) => (toDate(b.createdAt)?.getTime() || 0) - (toDate(a.createdAt)?.getTime() || 0)),
    [data]
  );

  const counts = useMemo(() => {
    const out = { ALL: tickets.length };
    STATUSES.forEach((s) => (out[s] = tickets.filter((t) => t.status === s).length));
    return out;
  }, [tickets]);

  const shown = filter === 'ALL' ? tickets : tickets.filter((t) => t.status === filter);

  const setStatus = async (ticket, status) => {
    setBusy(true);
    try {
      await updateSupportTicketStatus(ticket.ticketId, status);
      toast.success(`Marked ${label(status)}`);
      setOpen((o) => (o ? { ...o, status } : o));
      await reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={c.page}>
      <PageHeader title="Support tickets" subtitle="Questions raised by businesses from Settings, Support." />

      {error && <ErrorNotice message={error} onRetry={reload} />}

      <Card>
        <div className={c.toolbar}>
          {['ALL', ...STATUSES].map((s) => (
            <button key={s} className={`${c.btn} ${c.small} ${filter === s ? '' : c.ghost}`} onClick={() => setFilter(s)}>
              {s === 'ALL' ? 'All' : label(s)} ({counts[s] ?? 0})
            </button>
          ))}
        </div>

        {loading ? (
          <Loading />
        ) : shown.length === 0 ? (
          <Empty>No support tickets here.</Empty>
        ) : (
          <div className={c.tableWrap}>
            <table className={c.table}>
              <thead>
                <tr>
                  <th>Ticket</th>
                  <th>From</th>
                  <th>Question</th>
                  <th>Status</th>
                  <th>Raised</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((t) => (
                  <tr key={t.ticketId || t.id} className={c.click} onClick={() => setOpen(t)}>
                    <td className={c.mono}>{t.ticketId}</td>
                    <td>
                      <span className={c.strong}>{t.name || t.companyName || '-'}</span>
                      <span className={c.sub}>{t.email}</span>
                    </td>
                    <td>
                      <div className={c.clip}>{t.query}</div>
                    </td>
                    <td>
                      <Badge>{t.status}</Badge>
                    </td>
                    <td>{formatDateTime(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Drawer open={Boolean(open)} title={open?.ticketId || 'Ticket'} onClose={() => setOpen(null)}>
        {open && (
          <div className={c.form}>
            <dl className={c.dl} style={{ padding: 0 }}>
              <dt>From</dt>
              <dd>{open.name || '-'}</dd>
              <dt>Business</dt>
              <dd>{open.companyName || '-'}</dd>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${open.email}`}>{open.email}</a>
              </dd>
              <dt>Mobile</dt>
              <dd>{open.mobileNo || open.mobile || '-'}</dd>
              <dt>Raised</dt>
              <dd>{formatDateTime(open.createdAt)}</dd>
              <dt>Status</dt>
              <dd>
                <Badge>{open.status}</Badge>
              </dd>
            </dl>
            <pre className={c.json} style={{ fontFamily: 'inherit', fontSize: 14, whiteSpace: 'pre-wrap' }}>{open.query}</pre>
            <div className={c.row}>
              {STATUSES.filter((s) => s !== open.status).map((s) => (
                <button key={s} className={`${c.btn} ${c.ghost} ${c.small}`} disabled={busy} onClick={() => setStatus(open, s)}>
                  Mark {label(s)}
                </button>
              ))}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
