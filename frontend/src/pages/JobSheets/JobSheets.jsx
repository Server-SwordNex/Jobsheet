import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Plus, Search, FileText, RefreshCw, X, Download, XCircle, ChevronDown } from 'lucide-react';
import { getItem } from '../../utils/storage';
import { getJobsheetsByUser, updateJobsheetStatus } from '../../api/jobsheets';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './JobSheets.module.css';

function JobSheets() {
  const navigate = useNavigate();
  const user = getItem('user') || {};
  const uid = user.uid || user.id;
  const [jobsheets, setJobsheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pdfView, setPdfView] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState('');
  const [statusOpenId, setStatusOpenId] = useState(null);
  const [statusPos, setStatusPos] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    getJobsheetsByUser(uid)
      .then(setJobsheets)
      .catch(() => setJobsheets([]))
      .finally(() => setLoading(false));
  }, [uid]);

  useEffect(() => {
    if (!statusOpenId) return;
    const handler = () => { setStatusOpenId(null); setStatusPos(null); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [statusOpenId]);

  const allServiceTypes = useMemo(
    () => [...new Set(jobsheets.map((js) => js.serviceType).filter(Boolean))],
    [jobsheets],
  );
  const allCategories = useMemo(
    () => [...new Set(jobsheets.map((js) => js.category).filter(Boolean))],
    [jobsheets],
  );
  const allStatuses = useMemo(
    () => [...new Set(jobsheets.map((js) => js.status).filter(Boolean))],
    [jobsheets],
  );
  const allTechnicians = useMemo(
    () => [...new Set(jobsheets.map((js) => js.technician).filter(Boolean))],
    [jobsheets],
  );

  const hasActiveFilters = dateFrom || dateTo || serviceTypeFilter || categoryFilter || statusFilter || technicianFilter;

  const clearFilters = () => {
    setDateFrom('');
    setDateTo('');
    setServiceTypeFilter('');
    setCategoryFilter('');
    setStatusFilter('');
    setTechnicianFilter('');
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    setStatusOpenId(null);
    try {
      await updateJobsheetStatus(id, newStatus);
      setJobsheets((prev) =>
        prev.map((js) => ((js.id || js._id) === id ? { ...js, status: newStatus } : js)),
      );
      toast.success(`Status updated to "${newStatus}"`);
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const openPdf = (url) => {
    if (url) setPdfView(url);
  };

  const csvText = (val) => {
    const s = String(val ?? '');
    return /^\d{5,}$/.test(s) ? `"\t${s}"` : `"${s.replace(/"/g, '""')}"`;
  };

  const exportCSV = () => {
    const headers = [
      'Jobsheet No', 'Date', 'Customer', 'Mobile', 'Product', 'Category',
      'Model', 'Serial No', 'Service Type', 'Technician', 'Cost',
    ];
    const rows = filtered.map((js) => [
      js.jobsheetNo, js.date, js.customer, js.mobile,
      js.productName, js.category, js.modelName,
      js.serialNumber, js.serviceType, js.technician, js.cost,
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.map(csvText).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jobsheets_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const parseDate = (d) => { const t = Date.parse(d); return isNaN(t) ? null : t; };

  const filtered = jobsheets.filter((js) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (
        !(js.jobsheetNo && js.jobsheetNo.toLowerCase().includes(q)) &&
        !(js.customer && js.customer.toLowerCase().includes(q)) &&
        !(js.productName && js.productName.toLowerCase().includes(q)) &&
        !(js.technician && js.technician.toLowerCase().includes(q)) &&
        !(js.mobile && js.mobile.includes(q))
      ) return false;
    }
    if (dateFrom) {
      const ts = parseDate(js.date);
      const from = parseDate(dateFrom);
      if (ts === null || from === null || ts < from) return false;
    }
    if (dateTo) {
      const ts = parseDate(js.date);
      const to = parseDate(dateTo);
      if (ts === null || to === null || ts > to) return false;
    }
    if (serviceTypeFilter && js.serviceType !== serviceTypeFilter) return false;
    if (categoryFilter && js.category !== categoryFilter) return false;
    if (statusFilter && js.status !== statusFilter) return false;
    if (technicianFilter && js.technician !== technicianFilter) return false;
    return true;
  });

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.heading}>Job Sheets</h1>
          <p className={styles.subtitle}>Manage and track all your job sheets.</p>
        </div>
        <div className={styles.topActions}>
          <button className={styles.exportBtn} onClick={exportCSV} disabled={filtered.length === 0}>
            <Download size={16} />
            Export as CSV
          </button>
          <button className={styles.createBtn} onClick={() => navigate('/create-job-sheet/new')}>
            <Plus size={18} />
            Create Jobsheet
          </button>
        </div>
      </div>

      <div className={styles.searchBarRow}>
        <div className={styles.searchBar}>
          <Search size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Search by jobsheet no, customer, product, technician..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.filterRow}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>From</label>
            <input
              className={styles.filterInput}
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>To</label>
            <input
              className={styles.filterInput}
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Service Type</label>
            <select
              className={styles.filterSelect}
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
            >
              <option value="">All</option>
              {allServiceTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Category</label>
            <select
              className={styles.filterSelect}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Technician</label>
            <select
              className={styles.filterSelect}
              value={technicianFilter}
              onChange={(e) => setTechnicianFilter(e.target.value)}
            >
              <option value="">All</option>
              {allTechnicians.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status</label>
            <select
              className={styles.filterSelect}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              {allStatuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button className={styles.clearFiltersBtn} onClick={clearFilters} title="Clear all filters">
              <XCircle size={14} />
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : jobsheets.length === 0 ? (
        <div className={styles.emptyState}>
          <FileText size={40} />
          <p>No job sheets yet</p>
          <button className={styles.createBtn} onClick={() => navigate('/create-job-sheet/new')}>
            Create your first jobsheet
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <Search size={40} />
          <p>No results match your search</p>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Jobsheet</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Service</th>
                <th>Assigned to</th>
                <th>Cost</th>
                <th className={styles.thActions}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((js, i) => (
                <tr key={js.id || js._id || i} className={js.pdfLink ? styles.clickableRow : ''} onClick={() => openPdf(js.pdfLink)}>
                  <td>
                    <div className={styles.cellJobNo}>{js.jobsheetNo}</div>
                    <div className={styles.cellSub}>{js.date}</div>
                  </td>
                  <td>
                    <div className={styles.cellPrimary}>{js.customer}</div>
                    <div className={styles.cellSub}>{js.mobile || '—'}</div>
                  </td>
                  <td>
                    <div className={styles.cellPrimary}>{js.productName}</div>
                    <div className={styles.cellSub}>{[js.category, js.modelName].filter(Boolean).join(' · ') || '—'}</div>
                  </td>
                  <td>
                    <div className={styles.cellPrimary}>{String(js.serialNumber ?? '') || '—'}</div>
                    <div className={styles.cellSub}>{js.serviceType || '—'}</div>
                  </td>
                  <td>
                    <span className={styles.technicianBadge}>{js.technician || '—'}</span>
                  </td>
                  <td className={styles.tdAmt}>
                    {js.cost ? `₹${Number(js.cost).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className={styles.tdActions}>
                    <div className={styles.statusCell}>
                      <span className={`${styles.statusBadge} ${styles[`status_${js.status || 'initiated'}`]}`}>
                        {js.status || 'initiated'}
                      </span>
                      <div className={styles.statusDropdownWrap}>
                        <button
                          className={styles.actionBtn}
                          title="Update Status"
                          disabled={updatingId === (js.id || js._id)}
                          ref={(el) => { if (el) el.dataset.statusBtn = js.id || js._id; }}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (statusOpenId === (js.id || js._id)) { setStatusOpenId(null); setStatusPos(null); return; }
                            const rect = e.currentTarget.getBoundingClientRect();
                            setStatusPos({ top: rect.bottom + 4, right: document.documentElement.clientWidth - rect.right });
                            setStatusOpenId(js.id || js._id);
                          }}
                        >
                          {updatingId === (js.id || js._id) ? <span className={styles.spinner} /> : <ChevronDown size={14} />}
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {statusOpenId && statusPos && (
        <div
          className={styles.statusDropdown}
          style={{ position: 'fixed', top: statusPos.top, right: statusPos.right, zIndex: 1001 }}
          onClick={(e) => e.stopPropagation()}
        >
          {['initiated', 'in-progress', 'completed', 'cancelled'].map((s) => (
            <button
              key={s}
              className={`${styles.statusOption} ${filtered.find((js) => (js.id || js._id) === statusOpenId)?.status === s ? styles.statusOptionActive : ''}`}
              onClick={(e) => { e.stopPropagation(); handleStatusChange(statusOpenId, s); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {pdfView && (
        <div className={styles.overlay} onClick={() => setPdfView(null)}>
          <div className={styles.pdfModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.pdfToolbar}>
              <span className={styles.pdfTitle}>Jobsheet Preview</span>
              <div className={styles.pdfActions}>
                <a className={styles.downloadBtn} href={pdfView} download target="_blank" rel="noopener noreferrer">
                  <Download size={14} />
                  Download
                </a>
                <button className={styles.closeBtn} onClick={() => setPdfView(null)}>
                  <X size={16} />
                </button>
              </div>
            </div>
            <iframe className={styles.pdfIframe} src={pdfView} title="Jobsheet PDF" />
          </div>
        </div>
      )}
    </div>
  );
}

export default JobSheets;
