import React from "react";
import { Trash2 } from "lucide-react";
import styles from "../Settings.module.css";

export default function SubuserCard({ user, onDelete, loading }) {
  if (!user) return null;

  const avatarLetter =
    (user.username || user.subUserName || "U").trim().charAt(0).toUpperCase();

  const addressParts = [
    user.addressLine1,
    user.addressLine2,
    user.city,
  ].filter(Boolean);

  const address = addressParts.join(", ");
  const fullAddress = user.pincode
    ? `${address} - ${user.pincode}`
    : address;

  return (
    <div className={styles.userCard}>

      {/* DELETE */}
      <button
        className={styles.deleteBtn}
        onClick={() => onDelete(user.uid)}
        disabled={loading}
      >
        {loading ? (
          <span className={styles.loader}></span>
        ) : (
          <Trash2 size={12} />
        )}
      </button>

      {/* HEADER */}
      <div className={styles.userHeader}>
        <div className={styles.avatar}>{avatarLetter}</div>

        <div>
          <div className={styles.userName}>
            {user.username || user.subUserName || "Unnamed User"}
          </div>

          <div className={styles.userEmail}>
            {user.email || "No email"}
          </div>
        </div>
      </div>

      {/* DETAILS */}
      <div className={styles.detailsGrid}>
        <div>
          <label>Sub Branch</label>
          <span>{user.subBranchName || "-"}</span>
        </div>

        <div>
          <label>Employee ID</label>
          <span>{user.empId || "-"}</span>
        </div>

        <div>
          <label>City</label>
          <span>{user.city || "-"}</span>
        </div>

        <div>
          <label>State</label>
          <span>{user.state || "-"}</span>
        </div>
      </div>

      {/* ADDRESS */}
      <div className={styles.addressBox}>
        <label>Address</label>
        <p>{fullAddress || "No address provided"}</p>
      </div>
    </div>
  );
}