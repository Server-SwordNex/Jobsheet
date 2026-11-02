import { useState } from 'react';
import { Link } from 'react-router-dom';
import TypingText from '../../components/TypingText/TypingText';
import logo from '../../assets/jobsheet-logo.png';
import { searchJobsheet } from '../../api/endpoints';
import styles from './SearchPage.module.css';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);



const Spinner = () => (
  <svg className={styles.spinner} width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

function SearchPage() {
  const [searchData, setSearchData] = useState({ jobId: '', mobileNumber: '', name: '' });
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchData(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchData.jobId || !searchData.mobileNumber) {
      setError("Job ID and Mobile Number are required");
      return;
    }
    setIsLoading(true);
    setError(null);
    setSearchResults(null);
    try {
      const result = await searchJobsheet(searchData.jobId, searchData.mobileNumber, searchData.name);
      setSearchResults(result);
    } catch (err) {
      console.error(err);
      setError(err.error || err.message || "Failed to search jobsheet");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.brandLogo}>
            <img src={logo} alt="SwordNex" className={styles.logoImg} />
          </div>
          <div className={styles.brandTagline}>
            <h1 className={styles.brandTitle}>
              <TypingText text="Jobsheet Management" speed={60} />
            </h1>
            <p className={styles.brandDesc}>
              Track, manage, and update work orders seamlessly. Stay on top of every job from start to finish.
            </p>
          </div>
        </div>
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.gridPattern} />
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formContent}>
          <div className={styles.tabPanel}>
            <form onSubmit={handleSearch} className={styles.form}>
              <div className={styles.field}>
                <input
                  type="text"
                  id="jobId"
                  name="jobId"
                  placeholder=" "
                  value={searchData.jobId}
                  onChange={handleSearchChange}
                  className={styles.input}
                />
                <label htmlFor="jobId" className={styles.label}>Job ID</label>
              </div>
              <div className={styles.field}>
                <input
                  type="tel"
                  id="mobileNumber"
                  name="mobileNumber"
                  placeholder=" "
                  value={searchData.mobileNumber}
                  onChange={handleSearchChange}
                  className={styles.input}
                />
                <label htmlFor="mobileNumber" className={styles.label}>Mobile Number</label>
              </div>
              <div className={styles.field}>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder=" "
                  value={searchData.name}
                  onChange={handleSearchChange}
                  className={styles.input}
                />
                <label htmlFor="name" className={styles.label}>Name (Optional)</label>
              </div>
              <button type="submit" className={styles.submitBtn} disabled={isLoading}>
                {isLoading ? <Spinner /> : <SearchIcon />}
                {isLoading ? 'Searching...' : 'Search Jobsheet'}
              </button>
            </form>

            {error && (
              <div className={styles.errorMsg} style={{ marginTop: '16px' }}>
                {error}
              </div>
            )}

            {searchResults && (
              <div className={styles.resultsCard}>
                <div className={styles.resultsHeader}>
                  <h3 className={styles.jobTitle}>{searchResults.jobsheetNo}</h3>
                  <span className={styles.jobCompany}>{searchResults.customer}</span>
                </div>
                <div className={styles.jobMeta}>
                  <span>{searchResults.productName} {searchResults.modelName || ''}</span>
                  <span className={styles.dot}>·</span>
                  <span>{searchResults.date || 'No Date'}</span>
                </div>
                <div className={styles.jobSalary}>
                  {searchResults.serviceType || 'General Service'} &mdash; ₹{searchResults.total || searchResults.cost || 0}
                </div>
                {searchResults.description && (
                  <p className={styles.jobDescription}>{searchResults.description}</p>
                )}
                <div className={styles.jobFooter}>
                  <span className={styles.applicants}>
                    Technician: {searchResults.technician || 'Not Assigned'}
                  </span>
                  <span className={`${styles.statusBadge} ${styles[searchResults.status?.toLowerCase() || 'initiated']}`}>
                    {searchResults.status}
                  </span>
                </div>
                
                {searchResults.pdfLink && (
                  <div className={styles.pdfActions}>
                    <a 
                      href={searchResults.pdfLink} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.pdfBtn}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Preview & Download PDF
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          <p>&copy; 2026 SwordNex. All rights reserved.</p>
          <div className={styles.footerLinks}>
            <Link to="/login">Sign In</Link>
            <Link to="/register">Register</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchPage;
