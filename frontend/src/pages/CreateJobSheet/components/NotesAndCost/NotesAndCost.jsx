import styles from './NotesAndCost.module.css';

function NotesAndCost({ form, handleChange, cost, discount, additionalCharges, total }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Cost Breakdown</h2>

      <div className={styles.breakdownBody}>
        <div className={styles.row}>
          <span className={styles.label}>Cost</span>
          <span className={styles.value}>&#x20B9;{cost.toFixed(2)}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Discount</span>
          <div className={styles.inputGroup}>
            <span className={styles.currency}>&#x20B9;</span>
            <input
              className={styles.input}
              name="discount"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.discount}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Additional Charges</span>
          <div className={styles.inputGroup}>
            <span className={styles.currency}>&#x20B9;</span>
            <input
              className={styles.input}
              name="additionalCharges"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={form.additionalCharges}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total Amount</span>
        <span className={styles.totalValue}>&#x20B9;{total.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default NotesAndCost;
