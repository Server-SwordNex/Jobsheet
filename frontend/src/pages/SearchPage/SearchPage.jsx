import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Phone, User, Search, Download } from 'lucide-react';
import { searchJobsheet } from '../../api/endpoints';
import AuthShell from '../../components/AuthShell/AuthShell';
import ui from '../../components/AuthShell/AuthShell.module.css';
import { Field, Button } from '../../components/AuthShell/AuthFields';

const STATUS_CLASS = {
  initiated: ui.stInitiated,
  'in-progress': ui.stProgress,
  completed: ui.stDone,
  cancelled: ui.stCancelled,
};

function SearchPage() {
  const [searchData, setSearchData] = useState({ jobId: '', mobileNumber: '', name: '' });
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchData.jobId.trim() || !searchData.mobileNumber.trim()) {
      setError('Job ID and Mobile Number are required');
      return;
    }
    setIsLoading(true);
    setError(null);
    setSearchResults(null);
    try {
      const result = await searchJobsheet(searchData.jobId.trim(), searchData.mobileNumber.trim(), searchData.name.trim());
      setSearchResults(result);
    } catch (err) {
      setError(err?.error || err?.message || 'Failed to search jobsheet');
    } finally {
      setIsLoading(false);
    }
  };

  const r = searchResults;

  return (
    <AuthShell title="Track your job sheet" subtitle="Enter your Job ID and the mobile number you gave us.">
      <form className={ui.form} onSubmit={handleSearch} noValidate>
        {error && <div className={ui.alert}>{error}</div>}

        <Field
          label="Job ID"
          name="jobId"
          icon={FileText}
          placeholder="e.g. JS-JS/001"
          value={searchData.jobId}
          onChange={handleSearchChange}
          autoFocus
        />
        <Field
          label="Mobile number"
          name="mobileNumber"
          type="tel"
          icon={Phone}
          inputMode="tel"
          placeholder="The number on your job sheet"
          value={searchData.mobileNumber}
          onChange={handleSearchChange}
        />
        <Field
          label="Name (optional)"
          name="name"
          icon={User}
          placeholder="Customer name"
          value={searchData.name}
          onChange={handleSearchChange}
        />

        <Button type="submit" loading={isLoading}>
          {!isLoading && <Search size={17} />}
          {isLoading ? 'Searching...' : 'Search job sheet'}
        </Button>
      </form>

      {r && (
        <div className={ui.result}>
          <div className={ui.resultHead}>
            <div>
              <small>JOB SHEET</small>
              <strong>{r.jobsheetNo}</strong>
            </div>
            <span className={`${ui.statusBadge} ${STATUS_CLASS[r.status] || ui.stInitiated}`}>{r.status || 'initiated'}</span>
          </div>

          <div className={ui.resultRow}>
            <span>Customer</span>
            <span>{r.customer || '-'}</span>
          </div>
          <div className={ui.resultRow}>
            <span>Product</span>
            <span>{[r.productName, r.modelName].filter(Boolean).join(' ') || '-'}</span>
          </div>
          <div className={ui.resultRow}>
            <span>Service</span>
            <span>{r.serviceType || 'General Service'}</span>
          </div>
          <div className={ui.resultRow}>
            <span>Date</span>
            <span>{r.date || 'No date'}</span>
          </div>
          <div className={ui.resultRow}>
            <span>Technician</span>
            <span>{r.technician || 'Not assigned'}</span>
          </div>
          {r.description && <p className={ui.resultNote}>{r.description}</p>}
          <div className={ui.resultTotal}>
            <span>Total</span>
            <span>₹{r.total || r.cost || 0}</span>
          </div>

          {r.pdfLink && (
            <a href={r.pdfLink} target="_blank" rel="noopener noreferrer" className={ui.btnGhost} style={{ marginTop: 14, textDecoration: 'none' }}>
              <Download size={16} /> Preview &amp; download PDF
            </a>
          )}
        </div>
      )}

      <p className={ui.switchLine}>
        Run a service business?{' '}
        <Link to="/login" className={ui.link}>
          Sign in
        </Link>{' '}
        or{' '}
        <Link to="/register" className={ui.link}>
          create an account
        </Link>
      </p>
    </AuthShell>
  );
}

export default SearchPage;
