import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';
import { createJobsheet } from '../../../../api/jobsheets';
import styles from './JobsheetPreview.module.css';

function JobsheetPreview({ form, cost, discount, additionalCharges, total, generatedBy, generatedById, role, onConfirm, onClose }) {
  const docRef = useRef(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [generating, setGenerating] = useState(false);

  const handleConfirm = async () => {
    const jobsheetId = crypto.randomUUID();
    console.log({ ...form, cost, discount, additionalCharges, total, generatedBy, generatedById, role, jobsheetId });
    setGenerating(true);
    try {
      const printHtml = getPrintHtml({ form, cost, discount, additionalCharges, total, generatedBy });
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '210mm';
      iframe.style.left = '-9999px';
      iframe.srcdoc = printHtml;
      document.body.appendChild(iframe);

      await new Promise(resolve => { iframe.onload = resolve; });

      const canvas = await html2canvas(iframe.contentDocument.body, { scale: 1, useCORS: true });
      document.body.removeChild(iframe);

      const imgData = canvas.toDataURL('image/jpeg', 0.85);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);

      const formData = new FormData();
      formData.append('pdf', pdfBlob, `Jobsheet-${form.jobsheetNo}.pdf`);
      formData.append('jobsheetNo', form.jobsheetNo);
      formData.append('generatedById', generatedById);
      formData.append('generatedBy', generatedBy);
      formData.append('role', role);
      formData.append('jobsheetId', jobsheetId);
      formData.append('date', form.date);
      formData.append('time', form.time);
      formData.append('company', form.company || '');
      formData.append('gstin', form.gstin || '');
      formData.append('customer', form.customer);
      formData.append('mobile', form.mobile || '');
      formData.append('address1', form.address1 || '');
      formData.append('address2', form.address2 || '');
      formData.append('city', form.city || '');
      formData.append('pincode', form.pincode || '');
      formData.append('state', form.state || '');
      formData.append('productName', form.productName);
      formData.append('category', form.category || '');
      formData.append('serviceType', form.serviceType || '');
      formData.append('serialNumber', form.serialNumber || '');
      formData.append('modelName', form.modelName || '');
      formData.append('technician', form.technician || '');
      formData.append('description', form.description || '');
      formData.append('notes', form.notes || '');
      formData.append('terms', form.terms || '');
      formData.append('cost', cost.toString());
      formData.append('discount', discount.toString());
      formData.append('additionalCharges', additionalCharges.toString());
      formData.append('total', total.toString());

      await createJobsheet(formData);
      toast.success('Jobsheet created successfully');
      setPdfUrl(pdfUrl);
    } catch (err) {
      // Stay on the preview so nothing is lost: closing it here would delete the draft
      // and report success for a jobsheet that was never saved.
      const msg = err?.error || err?.message || 'Failed to create jobsheet';
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `Jobsheet-${form.jobsheetNo}.pdf`;
    a.click();
  };

  const handleExit = () => {
    if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    onConfirm();
  };

  if (pdfUrl) {
    return (
      <div className={styles.overlay}>
        <div className={styles.pdfModal}>
          <div className={styles.pdfToolbar}>
            <span className={styles.pdfTitle}>{form.jobsheetNo}.pdf</span>
            <div className={styles.pdfActions}>
              <button className={styles.downloadBtn} onClick={handleDownload}>Download</button>
              <button className={styles.exitBtn} onClick={handleExit}>Exit</button>
            </div>
          </div>
          <iframe className={styles.pdfViewer} src={pdfUrl} title="Jobsheet PDF" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Preview Jobsheet</h2>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.doc} ref={docRef}>
            <div className={styles.docHeader}>
              <h1 className={styles.docTitle}>Job Sheet</h1>
            </div>

            <div className={styles.meta}>
              <div>
                <strong>Jobsheet No:</strong> {form.jobsheetNo}<br />
                <strong>Date:</strong> {form.date}
              </div>
              <div>
                <strong>Time:</strong> {form.time}
              </div>
            </div>

            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Company Details</h3>
              <div className={styles.fRow}>
                <Field label="Company" value={form.company} />
                <Field label="GSTIN" value={form.gstin} />
              </div>
              <div className={styles.fRow}>
                <Field label="Address" value={[form.address1, form.address2].filter(Boolean).join(', ')} wide />
              </div>
              <div className={styles.fRow}>
                <Field label="City" value={form.city} />
                <Field label="State" value={form.state} />
                <Field label="Pincode" value={form.pincode} />
              </div>
            </div>

            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Product Details</h3>
              <div className={styles.fRow}>
                <Field label="Customer" value={form.customer} />
                <Field label="Mobile" value={form.mobile} />
              </div>
              <div className={styles.fRow}>
                <Field label="Product" value={form.productName} />
                <Field label="Category" value={form.category} />
                <Field label="Service Type" value={form.serviceType} />
              </div>
              <div className={styles.fRow}>
                <Field label="Serial No" value={form.serialNumber} />
                <Field label="Model" value={form.modelName} />
                <Field label="Technician" value={form.technician} />
              </div>
              {form.description && (
                <div className={styles.fRow}>
                  <Field label="Description" value={form.description} wide />
                </div>
              )}
            </div>

            <div className={styles.block}>
              <h3 className={styles.blockTitle}>Cost Breakdown</h3>
              <table className={styles.table}>
                <thead>
                  <tr><th>Item</th><th className={styles.amt}>Amount (₹)</th></tr>
                </thead>
                <tbody>
                  <tr><td>Cost</td><td className={styles.amt}>{cost.toFixed(2)}</td></tr>
                  {discount > 0 && <tr><td>Discount</td><td className={styles.amt}>-{discount.toFixed(2)}</td></tr>}
                  {additionalCharges > 0 && <tr><td>Additional Charges</td><td className={styles.amt}>{additionalCharges.toFixed(2)}</td></tr>}
                  <tr className={styles.totalRow}><td>Total</td><td className={styles.amt}>{total.toFixed(2)}</td></tr>
                </tbody>
              </table>
            </div>

            {form.terms && (
              <div className={styles.block}>
                <h3 className={styles.blockTitle}>Terms &amp; Conditions</h3>
                <p className={styles.termsVal}>{form.terms}</p>
              </div>
            )}

            <div className={styles.signatures}>
              <div className={styles.signatureBox}>
                <div className={styles.signatureLine}></div>
                <span className={styles.signatureLabel}>Customer / Receiver Signature</span>
              </div>
              <div className={styles.signatureBox}>
                <div className={styles.signatureLine}></div>
                <span className={styles.signatureLabel}>Authorized Signatory</span>
              </div>
            </div>
            <div className={styles.footer}>Generated by: {generatedBy || 'Unknown'} &mdash; This is a computer-generated document.</div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.backBtn} onClick={onClose} disabled={generating}>
            Back to edit
          </button>
          <button className={styles.confirmBtn} onClick={handleConfirm} disabled={generating}>
            {generating ? 'Generating PDF...' : 'Confirm & Submit'}
          </button>
        </div>

        {generating && (
          <div className={styles.spinnerOverlay}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </div>
    </div>
  );
}

function getPrintHtml({ form, cost, discount, additionalCharges, total, generatedBy }) {
  return `
    <html>
      <head>
        <style>
          @page { size: A4; margin: 12mm; }
          * { box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1E1B4B; margin: 0; padding: 40px; background: #fff; }
          .print-header { text-align: center; border-bottom: 2px solid #F20519; padding-bottom: 12px; margin-bottom: 16px; }
          .print-header h1 { margin: 0; font-size: 20px; color: #F20519; text-transform: uppercase; letter-spacing: 2px; }
          .print-meta { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 13px; }
          .print-meta div { line-height: 1.6; }
          .print-meta strong { font-weight: 600; }
          .print-section { margin-bottom: 14px; }
          .print-section h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #F20519; border-bottom: 1px solid rgba(30,27,75,0.1); padding-bottom: 4px; margin: 0 0 8px; }
          .print-row { display: flex; gap: 12px; margin-bottom: 4px; }
          .print-field { flex: 1; }
          .print-field.full { flex: 0 0 100%; }
          .print-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; color: rgba(30,27,75,0.5); }
          .print-value { font-size: 13px; margin: 0; }
          .print-table { width: 100%; border-collapse: collapse; margin-top: 6px; }
          .print-table td, .print-table th { padding: 6px 8px; font-size: 12px; text-align: left; }
          .print-table th { background: #FFF5F5; font-size: 10px; text-transform: uppercase; letter-spacing: 0.3px; color: #F20519; border-bottom: 1px solid rgba(242,5,25,0.15); }
          .print-table td { border-bottom: 1px solid rgba(30,27,75,0.06); }
          .print-table .amt { text-align: right; }
          .print-table .total-row td { font-weight: 700; border-top: 2px solid #F20519; border-bottom: none; }
          .print-terms { font-size: 12px; line-height: 1.5; color: #1E1B4B; margin: 0; white-space: pre-wrap; }
          .print-signatures { display: flex; justify-content: space-between; margin: 24px 0 12px; gap: 40px; }
          .print-signature-box { flex: 1; }
          .print-signature-line { border-top: 1px solid rgba(30,27,75,0.3); height: 40px; }
          .print-signature-label { font-size: 11px; color: rgba(30,27,75,0.5); margin-top: 4px; }
          .print-footer { text-align: center; font-size: 11px; color: rgba(30,27,75,0.4); border-top: 1px solid rgba(30,27,75,0.06); padding-top: 10px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="print-header"><h1>Job Sheet</h1></div>
        <div class="print-meta">
          <div><strong>Jobsheet No:</strong> ${form.jobsheetNo}<br><strong>Date:</strong> ${form.date}</div>
          <div><strong>Time:</strong> ${form.time}</div>
        </div>
        <div class="print-section">
          <h3>Company Details</h3>
          <div class="print-row">
            <div class="print-field"><div class="print-label">Company</div><div class="print-value">${form.company || '—'}</div></div>
            <div class="print-field"><div class="print-label">GSTIN</div><div class="print-value">${form.gstin || '—'}</div></div>
          </div>
          <div class="print-row">
            <div class="print-field full"><div class="print-label">Address</div><div class="print-value">${[form.address1, form.address2].filter(Boolean).join(', ') || '—'}</div></div>
          </div>
          <div class="print-row">
            <div class="print-field"><div class="print-label">City</div><div class="print-value">${form.city || '—'}</div></div>
            <div class="print-field"><div class="print-label">State</div><div class="print-value">${form.state || '—'}</div></div>
            <div class="print-field"><div class="print-label">Pincode</div><div class="print-value">${form.pincode || '—'}</div></div>
          </div>
        </div>
        <div class="print-section">
          <h3>Product Details</h3>
          <div class="print-row">
            <div class="print-field"><div class="print-label">Customer</div><div class="print-value">${form.customer || '—'}</div></div>
            <div class="print-field"><div class="print-label">Mobile</div><div class="print-value">${form.mobile || '—'}</div></div>
          </div>
          <div class="print-row">
            <div class="print-field"><div class="print-label">Product</div><div class="print-value">${form.productName || '—'}</div></div>
            <div class="print-field"><div class="print-label">Category</div><div class="print-value">${form.category || '—'}</div></div>
            <div class="print-field"><div class="print-label">Service Type</div><div class="print-value">${form.serviceType || '—'}</div></div>
          </div>
          <div class="print-row">
            <div class="print-field"><div class="print-label">Serial No</div><div class="print-value">${form.serialNumber || '—'}</div></div>
            <div class="print-field"><div class="print-label">Model</div><div class="print-value">${form.modelName || '—'}</div></div>
            <div class="print-field"><div class="print-label">Technician</div><div class="print-value">${form.technician || '—'}</div></div>
          </div>
          <div class="print-row">
            <div class="print-field"><div class="print-label">Description</div><div class="print-value">${form.description || '—'}</div></div>
          </div>
        </div>
        <div class="print-section">
          <h3>Cost Breakdown</h3>
          <table class="print-table">
            <thead><tr><th>Item</th><th class="amt">Amount (₹)</th></tr></thead>
            <tbody>
              <tr><td>Cost</td><td class="amt">${cost ? cost.toFixed(2) : '0.00'}</td></tr>
              ${discount ? `<tr><td>Discount</td><td class="amt">-${discount.toFixed(2)}</td></tr>` : ''}
              ${additionalCharges ? `<tr><td>Additional Charges</td><td class="amt">${additionalCharges.toFixed(2)}</td></tr>` : ''}
              <tr class="total-row"><td>Total</td><td class="amt">${total ? total.toFixed(2) : '0.00'}</td></tr>
            </tbody>
          </table>
        </div>
        <div class="print-section">
          <h3>Terms &amp; Conditions</h3>
          <p class="print-terms">${(form.terms || '').replace(/\n/g, '<br>') || '—'}</p>
        </div>
        <div class="print-signatures">
          <div class="print-signature-box"><div class="print-signature-line"></div><div class="print-signature-label">Customer / Receiver Signature</div></div>
          <div class="print-signature-box"><div class="print-signature-line"></div><div class="print-signature-label">Authorized Signatory</div></div>
        </div>
        <div class="print-footer">Generated by: ${generatedBy || 'Unknown'} &mdash; This is a computer-generated document.</div>
      </body>
    </html>
  `;
}

function Field({ label, value, wide }) {
  if (!value) return null;
  return (
    <div className={`${styles.field} ${wide ? styles.wide : ''}`}>
      <span className={styles.fLabel}>{label}</span>
      <span className={styles.fValue}>{value}</span>
    </div>
  );
}

export default JobsheetPreview;
