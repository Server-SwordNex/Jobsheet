import React, { useState } from "react";

import styles from "./Settings.module.css";

import { useNavigate } from "react-router-dom";

/* Components */
import SettingsCard from "./SettingsCard";
import Subuser from "./Subuser/Subuser";
import Support from "./Support/Support";
import Subscription from "./Subscription/Subscription";
import JobsheetSettings from "./JobSheet/JobsheetSettings";
import Security from "./Security/Security";
import TermsCon from "./TermsCon/TermsCon";
import Profile from "./Profile/Profile";
import { getItem } from "../../utils/storage";

export default function SettingsPage() {

  const navigate = useNavigate();

  const [activeConfig, setActiveConfig] =
    useState(null);

  const organisationItems = [
    "Profile",
    "Subscriptions",
    "Support",
    "Jobsheet",
  ];

  const securityItems = [
    "Security Settings",
  ];

  const configItems = [
    "Terms & Conditions",
    "Sub-Users",
  ];

  const userData = getItem("user") || {};

  /* ================= CLOSE ACTIVE SECTION ================= */

  const closeSection = () => {
    setActiveConfig(null);
  };

  return (
    <div className={styles.content}>

      <h1 className={styles.pageTitle}>
        Organisation Settings
      </h1>

      {/* ================= CARDS ================= */}

      <div className={styles.cardGrid}>

        <SettingsCard
          title="Organisation"
          items={organisationItems}
          onItemClick={setActiveConfig}
          activeConfig={activeConfig}
        />

        {!userData.isGoogleAuth && (
          <SettingsCard
            title="Security"
            items={securityItems}
            onItemClick={setActiveConfig}
            activeConfig={activeConfig}
          />
        )}

        <SettingsCard
          title="Configuration"
          items={configItems}
          onItemClick={setActiveConfig}
          activeConfig={activeConfig}
        />

      </div>

      {/* ================= ACTIVE SECTION ================= */}

      {activeConfig && (
        <div className={styles.activeWrapper}>

          <div className={styles.activeHeader}>
            <h2 className={styles.activeTitle}>
              {activeConfig}
            </h2>
            <button className={styles.closeBtn} onClick={closeSection}>
              ✕
            </button>
          </div>

          {activeConfig === "Terms & Conditions" && <TermsCon />}
          {activeConfig === "Sub-Users" && <Subuser />}
          {activeConfig === "Security Settings" && <Security />}
          {activeConfig === "Profile" && <Profile />}
          {activeConfig === "Subscriptions" && (
            <Subscription onUpgrade={() => navigate("/pricing")} />
          )}
          {activeConfig === "Support" && <Support />}
          {activeConfig === "Jobsheet" && <JobsheetSettings />}

        </div>
      )}

      {/* ================= VERSION WATERMARK ================= */}

      <div className={styles.versionMark}>
        SwordNex Jobsheet • v1.01
      </div>

    </div>
  );
}
