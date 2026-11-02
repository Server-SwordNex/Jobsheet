import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, X, Pencil, Trash2, DollarSign } from 'lucide-react';
import JobSheetPlanModel from '../../../models/JobSheetPlanModel';
import { getPlans, addPlan, editPlan, removePlan, getSubUserPrice, updateSubUserPrice } from '../../../api/endpoints';
import styles from './SuperAdminPlans.module.css';

const initialForm = {
  name: '',
  billingType: 'monthly',
  price: '',
  tagLine: '',
  jobSheetLimit: '',
  staffLimit: '',
  subuserLimit: '',
  popular: false,
  features: '',
};

const billingOptions = ['free', 'monthly', 'yearly'];

function SuperAdminPlans() {
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [plans, setPlans] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [subUserPrice, setSubUserPrice] = useState(null);
  const [priceInput, setPriceInput] = useState('');
  const [priceSaving, setPriceSaving] = useState(false);

  useEffect(() => {
    getPlans()
      .then((data) => setPlans(Array.isArray(data) ? data : []))
      .catch(() => toast.error('Failed to load plans'));
  }, []);

  useEffect(() => {
    getSubUserPrice()
      .then((res) => {
        const price = res?.data;
        if (price) {
          setSubUserPrice(price.pricePerSubUser);
          setPriceInput(String(price.pricePerSubUser));
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Plan name is required'); return; }

    const data = {
      name: form.name,
      billingType: form.billingType,
      price: Number(form.price),
      tagLine: form.tagLine,
      jobSheetLimit: Number(form.jobSheetLimit),
      staffLimit: Number(form.staffLimit),
      subuserLimit: Number(form.subuserLimit),
      popular: form.popular,
      features: form.features
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
    };

    setSubmitting(true);
    try {
      if (editingPlan) {
        const id = editingPlan._id || editingPlan.id;
        const updated = await editPlan(id, data);
        setPlans((prev) => prev.map((p) => ((p._id || p.id) === id ? { ...p, ...data } : p)));
        toast.success(`Plan "${data.name}" updated`);
      } else {
        const created = await addPlan(data);
        setPlans((prev) => [...prev, created]);
        toast.success(`Plan "${data.name}" created`);
      }
      setForm(initialForm);
      setEditingPlan(null);
      setShowModal(false);
    } catch (err) {
      const msg = err?.message || err?.error || 'Failed to save plan';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name || '',
      billingType: plan.billingType || 'monthly',
      price: plan.price ?? '',
      tagLine: plan.tagLine || '',
      jobSheetLimit: plan.jobSheetLimit ?? '',
      staffLimit: plan.staffLimit ?? '',
      subuserLimit: plan.subuserLimit ?? '',
      popular: !!plan.popular,
      features: Array.isArray(plan.features) ? plan.features.join('\n') : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (plan) => {
    const id = plan._id || plan.id;
    if (!window.confirm(`Delete plan "${plan.name}"?`)) return;
    setDeletingId(id);
    try {
      await removePlan(id);
      setPlans((prev) => prev.filter((p) => (p._id || p.id) !== id));
      toast.success(`Plan "${plan.name}" deleted`);
    } catch (err) {
      const msg = err?.message || err?.error || 'Failed to delete plan';
      toast.error(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveSubUserPrice = async () => {
    const val = Number(priceInput);
    if (isNaN(val) || val < 0) { toast.error('Enter a valid price'); return; }
    setPriceSaving(true);
    try {
      await updateSubUserPrice(val);
      setSubUserPrice(val);
      toast.success('Sub-user price updated');
    } catch {
      toast.error('Failed to update sub-user price');
    } finally {
      setPriceSaving(false);
    }
  };

  const handleClose = () => {
    setForm(initialForm);
    setEditingPlan(null);
    setShowModal(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.subUserPriceSection}>
        <div className={styles.subUserPriceRow}>
          <DollarSign size={20} />
          <div>
            <strong>Sub-user Price</strong>
            <p>Price per additional sub-user beyond plan limit</p>
          </div>
          <input
            className={styles.priceInput}
            type="number"
            min="0"
            value={priceInput}
            onChange={(e) => setPriceInput(e.target.value)}
            placeholder="Enter price"
          />
          <button className={styles.savePriceBtn} onClick={handleSaveSubUserPrice} disabled={priceSaving}>
            {priceSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Plans</h1>
          <p className={styles.subtitle}>Manage subscription plans.</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowModal(true)}>
          <Plus size={18} />
          Add Plan
        </button>
      </div>

      {plans.length > 0 && (
        <div className={styles.planList}>
          {plans.map((plan) => (
            <div key={plan._id || plan.id} className={styles.planCard}>
              <div className={styles.planCardTop}>
                <h3 className={styles.planName}>{plan.name}</h3>
                {plan.popular && <span className={styles.popularBadge}>Popular</span>}
                <div className={styles.planActions}>
                  <button className={styles.actionBtn} onClick={() => handleEdit(plan)} aria-label="Edit plan">
                    <Pencil size={15} />
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={() => handleDelete(plan)}
                    disabled={deletingId === (plan._id || plan.id)}
                    aria-label="Delete plan"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <p className={styles.planBilling}>{plan.billingType}</p>
              <p className={styles.planPrice}>₹{plan.price}</p>
              {plan.tagLine && <p className={styles.planTagLine}>{plan.tagLine}</p>}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.overlay} onClick={handleClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingPlan ? 'Edit Plan' : 'Add Plan'}</h2>
              <button className={styles.closeBtn} onClick={handleClose}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Plan Name *</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g. Basic Plan"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Billing Type</label>
                  <select
                    name="billingType"
                    value={form.billingType}
                    onChange={handleChange}
                    className={styles.input}
                  >
                    {billingOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Price (₹)</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="0"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Tag Line</label>
                  <input
                    name="tagLine"
                    value={form.tagLine}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="e.g. Best for small businesses"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Job Sheet Limit</label>
                  <input
                    name="jobSheetLimit"
                    type="number"
                    min="0"
                    value={form.jobSheetLimit}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="0"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Staff Limit</label>
                  <input
                    name="staffLimit"
                    type="number"
                    min="0"
                    value={form.staffLimit}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Subuser Limit</label>
                  <input
                    name="subuserLimit"
                    type="number"
                    min="0"
                    value={form.subuserLimit}
                    onChange={handleChange}
                    className={styles.input}
                    placeholder="0"
                  />
                </div>
                <div className={styles.field} style={{ visibility: 'hidden' }}>
                  <label className={styles.label}>Placeholder</label>
                  <input className={styles.input} disabled />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.checkLabel}>
                  <input
                    name="popular"
                    type="checkbox"
                    checked={form.popular}
                    onChange={handleChange}
                    className={styles.checkbox}
                  />
                  Mark as Popular
                </label>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Features (one per line)</label>
                <textarea
                  name="features"
                  value={form.features}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows={5}
                  placeholder="24/7 support&#10;Unlimited job sheets&#10;Priority service"
                />
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={handleClose}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={submitting}>
                  {submitting ? 'Saving...' : editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SuperAdminPlans;
