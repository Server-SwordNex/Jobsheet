import { useState } from 'react';
import { toast } from 'react-toastify';
import { Plus } from 'lucide-react';
import { getPlans, addPlan, editPlan, removePlan, getSubUserPrice, updateSubUserPrice, getPlatformSettings, updatePlatformSettings } from '../../../api/endpoints';
import c from '../console/console.module.css';
import { useApi, errMsg, rupees } from '../console/helpers';
import { LIMITS, TOGGLES, formFromPlan, bodyFromForm } from '../console/planCapabilities';
import { PageHeader, Card, Badge, Loading, ErrorNotice, Empty, Field, Modal } from '../console/ui';

const BLANK = formFromPlan({ capabilities: { prioritySupport: { enabled: false } } });

/* one number row: a value or "Unlimited" */
const LimitRow = ({ def, form, set }) => {
  const unlimitedKey = `${def.key}Unlimited`;
  return (
    <div className={c.capRow}>
      <div>
        <strong>{def.label}</strong>
        <small>{def.help}</small>
      </div>
      <div className={c.capControl}>
        <input
          className={c.input}
          type="number"
          min="0"
          disabled={form[unlimitedKey]}
          value={form[unlimitedKey] ? '' : form[def.key]}
          onChange={set(def.key)}
          placeholder="0"
        />
        <label className={c.check}>
          <input type="checkbox" checked={form[unlimitedKey]} onChange={set(unlimitedKey)} />
          Unlimited
        </label>
      </div>
    </div>
  );
};

/* one on/off row */
const ToggleRow = ({ def, form, set }) => (
  <div className={c.capRow}>
    <div>
      <strong>{def.label}</strong>
      <small>{def.help}</small>
    </div>
    <div className={c.capControl}>
      <select
        className={c.select}
        value={form[def.key] ? 'on' : 'off'}
        onChange={(e) => set(def.key)({ target: { type: 'checkbox', checked: e.target.value === 'on' } })}
      >
        <option value="on">Enabled</option>
        <option value="off">Disabled</option>
      </select>
    </div>
  </div>
);

const summary = (p) => {
  const tags = [];
  const caps = p.capabilities || {};
  if (caps.customerUpdates?.enabled !== false) tags.push('WhatsApp updates');
  if (caps.reports?.enabled !== false) tags.push('Reports');
  if (caps.customerSearch?.enabled !== false) tags.push('Customer search');
  if (caps.prioritySupport?.enabled) tags.push('Priority support');
  return tags;
};

const unlimitedOr = (n) => (Number(n) > 0 ? n : 'Unlimited');

