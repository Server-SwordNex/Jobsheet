// import React, { useState, useEffect } from "react";
// import styles from "../Settings.module.css";
// import SubuserCard from "./SubuserCard";
// import PurchaseBox from "./PurchaseBox";
// import Adduser from "./AddUser/Adduser";

// export default function Subuser() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [showAddMember, setShowAddMember] = useState(false);
//   const [users, setUsers] = useState([]);

//   const [subUserLimit, setSubUserLimit] = useState(3);
//   const [currentSubUserCount, setCurrentSubUserCount] = useState(0);

//   /* ---------------- LOAD ---------------- */
//   useEffect(() => {
//     const userData = JSON.parse(localStorage.getItem("user") || "{}");

//     setSubUserLimit(userData.subUserLimit || 3);
//     setCurrentSubUserCount(userData.currentSubUsers || 0);

//     const savedUsers = JSON.parse(localStorage.getItem("subUsers") || "[]");
//     setUsers(savedUsers);
//   }, []);

//   /* ---------------- UPDATE COUNT IN LOCAL ---------------- */
//   const updateUserCount = (newCount) => {
//     const userData = JSON.parse(localStorage.getItem("user") || "{}");

//     const updatedUser = {
//       ...userData,
//       currentSubUsers: newCount,
//     };

//     localStorage.setItem("user", JSON.stringify(updatedUser));
//     setCurrentSubUserCount(newCount);
//   };

//   /* ---------------- ADD USER ---------------- */
//   const handleAddUser = (newUser) => {
//     if (currentSubUserCount >= subUserLimit) {
//       alert("User limit reached. Upgrade plan.");
//       return;
//     }

//     const updatedUsers = [
//       ...users,
//       {
//         id: Date.now(),
//         ...newUser,
//       },
//     ];

//     setUsers(updatedUsers);
//     localStorage.setItem("subUsers", JSON.stringify(updatedUsers));

//     // ✅ update count from local logic
//     updateUserCount(currentSubUserCount + 1);
//   };

//   /* ---------------- DELETE USER ---------------- */
//   const handleDeleteUser = (id) => {
//     const updatedUsers = users.filter((user) => user.id !== id);

//     setUsers(updatedUsers);
//     localStorage.setItem("subUsers", JSON.stringify(updatedUsers));

//     // ✅ decrease count
//     updateUserCount(Math.max(currentSubUserCount - 1, 0));
//   };

//   return (
//     <div className={styles.subUsersSection}>
//       <div className={styles.subHeader}>
//         <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
//           <div className={styles.subuserIcon}>
//             <i className="fa-solid fa-users-gear"></i>
//           </div>
//           <div>
//             <h2>Sub-Users Management</h2>
//             <p className={styles.subText}>
//               Manage your team members and access
//             </p>
//           </div>
//         </div>

//         <div className={styles.usage}>
//           USAGE
//           <span>{currentSubUserCount} / {subUserLimit}</span>
//         </div>
//       </div>

//       <div className={styles.membersHeader}>
//         <span>ACTIVE MEMBERS</span>

//         <button
//           className={styles.addBtn}
//           onClick={() => setShowAddMember(true)}
//           disabled={currentSubUserCount >= subUserLimit}
//         >
//           + Add Member
//         </button>
//       </div>

//       <div className={styles.membersGrid}>
//         {users.map((user) => (
//           <SubuserCard
//             key={user.id}
//             user={user}
//             onDelete={handleDeleteUser}
//           />
//         ))}

//         <div className={styles.accessControl}>
//           <div className={styles.shieldIcon}>
//             <i className="fa-solid fa-user-gear"></i>
//           </div>

//           <h3>Access Control</h3>

//           <p>
//             Sub-users can log in via the Team tab on the login page using their
//             email and password.
//           </p>
//         </div>
//       </div>

//       <PurchaseBox />

//       <Adduser
//         isOpen={showAddMember}
//         onClose={() => setShowAddMember(false)}
//         onSubmit={handleAddUser}
//       />
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import styles from "../Settings.module.css";
import SubuserCard from "./SubuserCard";
import PurchaseBox from "./PurchaseBox";
import Adduser from "./AddUser/Adduser";
import { Users, UserCog } from "lucide-react";
import { getSubusers, deleteSubuser } from "../../../api/subusers";
import { toast } from "react-toastify";
import { useEntitlements } from "../../../context/EntitlementsContext";

