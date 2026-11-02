import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getItem, setItem } from '../../utils/storage';
import { getTechniciansByUser } from '../../api/technicians';
import CompanyDetails from './components/CompanyDetails/CompanyDetails.jsx';
import ProductDetails from './components/ProductDetails/ProductDetails.jsx';
import NotesAndCost from './components/NotesAndCost/NotesAndCost.jsx';
import TermsAndConditions from './components/TermsAndConditions/TermsAndConditions.jsx';
import JobsheetPreview from './components/JobsheetPreview/JobsheetPreview.jsx';
import styles from './CreateJobSheet.module.css';

const DRAFTS_KEY = 'jobsheet_drafts';
const COUNTER_KEY = 'jobsheet_new_counter';

function CreateJobSheet() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isNew = location.pathname.endsWith('/new');
  const draftId = isNew ? null : searchParams.get('draftId');
  const user = getItem('user') || {};
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toTimeString().slice(0, 5);

  const prefix = user.jobSheetPrefix || 'JS';
  const suffix = user.jobSheetSuffix || '001';
  const counter = isNew ? (parseInt(getItem(COUNTER_KEY), 10) || 0) : 0;
  const nextNum = (parseInt(suffix, 10) || 1) + counter;
  const jobsheetNo = `${prefix}-JS/${String(nextNum).padStart(suffix.length, '0')}`;

  const defaults = {
    jobsheetNo, date: today, time: now,
    company: user.companyName || '', gstin: user.gstin || '',
    customer: '', address1: user.addressLine1 || '', address2: user.addressLine2 || '', city: user.city || '', pincode: user.pincode || '', state: user.state || '', mobile: '',
    productName: '', category: '', serviceType: '', serialNumber: '', modelName: '', description: '', cost: '', technician: '',
    notes: '', discount: '', additionalCharges: '', terms: '',
  };

  const changedRef = useRef(false);
  const [technicians, setTechnicians] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    getTechniciansByUser(user.uid || user.id).then(setTechnicians).catch(() => {});
  }, []);

  const allDrafts = getItem(DRAFTS_KEY) || [];
  const loadedDraft = draftId ? allDrafts.find(d => d.id === draftId) : null;
  const [form, setForm] = useState(loadedDraft ? { ...defaults, ...loadedDraft.data } : defaults);

  const handleChange = (e) => {
    if (isNew && !changedRef.current) {
      changedRef.current = true;
      const next = (parseInt(getItem(COUNTER_KEY), 10) || 0) + 1;
      setItem(COUNTER_KEY, next);
    }
    const { name, value } = e.target;
    if (name === 'terms') {
      const words = value.trim().split(/\s+/).filter(Boolean).length;
      if (words > 200) return;
    }
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const cost = parseFloat(form.cost) || 0;
  const discount = parseFloat(form.discount) || 0;
  const additionalCharges = parseFloat(form.additionalCharges) || 0;
  const total = Math.max(0, cost + additionalCharges - discount);

  const saveDrafts = (drafts) => setItem(DRAFTS_KEY, drafts);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.customer.trim()) { toast.error('Customer name is required'); return; }
    if (!form.productName.trim()) { toast.error('Product name is required'); return; }
    setPreviewOpen(true);
  };

  const handleConfirmSubmit = () => {
    const drafts = getItem(DRAFTS_KEY) || [];
    saveDrafts(drafts.filter(d => d.id !== draftId));
    setPreviewOpen(false);
    toast.success('Job sheet created successfully');
    navigate('/dashboard');
  };

  const handleDraft = (e) => {
    e.preventDefault();
    const drafts = getItem(DRAFTS_KEY) || [];
    const existing = drafts.find(d => d.data.jobsheetNo === form.jobsheetNo && d.id !== draftId);
    if (existing) {
      const updated = drafts.map(d =>
        d.id === existing.id ? { ...d, data: form, savedAt: new Date().toISOString() } : d
      );
      saveDrafts(updated);
    } else {
      const id = draftId || Date.now().toString();
      const updated = draftId
        ? drafts.map(d => d.id === draftId ? { ...d, data: form, savedAt: new Date().toISOString() } : d)
        : [...drafts, { id, data: form, savedAt: new Date().toISOString() }];
      saveDrafts(updated);
    }
    toast.success('Draft saved');
  };

  const handleClearForm = () => {
    setForm(defaults);
    toast.info('Form cleared');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <h1 className={styles.heading}>Create Job Sheet</h1>
            <p className={styles.subtitle}>Fill in the details below to create a new job sheet.</p>
          </div>
          <div className={styles.headerActions}>
            {loadedDraft && <span className={styles.draftBadge}>Editing Draft</span>}
            <button type="button" className={styles.draftBtn} onClick={handleDraft}>Save as Draft</button>
          </div>
        </div>
        <div className={styles.headerRow}>
          <div className={styles.headerField}>
            <label className={styles.headerLabel}>Jobsheet No</label>
            <input className={styles.headerInput} name="jobsheetNo" placeholder="Auto or enter" value={form.jobsheetNo} onChange={handleChange} />
          </div>
          <div className={styles.headerField}>
            <label className={styles.headerLabel}>Date</label>
            <input className={styles.headerInput} name="date" type="date" value={form.date} onChange={handleChange} />
          </div>
          <div className={styles.headerField}>
            <label className={styles.headerLabel}>Time</label>
            <input className={styles.headerInput} name="time" type="time" value={form.time} onChange={handleChange} />
          </div>
        </div>
      </div>

      <form onSubmit={handleCreate}>
        <div className={styles.grid}>
          <CompanyDetails form={form} handleChange={handleChange} />
          <ProductDetails form={form} handleChange={handleChange} technicians={technicians} />
          <TermsAndConditions form={form} handleChange={handleChange} />
          <NotesAndCost form={form} handleChange={handleChange} cost={cost} discount={discount} additionalCharges={additionalCharges} total={total} />
        </div>

        <div className={styles.btnRow}>
          <button type="button" className={styles.draftBtn} onClick={handleClearForm}>Clear</button>
          <button type="submit" className={styles.createBtn}>Submit Jobsheet</button>
        </div>
      </form>

      {previewOpen && (
        <JobsheetPreview
          form={form}
          cost={cost}
          discount={discount}
          additionalCharges={additionalCharges}
          total={total}
          generatedBy={user.username}
          generatedById={user.uid}
          role={user.role}
          onConfirm={handleConfirmSubmit}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}

export default CreateJobSheet;