export default function SuperAdminPlans() {
  const plans = useApi(getPlans);
  const price = useApi(getSubUserPrice);
  const settings = useApi(getPlatformSettings);
  const [switching, setSwitching] = useState(false);
  // pricing starts OFF: Jobsheet is free until the super admin turns it on
  const pricingOn = settings.data ? settings.data.pricingEnabled === true : false;

  const [editing, setEditing] = useState(null); // null | { id?, form }
  const [saving, setSaving] = useState(false);
  // what is typed in the price box; until the admin types, show the saved price
  const [subPriceEdit, setSubPriceEdit] = useState(null);
  const saved = price.data?.data?.pricePerSubUser;
  const subPrice = subPriceEdit ?? (saved !== undefined ? String(saved) : '');

  const set = (key) => (e) =>
    setEditing((s) => ({
      ...s,
      form: { ...s.form, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value },
    }));

  const save = async () => {
    const f = editing.form;
    if (!f.name.trim()) return toast.error('Give the plan a name');

    setSaving(true);
    try {
      const body = bodyFromForm(f);
      if (editing.id) await editPlan(editing.id, body);
      else await addPlan(body);
      toast.success(editing.id ? 'Plan updated' : 'Plan created');
      setEditing(null);
      plans.reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete the plan "${p.name}"? Businesses already on it keep the limits saved at sign-up.`)) return;
    try {
      await removePlan(p.id);
      toast.success('Plan deleted');
      plans.reload();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const setPricing = async () => {
    const next = !pricingOn;
    const ok = window.confirm(
      next
        ? 'Switch pricing ON? Plans, limits, features and expiry apply again. Businesses that signed up while it was off start a fresh 14-day free trial from today.'
        : 'Switch pricing OFF? Jobsheet becomes completely free for everyone: no expiry, no limits, every feature on, and no plan to choose when signing up.'
    );
    if (!ok) return;

    setSwitching(true);
    try {
      const res = await updatePlatformSettings({ pricingEnabled: next });
      toast.success(
        next
          ? `Pricing is ON${res.trialsStarted ? ` (${res.trialsStarted} free trial${res.trialsStarted === 1 ? '' : 's'} started)` : ''}`
          : 'Pricing is OFF: Jobsheet is free for everyone'
      );
      settings.reload();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setSwitching(false);
    }
  };

  const saveSubPrice = async () => {
    try {
      await updateSubUserPrice(Number(subPrice) || 0);
      toast.success('Team member price saved');
      setSubPriceEdit(null);
      price.reload();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const list = plans.data || [];

  return (
    <div className={c.page}>
      <PageHeader
        title="Plans & pricing"
        subtitle="What businesses can subscribe to. Limits and features are enforced by the server."
        actions={
          <button className={c.btn} onClick={() => setEditing({ form: BLANK })}>
            <Plus size={16} /> New plan
          </button>
        }
      />

      {plans.error && <ErrorNotice message={plans.error} onRetry={plans.reload} />}
      {settings.error && <ErrorNotice message={settings.error} onRetry={settings.reload} />}

      {!pricingOn && (
        <div className={`${c.notice} ${c.freeNotice}`}>
          Pricing is OFF. SwordNex Jobsheet is completely free for everyone right now: no expiry, no limits, every
          feature on, and new businesses sign up without choosing a plan. The plans below are kept and apply again
          when you switch pricing on.
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        <section className={`${c.card} ${c.master}`}>
          <div>
            <h2>Pricing</h2>
            <p>
              {pricingOn
                ? "On: each plan's limits, features, free trial and expiry apply."
                : 'Off: Jobsheet is free for everyone. Nothing expires, nothing is limited and no plan is asked for.'}
            </p>
          </div>
          <div className={c.row}>
            <Badge tone={pricingOn ? 'ok' : 'warn'}>{pricingOn ? 'Enabled' : 'Disabled'}</Badge>
            <button
              type="button"
              className={`${c.switch} ${pricingOn ? c.on : ''}`}
              onClick={setPricing}
              disabled={switching || settings.loading}
              role="switch"
              aria-checked={pricingOn}
              aria-label="Pricing enabled"
            />
          </div>
        </section>

        <Card title="Plans" note={`${list.length} plan${list.length === 1 ? '' : 's'}`}>
          {plans.loading ? (
            <Loading />
          ) : list.length === 0 ? (
            <Empty>No plans yet. Create the first plan so businesses can sign up.</Empty>
          ) : (
            <div className={c.tableWrap}>
              <table className={c.table}>
                <thead>
                  <tr>
                    <th>Plan</th>
                    <th>Billing</th>
                    <th className={c.num}>Price</th>
                    <th className={c.num}>Job sheets / mo</th>
                    <th className={c.num}>Technicians</th>
                    <th className={c.num}>Team</th>
                    <th>Features</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.id}>
                      <td>
                        <span className={c.strong}>{p.name}</span>
                        {p.popular && (
                          <>
                            {' '}
                            <Badge tone="accent">Popular</Badge>
                          </>
                        )}
                        <span className={c.sub}>{p.tagLine}</span>
                      </td>
                      <td>{p.billingType}</td>
                      <td className={c.num}>{Number(p.price) ? rupees(p.price) : 'Free'}</td>
                      <td className={c.num}>{unlimitedOr(p.jobSheetLimit)}</td>
                      <td className={c.num}>{unlimitedOr(p.staffLimit)}</td>
                      <td className={c.num}>{p.subuserLimit === null ? 'Unlimited' : p.subuserLimit}</td>
                      <td>
                        <div className={c.tags}>
                          {summary(p).map((t) => (
                            <Badge key={t} tone="">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className={c.num}>
                        <div className={c.row} style={{ justifyContent: 'flex-end' }}>
                          <button className={`${c.btn} ${c.ghost} ${c.small}`} onClick={() => setEditing({ id: p.id, form: formFromPlan(p) })}>
                            Edit
                          </button>
                          <button className={`${c.btn} ${c.danger} ${c.small}`} onClick={() => remove(p)}>
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

        <Card title="Extra team members" note="Price per additional team member" pad>
          <div className={c.row}>
            <input className={c.input} style={{ width: 140 }} type="number" min="0" value={subPrice} onChange={(e) => setSubPriceEdit(e.target.value)} />
            <button className={c.btn} onClick={saveSubPrice}>
              Save price
            </button>
          </div>
        </Card>
      </div>

      <Modal
        open={Boolean(editing)}
        title={editing?.id ? 'Edit plan' : 'New plan'}
        onClose={() => setEditing(null)}
        footer={
          <>
            <button className={`${c.btn} ${c.ghost}`} onClick={() => setEditing(null)}>
              Cancel
            </button>
            <button className={c.btn} disabled={saving} onClick={save}>
              {saving ? 'Saving...' : 'Save plan'}
            </button>
          </>
        }
      >
        {editing && (
          <div className={c.form}>
            <div className={c.cols2}>
              <Field label="Plan name">
                <input className={c.input} value={editing.form.name} onChange={set('name')} placeholder="Premium" />
              </Field>
              <Field label="Billing">
                <select className={c.select} style={{ width: '100%' }} value={editing.form.billingType} onChange={set('billingType')}>
                  <option value="free">Free (trial)</option>
                  <option value="monthly">Monthly</option>
                  <option value="annual">Annual</option>
                </select>
              </Field>
            </div>
            <div className={c.cols2}>
              <Field label="Price (₹)" hint={editing.form.billingType === 'free' ? 'A free plan costs nothing' : undefined}>
                <input
                  className={c.input}
                  type="number"
                  min="0"
                  disabled={editing.form.billingType === 'free'}
                  value={editing.form.billingType === 'free' ? 0 : editing.form.price}
                  onChange={set('price')}
                />
              </Field>
              <Field label="Tag line">
                <input className={c.input} value={editing.form.tagLine} onChange={set('tagLine')} />
              </Field>
            </div>

            <div className={c.sectionLabel}>Limits</div>
            <div>
              {LIMITS.map((def) => (
                <LimitRow key={def.key} def={def} form={editing.form} set={set} />
              ))}
            </div>

            <div className={c.sectionLabel}>Features</div>
            <div>
              {TOGGLES.map((def) => (
                <ToggleRow key={def.key} def={def} form={editing.form} set={set} />
              ))}
            </div>

            <Field label="Extra feature lines (optional)" hint="One per line. These are added to the pricing card after the lines above.">
              <textarea className={c.textarea} value={editing.form.extraFeatures} onChange={set('extraFeatures')} />
            </Field>
            <label className={c.check}>
              <input type="checkbox" checked={editing.form.popular} onChange={set('popular')} />
              Mark as most popular
            </label>
          </div>
        )}
      </Modal>
    </div>
  );
}