export default function Subuser() {
  const [showAddMember, setShowAddMember] = useState(false);
  const [users, setUsers] = useState([]);

  // the plan decides the limit (null = unlimited); the number saved at sign-up is only a fallback
  const { entitlements } = useEntitlements();
  const [savedLimit, setSavedLimit] = useState(3);
  const subUserLimit = entitlements ? entitlements.limits.teamMembers : savedLimit;
  const [currentSubUserCount, setCurrentSubUserCount] = useState(0);
  const limitReached = subUserLimit !== null && currentSubUserCount >= subUserLimit;

  const [loading, setLoading] = useState(true); // 🔥 page loader
  const [deletingId, setDeletingId] = useState(null);

  /* ================= FETCH USERS ================= */
  const loadSubUsers = async () => {
    try {
      setLoading(true);

      const userData = JSON.parse(localStorage.getItem("user")) || {};
      if (!userData?.uid) return;

      setSavedLimit(Number(userData.subuserLimit ?? userData.subUserLimit) || 3);

      const res = await getSubusers(userData.uid);
      setUsers(res.data || []);
      setCurrentSubUserCount(res.data?.length || 0);

    } catch (err) {
      console.error(err);
      toast.error(err.error || err.message || "Failed to load sub-users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubUsers();
  }, []);

  /* ================= ADD ================= */
  const handleAddUser = async (newUser) => {
    setUsers((prev) => [...prev, newUser]);
    setCurrentSubUserCount((prev) => prev + 1);
    setShowAddMember(false);
  };

  /* ================= DELETE ================= */
  const handleDeleteUser = async (uid) => {
    try {
      setDeletingId(uid);

      await deleteSubuser(uid);
      toast.success("Subuser deleted");

      await loadSubUsers(); // 🔥 reload

    } catch (err) {
      console.error(err);
      toast.error(err.error || err.message || "Error deleting");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className={styles.subUsersSection}>

      {/* 🔥 GLOBAL LOADER */}
      {loading ? (
        <div className={styles.pageLoader}>
          <div className={styles.loader}></div>
          <p>Loading sub-users...</p>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <div className={styles.subHeader}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div className={styles.subuserIcon}>
                <Users size={18} />
              </div>

              <div>
                <h2 style={{ fontSize: 16, margin: 0 }}>Sub-Users Management</h2>
                <p className={styles.subText}>
                  Manage your team members and access
                </p>
              </div>
            </div>

            <div className={styles.usage}>
              USAGE
              <span>{currentSubUserCount} / {subUserLimit === null ? '∞' : subUserLimit}</span>
            </div>
          </div>

          {/* ACTION */}
          <div className={styles.membersHeader}>
            <span>ACTIVE MEMBERS</span>

            <button
              className={styles.addBtn}
              onClick={() => setShowAddMember(true)}
              disabled={limitReached}
            >
              + Add Member
            </button>
          </div>

          {/* USERS */}
          <div className={styles.membersGrid}>
            {users.length > 0 ? (
              users.map((user) => (
                <SubuserCard
                  key={user.uid}
                  user={user}
                  onDelete={handleDeleteUser}
                  loading={deletingId === user.uid}
                />
              ))
            ) : (
              <p style={{ color: "#777" }}>No sub-users added yet</p>
            )}

            {/* INFO CARD */}
            <div className={styles.accessControl}>
              <div className={styles.shieldIcon}>
                <UserCog size={20} />
              </div>

              <h3 style={{ fontSize: 14, margin: "0 0 6px" }}>Access Control</h3>

              <p>
                Sub-users can log in via the Team tab using their email and password.
              </p>
            </div>
          </div>

          <PurchaseBox />

          {/* MODAL */}
          <Adduser
            isOpen={showAddMember}
            onClose={() => setShowAddMember(false)}
            onSubmit={handleAddUser}
          />
        </>
      )}
    </div>
  );
}