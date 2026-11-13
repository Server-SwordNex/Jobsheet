import React, { useEffect, useState } from "react";
import styles from "./Subscription.module.css";
import { useEntitlements } from "../../../context/EntitlementsContext";
import { IdCard } from "lucide-react";

export default function Subscription({ onUpgrade }) {
  const { entitlements } = useEntitlements();
  const isFree = entitlements?.pricingEnabled === false;
  const [subscription, setSubscription] = useState({
    plan: "-",
    planStartdDate: "-",
    planEndDate: "-",
  });

  const formatFirestoreDate = (timestamp) => {
    if (!timestamp) return "-";

    // Firestore timestamp format
    if (timestamp._seconds) {
      return new Date(timestamp._seconds * 1000).toLocaleString("en-IN");
    }

    // already normal date
    return new Date(timestamp).toLocaleString("en-IN");
  };

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    const data = localStorage.getItem("user");
    console.log(data);

    if (data) {
      try {
        const parsed = JSON.parse(data);

        setSubscription({
          plan: parsed.plan || "Free",
          planStartDate: formatFirestoreDate(parsed.planStartDate),
          planEndDate: formatFirestoreDate(parsed.planEndDate),
        });

      } catch (err) {
        console.error("Invalid subscription data", err);
      }
    }
  }, []);

  return (
    <div className={styles.subscriptionSection}>

      {/* HEADER */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "14px" }}>
        <div className={styles.subuserIcon}>
          <IdCard size={18} />
        </div>

        <div>
          <h2 style={{ fontSize: 16, margin: 0 }}>Subscriptions</h2>
          <p className={styles.subText}>
            Manage your current subscription plan and upgrade when needed.
          </p>
        </div>
      </div>

      {/* CARD */}
      <div className={styles.card}>
        <div className={styles.planInfo}>

          <div className={styles.planBlock}>
            <label>Current Plan</label>
            <div className={styles.planName}>
              {isFree ? "Free for everyone" : subscription.plan}
            </div>
          </div>

          {!isFree && (
            <>
          <div className={styles.planBlock}>
            <label>Starts from</label>
            <div className={styles.starts}>
              {subscription.planStartDate}
            </div>
          </div>

          <div className={styles.planBlock}>
            <label>Expires on</label>
            <div className={styles.expiry}>
              {subscription.planEndDate}
            </div>
          </div>


            </>
          )}
        </div>

        {!isFree && (
          <>
        {/* ACTION */}
        <div className={styles.actions}>
          <button
            className={styles.upgradeBtn}
            onClick={onUpgrade}
          >
            Upgrade Plan
          </button>
        </div>
          </>
        )}
      </div>
    </div>
  );
}