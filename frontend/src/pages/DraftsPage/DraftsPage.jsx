import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getItem, setItem } from '../../utils/storage';
import styles from './DraftsPage.module.css';

const DRAFTS_KEY = 'jobsheet_drafts';

function DraftsPage() {
  const navigate = useNavigate();
  const [drafts, setDrafts] = useState(getItem(DRAFTS_KEY) || []);

  const handleDelete = (id) => {
    const updated = drafts.filter(d => d.id !== id);
    setItem(DRAFTS_KEY, updated);
    setDrafts(updated);
  };

  const handleLoad = (id) => {
    navigate(`/create-job-sheet?draftId=${id}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Drafts</h1>
        <p className={styles.subtitle}>{drafts.length} draft{drafts.length !== 1 ? 's' : ''} saved locally</p>
      </div>

      {drafts.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <p className={styles.emptyText}>No drafts yet</p>
          <button className={styles.createBtn} onClick={() => navigate('/create-job-sheet/new')}>
            Create a Job Sheet
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {drafts.map(draft => (
            <div key={draft.id} className={styles.tile}>
              <div className={styles.tileHeader}>
                <span className={styles.tileJobNo}>{draft.data.jobsheetNo || '—'}</span>
                <span className={styles.tileDate}>
                  {draft.savedAt ? new Date(draft.savedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </span>
              </div>
              <div className={styles.tileBody}>
                {draft.data.customer && (
                  <div className={styles.tileRow}>
                    <span className={styles.tileLabel}>Customer</span>
                    <span className={styles.tileValue}>{draft.data.customer}</span>
                  </div>
                )}
                {draft.data.productName && (
                  <div className={styles.tileRow}>
                    <span className={styles.tileLabel}>Product</span>
                    <span className={styles.tileValue}>{draft.data.productName}</span>
                  </div>
                )}
                {draft.data.serialNumber && (
                  <div className={styles.tileRow}>
                    <span className={styles.tileLabel}>Serial No</span>
                    <span className={styles.tileValue}>{draft.data.serialNumber}</span>
                  </div>
                )}
                {draft.data.mobile && (
                  <div className={styles.tileRow}>
                    <span className={styles.tileLabel}>Mobile</span>
                    <span className={styles.tileValue}>{draft.data.mobile}</span>
                  </div>
                )}
              </div>
              <div className={styles.tileFooter}>
                <button className={styles.loadBtn} onClick={() => handleLoad(draft.id)}>
                  Load Draft
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(draft.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DraftsPage;
