import React from "react";
import styles from "./Settings.module.css";

export default function SettingsCard({
  title,
  items,
  color,
  onItemClick,
  activeConfig
}) {
  return (
    <div
      className={`${styles.settingsCard} ${
        styles[color]
      }`}
    >
      <h3 style={{paddingLeft: "8px", paddingBottom: "8px", borderBottom: "1px solid rgba(242,5,25,0.1)", color: "#1E1B4B", marginBottom: "4px", fontSize: 13}}>
        {title}
      </h3>

      {items.map((item) => (
        <div
          key={item}
          className={ activeConfig === item ? styles.activeItem : styles.settingItem }
          onClick={() => onItemClick?.(item)}
        >
          {item}

          <span>
            ›
          </span>
        </div>
      ))}
    </div>
  );
}