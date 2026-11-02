// import React, { useState } from "react";
// import styles from "./Adduser.module.css";
// import { toast } from "react-toastify";
// import { API } from "../../../../API/BackendApi.js";

// export default function Adduser({ isOpen, onClose, onSubmit }) {
//   const [loading, setLoading] = useState(false);

//   const [formData, setFormData] = useState({
//     subUserName: "",
//     email: "",
//     subBranchName: "",
//     addressLine1: "",
//     addressLine2: "",
//     city: "",
//     state: "",
//     pincode: "",
//     password: "",
//     confirmPassword: "",
//   });

//   const states = [
//     "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
//     "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand",
//     "Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
//     "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
//     "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
//     "Uttarakhand","West Bengal","Delhi","Puducherry"
//   ].sort();

//   /* 🔥 SHORT EMPLOYEE ID */
//   const generateEmployeeId = () => {
//     const rand = Math.random().toString(36).substring(2, 5).toUpperCase();
//     return `EMP-${rand}`;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;

//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   /* 🔥 API CALL */
//   const createSubUser = async (payload) => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     const uid = user?.uid;

//     if (!uid) throw new Error("User not found");

//     const res = await fetch(API.createSubUser(uid), {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     });

//     const data = await res.json();

//     if (!res.ok) {
//       throw new Error(data.message || "Failed to create sub user");
//     }

//     return data;
//   };

//   /* 🔥 SUBMIT */
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (formData.password !== formData.confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }

//     try {
//       setLoading(true);

//       const payload = {
//         subUserName: formData.subUserName,
//         email: formData.email,
//         subBranchName: formData.subBranchName,
//         addressLine1: formData.addressLine1,
//         addressLine2: formData.addressLine2,
//         city: formData.city,
//         state: formData.state,
//         pincode: formData.pincode,
//         employeeId: generateEmployeeId(),
//         password: formData.password,
//       };

//       await createSubUser(payload);

//       /* ✅ local store */
//       const existing = JSON.parse(localStorage.getItem("subUsers") || "[]");
//       localStorage.setItem(
//         "subUsers",
//         JSON.stringify([...existing, payload])
//       );

//       toast.success("Sub user added successfully ✅");

//       /* reset */
//       setFormData({
//         subUserName: "",
//         email: "",
//         subBranchName: "",
//         addressLine1: "",
//         addressLine2: "",
//         city: "",
//         state: "",
//         pincode: "",
//         password: "",
//         confirmPassword: "",
//       });

//       setIsOpen(false);

//     } catch (err) {
//       console.error(err);
//       toast.error(err.message || "Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <>
//       {/* OPEN BUTTON */}
//       <button
//         className={styles.openBtn}
//         onClick={() => setIsOpen(true)}
//       >
//         + Add Member
//       </button>

//       {/* MODAL */}
//       {isOpen && (
//         <div className={styles.overlay}>
//           <div className={styles.modal}>

//             <div className={styles.header}>
//               <h2>Add Member</h2>

//               <button
//                 className={styles.closeBtn}
//                 onClick={() => setIsOpen(true)}
//               >
//                 ×
//               </button>
//             </div>

//             <form className={styles.form} onSubmit={handleSubmit}>
//               <div className={styles.grid}>

//                 <input
//                   name="subUserName"
//                   placeholder="Sub User Name"
//                   value={formData.subUserName}
//                   onChange={handleChange}
//                   required
//                 />

//                 <input
//                   name="email"
//                   type="email"
//                   placeholder="Email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                 />

//                 <input
//                   name="subBranchName"
//                   placeholder="Sub Branch Name"
//                   value={formData.subBranchName}
//                   onChange={handleChange}
//                 />

//                 <input
//                   name="addressLine1"
//                   placeholder="Address Line 1"
//                   value={formData.addressLine1}
//                   onChange={handleChange}
//                 />

//                 <input
//                   name="addressLine2"
//                   placeholder="Address Line 2"
//                   value={formData.addressLine2}
//                   onChange={handleChange}
//                 />

//                 <input
//                   name="city"
//                   placeholder="City"
//                   value={formData.city}
//                   onChange={handleChange}
//                 />

//                 <select
//                   name="state"
//                   value={formData.state}
//                   onChange={handleChange}
//                   className={styles.select}
//                 >
//                   <option value="">Select State</option>
//                   {states.map((state) => (
//                     <option key={state} value={state}>
//                       {state}
//                     </option>
//                   ))}
//                 </select>

//                 <input
//                   name="pincode"
//                   placeholder="Pincode"
//                   value={formData.pincode}
//                   onChange={handleChange}
//                 />

//                 <input
//                   value={generateEmployeeId()}
//                   disabled
//                   placeholder="Auto Employee ID"
//                 />

//                 <input
//                   name="password"
//                   type="password"
//                   placeholder="Password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   required
//                 />

//                 <input
//                   name="confirmPassword"
//                   type="password"
//                   placeholder="Confirm Password"
//                   value={formData.confirmPassword}
//                   onChange={handleChange}
//                   required
//                 />

