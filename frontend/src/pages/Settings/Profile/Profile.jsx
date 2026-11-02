import React, { useState, useEffect } from "react";
import styles from "./Profile.module.css";
import { toast } from "react-toastify";
import { UserCog, Pencil } from "lucide-react";
import { updateProfile as updateProfileApi } from "../../../api/profile.js";

const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export default function Profile({ initialProfile = {}, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [profile, setProfile] = useState({
    companyName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    pincode: "",
    state: "",
    gstin: "",
    mobileNo: "",
    email: "",
    role: "",
    plan: "",
  });

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      try {
        const parsed = JSON.parse(userData);

        setProfile((prev) => ({
          ...prev,
          ...parsed,
        }));
      } catch (err) {
        console.error("Invalid user data", err);
      }
    }
  }, []);

  /* ---------------- NON EDITABLE ---------------- */
  const nonEditableFields = [
    "plan",
    "role",
    "companyName",
    "gstin",
    "email",
    "state",
  ];

  const isEditable = (name) => !nonEditableFields.includes(name);

  /* ---------------- ACTIONS ---------------- */
  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setProfile((prev) => ({
        ...prev,
        ...userData,
      }));
    }
    setIsEditing(false);
  };

  /* ---------------- 🔥 FRONTEND API REQUEST ---------------- */
  const updateProfileRequest = async (updates) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const uid = user?.uid;

    if (!uid) throw new Error("User not found");

    const data = await updateProfileApi(uid, updates);

    // ✅ sync localStorage
    const updatedUser = {
      ...user,
      ...updates,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    return data;
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    try {
      setLoading(true);  // 🔥 start loader

      let updatedFields = {};

      Object.keys(profile).forEach((key) => {
        if (isEditable(key)) {
          updatedFields[key] = profile[key];
        }
      });

      await updateProfileRequest(updatedFields);

      const user = JSON.parse(localStorage.getItem("user"));
      const updatedUser = {
        ...user,
        ...updatedFields,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      onSave?.(updatedFields);

      setIsEditing(false);
      toast.success("Profile updated successfully ✅");

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false); // 🔥 stop loader
    }
  };

  /* ---------------- INPUT CHANGE ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* ---------------- FIELD ---------------- */
  const renderField = (label, name) => (
    <div className={styles.field}>
      <label>{label}</label>

      {isEditing && isEditable(name) ? (
        name === "state" ? (
          <input
            list="states"
            name="state"
            value={profile.state || ""}
            onChange={handleChange}
            className={styles.input}
            placeholder="Search state..."
          />
        ) : (
          <input
            type="text"
            name={name}
            value={profile[name] || ""}
            onChange={handleChange}
            className={styles.input}
          />
        )
      ) : (
        <div className={styles.value}>
          {profile[name] || "-"}
        </div>
      )}
      <datalist id="states">
        {indianStates.map((st) => (
          <option key={st} value={st} />
        ))}
      </datalist>
    </div>
  );

  /* ---------------- UI ---------------- */
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className={styles.subuserIcon}>
            <UserCog size={18} />
          </div>

          <div>
            <h2 style={{ fontSize: 16, margin: 0 }}>Profile Settings</h2>
            <p className={styles.subText}>
              Manage your business profile information and details.
            </p>
          </div>
        </div>

        {!isEditing ? (
          <button className={styles.editBtn} onClick={handleEdit}>
            <Pencil size={12} style={{ marginRight: "6px" }} />
            Edit
          </button>
        ) : (
          <div className={styles.actionsTop}>
            <button className={styles.cancelTop} onClick={handleCancel}>
              Cancel
            </button>

            <button
              className={styles.saveTop}
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <span className={styles.loader}></span>
              ) : (
                "Save"
              )}
            </button>
          </div>
        )}
      </div>
      <div className={styles.grid}>
        {renderField("COMPANY NAME", "companyName")}
        {renderField("GSTIN", "gstin")}
        {renderField("ADDRESS LINE 1", "addressLine1")}
        {renderField("ADDRESS LINE 2", "addressLine2")}
        {renderField("CITY", "city")}
        {renderField("PINCODE", "pincode")}
        {renderField("STATE", "state")}
        {renderField("MOBILE NO", "mobileNo")}
        {renderField("EMAIL", "email")}
        {renderField("ROLE", "role")}
        {renderField("PLAN", "plan")}
      </div>
    </div>
  );
}