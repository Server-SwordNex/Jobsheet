import React, { useState } from "react";

import styles from "./Security.module.css";

import { toast } from "react-toastify";
import { Shield } from "lucide-react";
import { changePassword } from "../../../api/security.js";

export default function Security() {

  /* =========================
     STATES
  ========================== */

  const [isOpen, setIsOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [form, setForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  /* =========================
     LOCAL STORAGE
  ========================== */

  const auth =
    JSON.parse(
      localStorage.getItem(
        "auth"
      ) || "{}"
    );

  const user =
    JSON.parse(
      localStorage.getItem(
        "user"
      ) || "{}"
    );

  const token =
    auth?.token;

  const email =
    user?.email;

  const uid =
    user?.uid;

  /* =========================
     HANDLE INPUT
  ========================== */

  const handleChange = (e) => {

    const { name, value } =
      e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================
     FORMAT PASSWORD DATE
  ========================== */

  const formatPasswordDate = (
    rawDate
  ) => {

    if (!rawDate) {
      return "Never";
    }

    /* =========================
       FIRESTORE TIMESTAMP
       {_seconds,_nanoseconds}
    ========================== */

    if (
      rawDate?._seconds
    ) {

      const millis =
        rawDate._seconds *
        1000 +
        Math.floor(
          rawDate._nanoseconds /
          1000000
        );

      return new Date(
        millis
      ).toLocaleString(
        "en-IN",
        {
          dateStyle:
            "medium",

          timeStyle:
            "short",
        }
      );
    }

    /* =========================
       FIRESTORE TIMESTAMP
       {seconds,nanoseconds}
    ========================== */

    if (
      rawDate?.seconds
    ) {

      const millis =
        rawDate.seconds *
        1000 +
        Math.floor(
          rawDate.nanoseconds /
          1000000
        );

      return new Date(
        millis
      ).toLocaleString(
        "en-IN",
        {
          dateStyle:
            "medium",

          timeStyle:
            "short",
        }
      );
    }

    /* =========================
       ISO STRING
    ========================== */

    if (
      typeof rawDate ===
      "string"
    ) {

      return new Date(
        rawDate
      ).toLocaleString(
        "en-IN",
        {
          dateStyle:
            "medium",

          timeStyle:
            "short",
        }
      );
    }

    return "Never";
  };

  /* =========================
     LAST CHANGE
  ========================== */

  const lastChange =
    formatPasswordDate(
      user?.passwordChangedAt
    );

  /* =========================
     CHANGE PASSWORD
  ========================== */

  const handleSubmit = async (
    e
  ) => {

    e.preventDefault();

    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = form;

    /* =========================
       VALIDATION
    ========================== */

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {

      toast.error(
        "All fields are required"
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {

      toast.error(
        "Passwords do not match"
      );

      return;
    }

    if (
      newPassword.length < 6
    ) {

      toast.error(
        "Password must be at least 6 characters"
      );

      return;
    }

    try {

      setLoading(true);

      /* =========================
         API CALL
      ========================== */

      const data = await changePassword(email, newPassword, uid);

      if (!data || !data.success) {
        throw new Error(data?.message || "Failed to change password");
      }

      /* =========================
         EXISTING USER
      ========================== */

      const existingUser =
        JSON.parse(
          localStorage.getItem(
            "user"
          ) || "{}"
        );

      /* =========================
         FORMAT DATE
      ========================== */

      const formattedDate =
        formatPasswordDate(
          data?.data
            ?.passwordChangedAt
        );

      /* =========================
         UPDATE LOCAL STORAGE
      ========================== */

      const updatedUser = {
        ...existingUser,

        passwordChangedAt:
          formattedDate,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(
          updatedUser
        )
      );

      /* =========================
         SUCCESS
      ========================== */

      toast.success(
        "Password changed successfully"
      );

      /* =========================
         RESET FORM
      ========================== */

      setForm({
        currentPassword: "",

        newPassword: "",

        confirmPassword: "",
      });

      setIsOpen(false);

    } catch (error) {

      console.error(error);

      toast.error(
        error.message ||
        "Failed to change password"
      );

    } finally {

      setLoading(false);
    }
  };

  return (
    <>
      {/* =========================
          SECURITY SECTION
      ========================== */}

      <div
        className={
          styles.securitySection
        }
      >
        <div
          style={{
            display: "flex",

            gap: "10px",

            alignItems:
              "center",

            marginBottom:
              "14px",
          }}
        >
          <div
            className={
              styles.subuserIcon
            }
          >
            <Shield size={18} />
          </div>

          <div>

            <h2 style={{ fontSize: 16, margin: 0 }}>
              Security Settings
            </h2>

            <p
              className={
                styles.subText
              }
            >
              Manage your
              password and keep
              your account
              secure.
            </p>

          </div>
        </div>

        {/* =========================
            CARD
        ========================== */}

        <div
          className={
            styles.card
          }
        >
          <div
            className={
              styles.info
            }
          >
            <div
              className={
                styles.field
              }
            >
              <label>
                Password
              </label>

              <div
                className={
                  styles.value
                }
              >
                Last changed:{" "}
                {lastChange}
              </div>
            </div>
          </div>

          <button
            className={
              styles.changeBtn
            }

            onClick={() =>
              setIsOpen(true)
            }
          >
            Change
          </button>
        </div>
      </div>

      {/* =========================
          MODAL
      ========================== */}

      {isOpen && (

        <div
          className={
            styles.overlay
          }
        >
          <div
            className={
              styles.modal
            }
          >

            {/* HEADER */}

            <div
              className={
                styles.modalHeader
              }
            >
              <h3>
                Change Password
              </h3>

              <button
                className={
                  styles.deleteBtn
                }

                onClick={() =>
                  setIsOpen(false)
                }
              >
                ×
              </button>
            </div>

            {/* FORM */}

            <form
              className={
                styles.form
              }

              onSubmit={
                handleSubmit
              }
            >

              {/* CURRENT PASSWORD */}

              <div
                className={
                  styles.inputGroup
                }
              >
                <label>
                  Current Password
                </label>

                <input
                  type="password"

                  name="currentPassword"

                  placeholder="Enter current password"

                  value={
                    form.currentPassword
                  }

                  onChange={
                    handleChange
                  }

                  required
                />
              </div>

              {/* NEW PASSWORD */}

              <div
                className={
                  styles.inputGroup
                }
              >
                <label>
                  New Password
                </label>

                <input
                  type="password"

                  name="newPassword"

                  placeholder="Enter new password"

                  value={
                    form.newPassword
                  }

                  onChange={
                    handleChange
                  }

                  required
                />
              </div>

              {/* CONFIRM PASSWORD */}

              <div
                className={
                  styles.inputGroup
                }
              >
                <label>
                  Confirm Password
                </label>

                <input
                  type="password"

                  name="confirmPassword"

                  placeholder="Confirm new password"

                  value={
                    form.confirmPassword
                  }

                  onChange={
                    handleChange
                  }

                  required
                />
              </div>

              {/* ACTIONS */}

              <div
                className={
                  styles.actions
                }
              >
                <button
                  type="button"

                  className={
                    styles.cancelBtn
                  }

                  onClick={() =>
                    setIsOpen(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"

                  className={
                    styles.sendBtn
                  }

                  disabled={
                    loading
                  }
                >
                  {loading
                    ? "Changing..."
                    : "Change Password"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}
    </>
  );
}