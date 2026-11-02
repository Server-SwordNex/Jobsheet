// import React, { useState, useEffect } from "react";
// import styles from "./JobsheetSettings.module.css";

// export default function JobsheetSettings({ settings, onSave }) {
//   const [isEditing, setIsEditing] = useState(false);

//   const [formData, setFormData] = useState({
//     prefix: "",
//     nextNumber: "",
//   });

//   useEffect(() => {
//     if (settings) {
//       setFormData({
//         prefix: settings.prefix || "ABC",
//         nextNumber: settings.nextNumber || 1,
//       });
//     }
//   }, [settings]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleEdit = () => {
//     setIsEditing(true);
//   };

//   const handleCancel = () => {
//     setIsEditing(false);

//     setFormData({
//       prefix: settings.prefix,
//       nextNumber: settings.nextNumber,
//     });
//   };

//   const handleSave = () => {
//     onSave?.(formData);

//     setIsEditing(false);
//   };

//   return (
//     <div className={styles.invoiceSection}>
//       <div style={{display: "flex", gap: "12px", alignItems: "center", marginBottom: "24px"}}>
//         <div className={styles.subuserIcon}>
//             <i class="fa-solid fa-receipt"></i>
//         </div>
//         <div>
//             <h2>Invoice Settings</h2>
//             <p className={styles.subText}>
//             Configure your invoice numbering format.
//             </p>
//         </div>
//       </div>

//       <div className={styles.card}>
//         <div className={styles.grid}>

//           <div className={styles.field}>
//             <label>Invoice Prefix</label>

//             <input
//               type="text"
//               name="prefix"
//               value={formData.prefix}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </div>

//           <div className={styles.field}>
//             <label>Next Invoice Number</label>

//             <input
//               type="number"
//               name="nextNumber"
//               value={formData.nextNumber}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </div>

//           <div className={styles.actions}>
//           {!isEditing ? (
//             <button
//               className={styles.editBtn}
//               onClick={handleEdit}
//             >
//               <i className="fa-solid fa-pen" style={{marginRight: "6px"}}></i>
//               Edit
//             </button>
//           ) : (
//             <>
//               <button
//                 className={styles.cancelBtn}
//                 onClick={handleCancel}
//               >
//                 Cancel
//               </button>

//               <button
//                 className={styles.saveBtn}
//                 onClick={handleSave}
//               >
//                 Save
//               </button>
//             </>
//           )}
//         </div>

//         </div>


//       </div>
//     </div>
//   );
// }
// import React, { useState, useEffect } from "react";
// import styles from "./JobsheetSettings.module.css";

// export default function JobsheetSettings({ settings, onSave }) {
//   const [isEditing, setIsEditing] = useState(false);

//   const [formData, setFormData] = useState({
//     prefix: "",
//     nextNumber: "",
//   });

//   useEffect(() => {
//     if (settings) {
//       setFormData({
//         prefix: settings.prefix || "ABC",
//         nextNumber: settings.nextNumber || 1,
//       });
//     }
//   }, [settings]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleEdit = () => {
//     setIsEditing(true);
//   };

//   const handleCancel = () => {
//     setIsEditing(false);

//     setFormData({
//       prefix: settings.prefix,
//       nextNumber: settings.nextNumber,
//     });
//   };

//   const handleSave = () => {
//     onSave?.(formData);

//     setIsEditing(false);
//   };

//   return (
//     <div className={styles.invoiceSection}>
//       <div style={{display: "flex", gap: "12px", alignItems: "center", marginBottom: "24px"}}>
//         <div className={styles.subuserIcon}>
//             <i class="fa-solid fa-receipt"></i>
//         </div>
//         <div>
//             <h2>Invoice Settings</h2>
//             <p className={styles.subText}>
//             Configure your invoice numbering format.
//             </p>
//         </div>
//       </div>

//       <div className={styles.card}>
//         <div className={styles.grid}>

//           <div className={styles.field}>
//             <label>Invoice Prefix</label>

//             <input
//               type="text"
//               name="prefix"
//               value={formData.prefix}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </div>

//           <div className={styles.field}>
//             <label>Next Invoice Number</label>

//             <input
//               type="number"
//               name="nextNumber"
//               value={formData.nextNumber}
//               onChange={handleChange}
//               disabled={!isEditing}
//             />
//           </div>

