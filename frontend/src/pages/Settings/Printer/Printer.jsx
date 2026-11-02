import React, { useState, useEffect } from "react";
import styles from "./Printer.module.css";

export default function Printer({ initialSettings, onSave }) {
  const [isEditing, setIsEditing] = useState(false);

  const [settings, setSettings] = useState({
    category: "Mobile",
    printerFormat: "A4",
    autoPrint: true,
  });

  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleToggle = () => {
    setSettings((prev) => ({
      ...prev,
      autoPrint: !prev.autoPrint,
    }));
  };

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setSettings(initialSettings);
    setIsEditing(false);
  };

  const handleSave = () => {
    onSave?.(settings);
    setIsEditing(false);
  };

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div style={{display: "flex", gap: "12px", alignItems: "center"}}>
            <div className={styles.subuserIcon}>
                <i class="fa-solid fa-print"></i>
            </div>
            <div>
                <h2>Printer Settings</h2>
                <p className={styles.subText}>
                Configure your printer preferences and auto-print options.
                </p>
            </div>
        </div>

        {!isEditing ? (
          <button
            className={styles.editBtn}
            onClick={handleEdit}
          >
            <i className="fa-solid fa-pen" style={{marginRight: "6px"}}></i>
            Edit
          </button>
        ) : (
          <div className={styles.actionsTop}>
            <button
              className={styles.cancelTop}
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              className={styles.saveTop}
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        )}
      </div>

      <div className={styles.card}>
        {/* Category */}
        <div className={styles.field}>
          <label>CATEGORY</label>

          {!isEditing ? (
            <div className={styles.value}>
              {settings.category}
            </div>
          ) : (
            <select
              name="category"
              value={settings.category}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="Mobile">Mobile</option>
              <option value="Desktop">Desktop</option>
              <option value="Thermal">Thermal</option>
            </select>
          )}
        </div>

        {/* Printer Format */}
        <div className={styles.field}>
          <label>PRINTER FORMAT</label>

          {!isEditing ? (
            <div className={styles.value}>
              {settings.printerFormat}
            </div>
          ) : (
            <select
              name="printerFormat"
              value={settings.printerFormat}
              onChange={handleChange}
              className={styles.input}
            >
              <option value="A4">A4</option>
              <option value="A5">A5</option>
              <option value="Thermal 80mm">
                Thermal 80mm
              </option>
            </select>
          )}
        </div>

        {/* Auto Print */}
        <div className={styles.fieldRow}>
          <div>
            <label>
              Auto-Print on Sale
            </label>

            <p className={styles.description}>
              Automatically trigger print dialog after
              completing a sale
            </p>
          </div>

          {!isEditing ? (
            <span
              className={
                settings.autoPrint
                  ? styles.enabled
                  : styles.disabled
              }
            >
              {settings.autoPrint
                ? "Enabled"
                : "Disabled"}
            </span>
          ) : (
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={settings.autoPrint}
                onChange={handleToggle}
              />
              <span className={styles.slider}></span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}