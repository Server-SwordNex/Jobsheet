import React, { useState, useEffect } from "react";
import styles from "./SuperAdminAnnouncements.module.css";
import { toast } from "react-toastify";
import { Plus } from "lucide-react";
import {
  getAllAnnouncements,
  createAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
} from "../../../api/endpoints";

export default function SuperAdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    message: "",
    type: "Maintenance",
    target: "All Users",
    priority: "Medium",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAnnouncement((prev) => ({ ...prev, [name]: value }));
  };

  /* ================= GET ALL ================= */
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const role = "superadmin";
        const data = await getAllAnnouncements(role);
        setAnnouncements(data.data || []);
      } catch (err) {
        console.error("GET ERROR:", err);
        toast.error(err.message || err.error || "Failed to fetch announcements");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ================= CREATE ================= */
  const handleCreate = async () => {
    if (!newAnnouncement.title.trim()) {
      return toast.error("Title is required");
    }
    if (!newAnnouncement.message.trim()) {
      return toast.error("Message is required");
    }

    try {
      setCreating(true);

      const payload = {
        ...newAnnouncement,
      };

      const data = await createAnnouncement(payload);

      setAnnouncements((prev) => [data.data, ...prev]);
      setIsModalOpen(false);
      setNewAnnouncement({
        title: "",
        message: "",
        type: "Maintenance",
        target: "All Users",
        priority: "Medium",
      });
      toast.success("Announcement created successfully ✅");
    } catch (err) {
      console.error("CREATE ERROR:", err);
      toast.error(err.message || err.error || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  /* ================= TOGGLE ================= */
  const handleToggleStatus = async (id) => {
    try {
      setActionLoadingId(id);

      const data = await toggleAnnouncement(id);

      setAnnouncements((prev) =>
        prev.map((a) =>
          a.id === id || a._id === id
            ? { ...a, status: data.data?.status || a.status }
            : a
        )
      );
      toast.success("Status updated successfully ✅");
    } catch (err) {
      console.error("TOGGLE ERROR:", err);
      toast.error(err.message || err.error || "Toggle failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  /* ================= DELETE ================= */
  const handleDeleteAnnouncement = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete the announcement "${title}"?`)) {
      return;
    }

    try {
      setActionLoadingId(id);

      await deleteAnnouncement(id);

      setAnnouncements((prev) => prev.filter((a) => a.id !== id && a._id !== id));
      toast.success("Deleted successfully ✅");
    } catch (err) {
      console.error("DELETE ERROR:", err);
      toast.error(err.message || err.error || "Delete failed");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.heading}>Announcements</h2>
          <p className={styles.subtitle}>Create and manage announcements.</p>
        </div>

        <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>
          <Plus size={18} />
          Create
        </button>
      </div>

      {/* ================= LOADER ================= */}
      {loading ? (
        <div className={styles.loaderWrapper}>
          <div className={styles.loader}></div>
          <p>Loading announcements...</p>
        </div>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Target</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {announcements.length > 0 ? (
              announcements.map((a) => {
                const id = a.id || a._id;
                return (
                  <tr key={id}>
                    <td>{a.title}</td>
                    <td>{a.type}</td>
                    <td>{a.target}</td>
                    <td>{a.priority}</td>
                    <td>{a.status}</td>

                    <td>
                      <div className={styles.actionButtons}>
                        <button
                          className={styles.toggleBtn}
                          onClick={() => handleToggleStatus(id)}
                          disabled={actionLoadingId === id}
                        >
                          {actionLoadingId === id ? "..." : "Toggle"}
                        </button>

                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDeleteAnnouncement(id, a.title)}
                          disabled={actionLoadingId === id}
                        >
                          {actionLoadingId === id ? "..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                  No announcements found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* ================= CREATE MODAL ================= */}
      {isModalOpen && (
        <div className={styles.overlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.formCard} onClick={(e) => e.stopPropagation()}>
            <h3>Create Announcement</h3>

            <div className={styles.grid}>
              <input
                name="title"
                placeholder="Title"
                value={newAnnouncement.title}
                onChange={handleChange}
              />

              <textarea
                name="message"
                placeholder="Message"
                value={newAnnouncement.message}
                onChange={handleChange}
              />

              <select name="type" value={newAnnouncement.type} onChange={handleChange}>
                <option value="Maintenance">Maintenance</option>
                <option value="Feature Update">Feature Update</option>
                <option value="Billing Reminder">Billing Reminder</option>
                <option value="General">General</option>
              </select>

              <select name="target" value={newAnnouncement.target} onChange={handleChange}>
                <option value="All Users">All Users</option>
                <option value="Admin Only">Admin Only</option>
              </select>

              <select name="priority" value={newAnnouncement.priority} onChange={handleChange}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className={styles.actionsRow}>
              <button
                className={styles.saveBtn}
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? "Sending..." : "Send Announcement"}
              </button>

              <button
                className={styles.cancelBtn}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
