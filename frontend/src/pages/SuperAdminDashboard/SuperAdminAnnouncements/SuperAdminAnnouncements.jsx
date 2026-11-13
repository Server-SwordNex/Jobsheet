import { useState } from 'react';
import { toast } from 'react-toastify';
import { Send } from 'lucide-react';
import {
  getAllAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
} from '../../../api/endpoints';
import c from '../console/console.module.css';
import { useApi, errMsg, formatDateTime } from '../console/helpers';
import { PageHeader, Card, Badge, Loading, ErrorNotice, Empty, Field } from '../console/ui';

const TYPES = ['General', 'Feature Update', 'Maintenance', 'Billing Reminder'];
const TARGETS = ['All Users', 'Admin Only', 'Active Users', 'Expired Users'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const BLANK = {
  title: '',
  message: '',
  type: 'General',
  target: 'All Users',
  priority: 'Medium',
  buttonText: '',
  buttonLink: '',
};

export default function SuperAdminAnnouncements() {
  const { data, error, loading, reload } = useApi(() => getAllAnnouncements('superadmin'));
  const [form, setForm] = useState(BLANK);
  const [sending, setSending] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const send = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return toast.error('Add a title and a message');
    if (form.buttonLink && !/^https?:\/\//i.test(form.buttonLink)) {
      return toast.error('The button link must start with https://');
    }
    if (!window.confirm(`Send this announcement to: ${form.target}? It is also emailed to them.`)) return;

    setSending(true);
    try {
      await createAnnouncement(form);
      toast.success('Announcement sent');
      setForm(BLANK);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSending(false);
    }
  };

  const toggle = async (id) => {
    try {
      await toggleAnnouncement(id);
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this announcement? Users will no longer see it.')) return;
    try {
      await deleteAnnouncement(id);
      toast.success('Announcement deleted');
      reload();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const list = data?.data || [];

  return (
    <div className={c.page}>
      <PageHeader title="Announcements" subtitle="Notices shown in every business's bell menu and sent by email." />

      <div className={c.grid2}>
        <Card title="Previous announcements" note={`${list.length} in total`}>
          {error && <ErrorNotice message={error} onRetry={reload} />}
          {loading ? (
            <Loading />
          ) : list.length === 0 ? (
            <Empty>You have not sent any announcement yet.</Empty>
          ) : (
            <div className={c.tableWrap}>
              <table className={c.table}>
                <thead>
                  <tr>
                    <th>Announcement</th>
                    <th>Audience</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {list.map((a) => (
                    <tr key={a.id}>
                      <td>
                        <span className={c.strong}>{a.title}</span>
                        <span className={c.sub}>
                          {a.type} · {a.priority} · {formatDateTime(a.createdAt)}
                        </span>
                      </td>
                      <td>{a.target}</td>
                      <td>
                        <Badge tone={a.status === 'Active' ? 'ok' : ''}>{a.status}</Badge>
                      </td>
                      <td className={c.num}>
                        <div className={c.row} style={{ justifyContent: 'flex-end' }}>
                          <button className={`${c.btn} ${c.ghost} ${c.small}`} onClick={() => toggle(a.id)}>
                            {a.status === 'Active' ? 'Hide' : 'Show'}
                          </button>
                          <button className={`${c.btn} ${c.danger} ${c.small}`} onClick={() => remove(a.id)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card title="New announcement" pad>
          <form className={c.form} onSubmit={send}>
            <Field label="Title">
              <input className={c.input} value={form.title} onChange={set('title')} maxLength={120} />
            </Field>
            <Field label="Message">
              <textarea className={c.textarea} value={form.message} onChange={set('message')} maxLength={1500} />
            </Field>
            <div className={c.cols2}>
              <Field label="Type">
                <select className={c.select} style={{ width: '100%' }} value={form.type} onChange={set('type')}>
                  {TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
              <Field label="Priority">
                <select className={c.select} style={{ width: '100%' }} value={form.priority} onChange={set('priority')}>
                  {PRIORITIES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Send to">
              <select className={c.select} style={{ width: '100%' }} value={form.target} onChange={set('target')}>
                {TARGETS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <div className={c.cols2}>
              <Field label="Button text (optional)">
                <input className={c.input} value={form.buttonText} onChange={set('buttonText')} placeholder="Open dashboard" />
              </Field>
              <Field label="Button link (optional)">
                <input className={c.input} value={form.buttonLink} onChange={set('buttonLink')} placeholder="https://..." />
              </Field>
            </div>
            <button className={c.btn} disabled={sending}>
              <Send size={16} /> {sending ? 'Sending...' : 'Send announcement'}
            </button>
          </form>
        </Card>
      </div>
    </div>
  );
}