//               </div>

//               <div className={styles.footer}>
//                 <button
//                   type="button"
//                   className={styles.cancelBtn}
//                   onClick={() => setIsOpen(false)}
//                   disabled={loading}
//                 >
//                   Cancel
//                 </button>

//                 <button
//                   type="submit"
//                   className={styles.submitBtn}
//                   disabled={loading}
//                 >
//                   {loading ? "Adding..." : "Add Member"}
//                 </button>
//               </div>
//             </form>

//           </div>
//         </div>
//       )}
//     </>
//   );
// }


import React, { useState, useEffect } from "react";
import styles from "./Adduser.module.css";
import { toast } from "react-toastify";
import { createSubuser } from "../../../../api/subusers.js";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";


export default function Adduser({ isOpen, onClose, onSubmit }) {

  const navigate = useNavigate();

  const states = [
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
    "Delhi",
    "Puducherry",
  ].sort();


  const [loading, setLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const requestLock = useRef(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const [formData, setFormData] = useState({
    subUserName: "",
    email: "",
    subBranchName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  /* =========================
     🔥 EMPLOYEE ID GENERATOR
  ========================= */
  const generateEmployeeId = (name = "") => {
    const cleanName = name
      .replace(/\s+/g, "")
      .toUpperCase()
      .slice(0, 4);

    const randomNum = Math.floor(1000 + Math.random() * 9000);

    return `${cleanName || "USER"}-${randomNum}`;
  };

  /* =========================
     🔥 AUTO GENERATE EMP ID
  ========================= */
  useEffect(() => {
    if (formData.subUserName) {
      setEmployeeId(generateEmployeeId(formData.subUserName));
    } else {
      setEmployeeId("");
    }
  }, [formData.subUserName]);

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      subUserName: "",
      email: "",
      subBranchName: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });

    setEmployeeId("");
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     🔥 API CALL
  ========================= */
  const createSubUser = async (payload) => {
    const uid = user?.uid;
    if (!uid) throw new Error("User not found");
    return createSubuser(uid, payload);
  };

  /* =========================
     🔥 SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🚨 HARD BLOCK duplicate requests
    if (requestLock.current) return;
    requestLock.current = true;

    if (loading) return;

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      requestLock.current = false;
      return;
    }

    try {
      setLoading(true);

      const payload = {
        subUserName: formData.subUserName,
        email: formData.email,
        phone: formData.phone,
        empId: employeeId,
        subBranchName: formData.subBranchName,
        addressLine1: formData.addressLine1 || user.addressLine1,
        addressLine2: formData.addressLine2 || user.addressLine2,
        city: formData.city || user.city,
        state: formData.state || user.state,
        pincode: formData.pincode || user.pincode,
        password: formData.password,
        companyName: user.companyName,
        company: user.companyName,
        username: user.username,
        mobileNo: user.mobileNo,
        gstin: user.gstin,
        parentUserId: user.uid,
        website: user.website,
        address1: user.addressLine1,
        address2: user.addressLine2,
        jobSheetPrefix: user.jobSheetPrefix,
        jobSheetSuffix: user.jobSheetSuffix,
        terms: user.terms,
      };

      const res = await createSubUser(payload);

      const newSubUser = res?.data;

      if (!newSubUser?.uid) {
        throw new Error("Invalid response from backend");
      }

      onSubmit?.(newSubUser);

      toast.success("Sub user added successfully ✅");
      onClose();
      navigate(0);

    } catch (err) {
      console.error(err);
      toast.error(err.message || "Something went wrong");

    } finally {
      setLoading(false);
      requestLock.current = false; // ✅ unlock after request completes
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>

        <div className={styles.header}>
          <h2>Add Member</h2>

          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>

            <input
              name="subUserName"
              placeholder="Sub User Name"
              value={formData.subUserName}
              onChange={handleChange}
              required
            />

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              name="phone"
              placeholder="Mobile Number"
              value={formData.phone}
              maxLength={10}
              onChange={handleChange}
              required
            />

            <input
              name="subBranchName"
              placeholder="Sub Branch Name"
              value={formData.subBranchName}
              onChange={handleChange}
            />

            <input
              name="addressLine1"
              placeholder="Address Line 1"
              value={formData.addressLine1}
              onChange={handleChange}
            />

            <input
              name="addressLine2"
              placeholder="Address Line 2"
              value={formData.addressLine2}
              onChange={handleChange}
            />

            <input
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
            />

            <select
              name="state"
              value={formData.state}
              onChange={handleChange}
              className={styles.select}
              required
            >
              <option value="">Select State</option>

              {states.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>

            <input
              name="pincode"
              placeholder="Pincode"
              maxLength={6}
              value={formData.pincode}
              onChange={handleChange}
            />

            {/* ✅ FIXED EMP ID */}
            <input value={employeeId} disabled />

            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

          </div>

          <div className={styles.footer}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Member"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}