import styles from './ProductDetails.module.css';

function ProductDetails({ form, handleChange, technicians = [] }) {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Product Details</h2>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Customer Name</label>
          <input className={styles.input} name="customer" placeholder="Enter customer name" value={form.customer} onChange={handleChange} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Mobile</label>
          <input className={styles.input} name="mobile" type="tel" placeholder="Enter mobile number" value={form.mobile} onChange={handleChange} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Product Name</label>
          <input className={styles.input} name="productName" placeholder="Enter product name" value={form.productName} onChange={handleChange} />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Category</label>
          <select className={styles.select} name="category" value={form.category} onChange={handleChange}>
            <option value="">Select category</option>
            <option value="electronics">Electronics</option>
            <option value="appliance">Appliance</option>
            <option value="it">IT Equipment</option>
            <option value="furniture">Furniture</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Service Type</label>
          <select className={styles.select} name="serviceType" value={form.serviceType} onChange={handleChange}>
            <option value="">Select service type</option>
            <option value="repair">Repair</option>
            <option value="maintenance">Maintenance</option>
            <option value="installation">Installation</option>
            <option value="inspection">Inspection</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Serial Number</label>
          <input className={styles.input} name="serialNumber" placeholder="Enter serial number" value={form.serialNumber} onChange={handleChange} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Technician</label>
          <select className={styles.select} name="technician" value={form.technician} onChange={handleChange}>
            <option value="">Select technician</option>
            {technicians.map(t => (
              <option key={t._id || t.id} value={t.name}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Model Name</label>
          <input className={styles.input} name="modelName" placeholder="Enter model name" value={form.modelName} onChange={handleChange} />
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Cost (&#x20B9;)</label>
          <input className={styles.input} name="cost" type="number" min="0" step="0.01" placeholder="0.00" value={form.cost} onChange={handleChange} />
        </div>
        <div className={styles.field} />
      </div>
      <div className={styles.field}>
        <label className={styles.label}>Description</label>
        <textarea className={styles.textarea} name="description" placeholder="Describe the product" value={form.description} onChange={handleChange} />
      </div>
    </div>
  );
}

export default ProductDetails;
