import styles from './CompanyDetails.module.css';

function CompanyDetails({ form, handleChange }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Company Details</h2>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Company Name</label>
          <input className={styles.input} name="company" placeholder="Enter company name" value={form.company} onChange={handleChange} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>GSTIN</label>
          <input className={styles.input} name="gstin" placeholder="Enter GSTIN" value={form.gstin} onChange={handleChange} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Address Line 1</label>
          <input className={styles.input} name="address1" placeholder="Enter address line 1" value={form.address1} onChange={handleChange} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Address Line 2</label>
          <input className={styles.input} name="address2" placeholder="Enter address line 2" value={form.address2} onChange={handleChange} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>City</label>
          <input className={styles.input} name="city" placeholder="Enter city" value={form.city} onChange={handleChange} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Pincode</label>
          <input className={styles.input} name="pincode" placeholder="Enter pincode" value={form.pincode} onChange={handleChange} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>State</label>
          <input className={styles.input} name="state" placeholder="Enter state" value={form.state} onChange={handleChange} />
        </div>
      </div>
    </div>
  );
}

export default CompanyDetails;
