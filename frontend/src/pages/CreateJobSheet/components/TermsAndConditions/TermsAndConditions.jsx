import styles from './TermsAndConditions.module.css';

function TermsAndConditions({ form, handleChange }) {
  const wordCount = form.terms ? form.terms.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Notes &amp; Terms</h2>
      <div className={styles.field}>
        <label className={styles.label}>Internal Notes</label>
        <textarea
          className={styles.textarea}
          name="notes"
          placeholder="Add internal notes"
          value={form.notes}
          onChange={handleChange}
        />
      </div>
      <div className={styles.field} style={{ marginTop: 10 }}>
        <label className={styles.label}>Terms &amp; Conditions</label>
        <textarea
          className={styles.textarea}
          name="terms"
          placeholder="Enter terms and conditions"
          value={form.terms}
          onChange={handleChange}
        />
        <span className={styles.wordCount}>{wordCount}/200 words</span>
      </div>
    </div>
  );
}

export default TermsAndConditions;
