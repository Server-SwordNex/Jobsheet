import React from "react";
import styles from "./AccStatus.module.css";

export default function AccStatus({ account }) {
  const verificationStatus = account?.verification || "Pending";
  const createdDate = account?.created || "--";
  const lastLogin = account?.lastLogin || "--";

  return (
    <div className={styles.accountSection}>
        <div style={{display: "flex", gap: "12px", alignItems: "center", marginBottom: "24px"}}>
            <div className={styles.subuserIcon}>
                <i class="fa-solid fa-file-invoice-dollar"></i>
            </div>
            <div>
                <h2>Account Status</h2>
                <p className={styles.subText}>
                View your account verification and activity details.
                </p>
            </div>
        </div>

      <div className={styles.card}>
        <div className={styles.statusGrid}>

          <div className={styles.statusBlock}>
            <label>Verification</label>

            <div
              className={`${styles.statusBadge} ${
                verificationStatus.toLowerCase() === "verified"
                  ? styles.verified
                  : styles.pending
              }`}
            >
              {verificationStatus}
            </div>
          </div>

          <div className={styles.statusBlock}>
            <label>Created</label>

            <div className={styles.value}>
              {createdDate}
            </div>
          </div>

          <div className={styles.statusBlock}>
            <label>Last Login</label>

            <div className={styles.value}>
              {lastLogin}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}