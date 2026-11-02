// import React, { useState, useEffect } from "react";
// import styles from "./TermsCon.module.css";

// export default function TermsCon({
//   initialTerms,
//   onSave,
// }) {
//   const [isEditing, setIsEditing] = useState(false);

//   const [terms, setTerms] = useState("");

//   useEffect(() => {
//     if (initialTerms) {
//       setTerms(initialTerms);
//     }
//   }, [initialTerms]);

//   const handleEdit = () => setIsEditing(true);

//   const handleCancel = () => {
//     setTerms(initialTerms);
//     setIsEditing(false);
//   };

//   const handleSave = () => {
//     onSave?.(terms);
//     setIsEditing(false);
//   };

//   const handleChange = (e) => {
//     setTerms(e.target.value);
//   };

//   return (
//     <div className={styles.section}>
//       <div className={styles.header}>
//         <div style={{display: "flex", gap: "12px", alignItems: "center"}}>
//             <div className={styles.subuserIcon}>
//                 <i class="fa-solid fa-table-list"></i>
//             </div>
//             <div>
//                 <h2>Invoice Terms & Conditions</h2>
//                 <p className={styles.subText}>
//                 Set your business terms and conditions for invoices.
//                 </p>
//             </div>
//         </div>

//         {!isEditing ? (
//           <button
//             className={styles.editBtn}
//             onClick={handleEdit}
//           >
//             <i className="fa-solid fa-pen" style={{marginRight: "6px"}}></i>
//             Edit
//           </button>
//         ) : (
//           <div className={styles.actionsTop}>
//             <button
//               className={styles.cancelTop}
//               onClick={handleCancel}
//             >
//               Cancel
//             </button>

//             <button
//               className={styles.saveTop}
//               onClick={handleSave}
//             >
//               Save
//             </button>
//           </div>
//         )}
//       </div>

//       <div className={styles.card}>
//         <label className={styles.label}>
//           TERMS AND CONDITIONS
//         </label>

//         <textarea
//           value={terms}
//           onChange={handleChange}
//           disabled={!isEditing}
//           placeholder="Enter your business terms and conditions here..."
//           className={
//             isEditing
//               ? styles.textareaEditable
//               : styles.textarea
//           }
//           rows={10}
//         />

//         <p className={styles.helper}>
//           These terms will appear automatically on
//           invoices and documents.
//         </p>
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import styles from "./TermsCon.module.css";
import { List, Pencil } from "lucide-react";
import { toast } from "react-toastify";
import { updateProfile } from "../../../api/profile.js";

export default function TermsCon() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [terms, setTerms] = useState("");

  /* ---------------- LOAD FROM LOCAL ---------------- */
  useEffect(() => {
    const data = localStorage.getItem("user");

    if (data) {
      try {
        const parsed = JSON.parse(data);
        setTerms(parsed.terms || "");
      } catch (err) {
        console.error("Invalid user data", err);
      }
    }
  }, []);

  /* ---------------- ACTIONS ---------------- */
  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    const data = JSON.parse(localStorage.getItem("user") || "{}");
    console.log(data);
    setTerms(data?.terms || "");
    setIsEditing(false);
  };

  /* ---------------- 🔥 API ---------------- */
  const updateTermsRequest = async (updatedTerms) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const uid = user?.uid;

    if (!uid) throw new Error("User not found");

    const data = await updateProfile(uid, {
      terms: updatedTerms,
    });

    // ✅ sync localStorage
    const updatedUser = {
      ...user,
      terms: updatedTerms,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    return data;
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    try {
      setLoading(true);

      await updateTermsRequest(terms);

      setIsEditing(false);
      toast.success("Terms updated successfully ✅");

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- INPUT ---------------- */
  const handleChange = (e) => {
    setTerms(e.target.value);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className={styles.subuserIcon}>
            <List size={18} />
          </div>

          <div>
            <h2 style={{ fontSize: 16, margin: 0 }}>Terms & Conditions</h2>
            <p className={styles.subText}>
              Set your business terms and conditions.
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
            <button
              className={styles.cancelTop}
              onClick={handleCancel}
              disabled={loading}
            >
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

      <div className={styles.card}>
        <label className={styles.label}>
          TERMS AND CONDITIONS
        </label>

        <textarea
          value={terms}
          onChange={handleChange}
          disabled={!isEditing}
          placeholder="Enter your business terms and conditions here..."
          className={
            isEditing
              ? styles.textareaEditable
              : styles.textarea
          }
          rows={10}
        />

        <p className={styles.helper}>
          These terms will appear automatically on invoices and documents.
        </p>
      </div>
    </div>
  );
}