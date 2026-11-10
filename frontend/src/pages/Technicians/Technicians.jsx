import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { getItem } from '../../utils/storage';
import { getTechniciansByUser, addTechnician, editTechnician, removeTechnician, getTechnicianWithJobsheets } from '../../api/technicians';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './Technicians.module.css';

const emptyForm = { name: '', email: '', mobileNo: '' };

function Technicians() {
  const user = getItem('user') || {};
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [jobsPopup, setJobsPopup] = useState(null);
  const [jobsData, setJobsData] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const fetchData = async () => {

    try {
      const data = await getTechniciansByUser(user.uid || user.id);
      setTechnicians(data);
    } catch {
      toast.error('Failed to load technicians');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData() }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const field = name === 'techMobile' ? 'mobileNo' : name;
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (tech) => {
    setEditingId(tech._id || tech.id);
    setForm({ name: tech.name || '', email: tech.email || '', mobileNo: tech.mobileNo || '' });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { toast.error('Name is required'); return; }
    if (!form.mobileNo.trim()) { toast.error('Mobile number is required'); return; }
    setSubmitting(true);
    try {
      const payload = { ...form, technicianOf: user.uid || user.id || '' };
      if (editingId) {
        await editTechnician(editingId, { name: form.name, mobileNo: form.mobileNo });
        toast.success('Technician updated');
      } else {
        await addTechnician(payload);
        toast.success('Technician added');
      }
      setModalOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      fetchData();
    } catch (err) {
      const msg = err?.message || err?.error || 'Operation failed';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const openJobsPopup = async (tech) => {
    setJobsPopup(tech);
    setJobsData([]);
    setLoadingJobs(true);
    try {
      const data = await getTechnicianWithJobsheets(tech._id || tech.id);
      setJobsData(data.jobsheets || []);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete technician "${name}"?`)) return;
    try {
      await removeTechnician(id);
      toast.success('Technician deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete technician');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Technicians</h1>
          <p className={styles.subtitle}>Manage your service technicians</p>
        </div>
        <button className={styles.addBtn} onClick={openAdd}>+ Add Technician</button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : technicians.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyText}>No technicians yet</p>
          <button className={styles.addBtn} onClick={openAdd}>Add your first technician</button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Assigned Jobs</th>
                <th>Jobsheets</th>
                <th className={styles.thActions}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {technicians.map(tech => (
                  <tr key={tech._id || tech.id} className={styles.clickableRow} onClick={() => openJobsPopup(tech)}>
                    <td className={styles.tdName}>{tech.name}</td>
                    <td className={styles.tdMuted}>{tech.email || '—'}</td>
                    <td className={styles.tdMuted}>{tech.mobileNo}</td>
                    <td><span className={styles.countBadge}>{tech.totalAssignedJobs ?? 0}</span></td>
                    <td className={styles.tdJobsheets}>
                      {(tech.assignedJobsheets || []).length > 0
                        ? tech.assignedJobsheets.map((j) => (typeof j === 'object' ? (j.jobsheetNo || j.id || j._id || '') : j)).join(', ')
                        : '—'}
                    </td>
                    <td className={styles.tdActions}>
                    <button className={styles.editBtn} onClick={(e) => { e.stopPropagation(); openEdit(tech); }}>Edit</button>
                    <button className={styles.deleteBtn} onClick={(e) => { e.stopPropagation(); handleDelete(tech._id || tech.id, tech.name); }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {jobsPopup && (
        <div className={styles.overlay} onClick={() => { setJobsPopup(null); setJobsData([]); }}>
          <div className={styles.jobsModal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Jobs — {jobsPopup.name}</h2>
              <button className={styles.closeBtn} onClick={() => { setJobsPopup(null); setJobsData([]); }}>&times;</button>
            </div>
            <div className={styles.modalBody}>
              {loadingJobs ? (
                <LoadingSpinner />
              ) : jobsData.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'rgba(30,27,75,0.4)', margin: '32px 0' }}>No jobs assigned</p>
              ) : (
                <>
                  <div className={styles.jobsSummary}>
                    <div className={styles.summaryItem}>
                      <span className={styles.summaryCount}>{jobsData.length}</span>
                      <span className={styles.summaryLabel}>Total</span>
                    </div>
                    {['initiated', 'in-progress', 'completed', 'cancelled'].map((s) => {
                      const count = jobsData.filter((j) => (j.status || 'initiated') === s).length;
                      if (count === 0) return null;
                      return (
                        <div key={s} className={`${styles.summaryItem} ${styles[`sum_${s}`]}`}>
                          <span className={styles.summaryCount}>{count}</span>
                          <span className={styles.summaryLabel}>{s}</span>
                        </div>
                      );
                    })}
                  </div>
                  <table className={styles.jobsTable}>
                  <thead>
                    <tr>
                      <th>Jobsheet No</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Service Type</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobsData.map((job, i) => (
                      <tr key={job._id || job.id || i}>
                        <td className={styles.jobCellJobNo}>{job.jobsheetNo || '—'}</td>
                        <td>{job.customer || '—'}</td>
                        <td>{job.productName || '—'}</td>
                        <td>{job.serviceType || '—'}</td>
                        <td><span className={`${styles.popupStatusBadge} ${styles[`ps_${job.status || 'initiated'}`]}`}>{job.status || 'initiated'}</span></td>
                        <td>{job.date || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div className={styles.overlay} onClick={() => setModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editingId ? 'Edit Technician' : 'Add Technician'}</h2>
              <button className={styles.closeBtn} onClick={() => setModalOpen(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className={styles.modalBody}>
                <div className={styles.field}>
                  <label className={styles.label}>Name</label>
                  <input
                    className={styles.input}
                    name="name"
                    placeholder="Enter name"
                    value={form.name}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                    className={styles.input}
                    name="email"
                    type="email"
                    placeholder="Enter email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Mobile No</label>
                  <input
                    className={styles.input}
                    name="techMobile"
                    id="techMobile"
                    type="text"
                    inputMode="numeric"
                    placeholder="Enter mobile number"
                    value={form.mobileNo || ''}
                    onChange={handleChange}
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Technicians;