//           <div className={styles.actions}>
//           {!isEditing ? (
//             <button
//               className={styles.editBtn}
//               onClick={handleEdit}
//             >
//               <i className="fa-solid fa-pen" style={{marginRight: "6px"}}></i>
//               Edit
//             </button>
//           ) : (
//             <>
//               <button
//                 className={styles.cancelBtn}
//                 onClick={handleCancel}
//               >
//                 Cancel
//               </button>

//               <button
//                 className={styles.saveBtn}
//                 onClick={handleSave}
//               >
//                 Save
//               </button>
//             </>
//           )}
//         </div>

//         </div>


//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import styles from "./JobsheetSettings.module.css";
import { toast } from "react-toastify";
import { PenTool, Pencil } from "lucide-react";
import { updateProfile } from "../../../api/profile.js";

export default function JobsheetSettings({ onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    prefix: "JS",
    suffix: "001",
  });

  /* ---------------- LOAD ---------------- */
  useEffect(() => {
    const data = localStorage.getItem("user");

    if (data) {
      try {
        const parsed = JSON.parse(data);

        setFormData({
          prefix: parsed.jobSheetPrefix || "JS",
          suffix: parsed.jobSheetSuffix || "001",
        });

      } catch (err) {
        console.error("Invalid user data", err);
      }
    }
  }, []);

  /* ---------------- DATE ---------------- */
  /* ---------------- CHANGE ---------------- */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "prefix"
          ? value.toUpperCase().slice(0, 3)
          : value,
    }));
  };

  /* ---------------- ACTIONS ---------------- */
  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    const data = JSON.parse(localStorage.getItem("user"));

      setFormData({
      prefix: data?.jobSheetPrefix || "JS",
      suffix: data?.jobSheetSuffix || "001",
    });

    setIsEditing(false);
  };

  /* ---------------- 🔥 API ---------------- */
  const updateJobsheetSettings = async (updates) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const uid = user?.uid;

    if (!uid) throw new Error("User not found");

    const data = await updateProfile(uid, {
      jobSheetPrefix: updates.prefix,
      jobSheetSuffix: updates.suffix,
    });

    // ✅ update localStorage
    const updatedUser = {
      ...user,
      jobSheetPrefix: updates.prefix,
      jobSheetSuffix: updates.suffix,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    return data;
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    try {
      setLoading(true);

      await updateJobsheetSettings(formData);

      onSave?.(formData);

      setIsEditing(false);
      toast.success("Jobsheet settings updated ✅");

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- PREVIEW ---------------- */
  const getPreview = () => {
    const padded = String(parseInt(formData.suffix, 10) || 1).padStart(formData.suffix.length, "0");
    return `${formData.prefix}-JS/${padded}`;
  };

  return (
    <div className={styles.invoiceSection}>
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "14px" }}>
        <div className={styles.subuserIcon}>
          <PenTool size={18} />
        </div>
        <div>
          <h2 style={{ fontSize: 16, margin: 0 }}>Jobsheet Settings</h2>
          <p className={styles.subText}>
            Configure your jobsheet numbering format.
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.grid}>

          {/* PREFIX */}
          <div className={styles.field}>
            <label>Jobsheet Prefix</label>
            <input
              type="text"
              name="prefix"
              value={formData.prefix}
              onChange={handleChange}
              disabled={!isEditing}
              maxLength={5}
            />
          </div>

          {/* SUFFIX (start number) */}
          <div className={styles.field}>
            <label>Start Number</label>
            <input
              type="number"
              name="suffix"
              value={formData.suffix}
              onChange={handleChange}
              disabled={!isEditing}
              min={1}
            />
          </div>

          {/* PREVIEW */}
          <div className={styles.field} style={{ gridColumn: "span 3" }}>
            <label>Preview</label>
            <div className={styles.previewBox}>
              {getPreview()}
            </div>
          </div>

          {/* ACTIONS */}
          <div className={styles.actions}>
            {!isEditing ? (
              <button className={styles.editBtn} onClick={handleEdit}>
                <Pencil size={12} style={{ marginRight: "6px" }} />
                Edit
              </button>
            ) : (
              <>
                <button
                  className={styles.cancelBtn}
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  className={styles.saveBtn}
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? <span className={styles.loader}></span> : "Save"}
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}