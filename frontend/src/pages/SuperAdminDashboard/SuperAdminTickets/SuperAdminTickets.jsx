import React, { useEffect, useState } from "react";
import styles from "./SuperAdminTickets.module.css";
import { toast } from "react-toastify";
import { getAllSupportTickets, updateSupportTicketStatus } from "../../../api/support.js";

const statusOptions = ["OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED"];

const statusConfig = {
  OPEN: { label: "Open", color: "open" },
  IN_PROGRESS: { label: "In Progress", color: "in_progress" },
  PENDING: { label: "Pending", color: "pending" },
  RESOLVED: { label: "Resolved", color: "resolved" },
  CLOSED: { label: "Closed", color: "closed" },
};

export default function SuperAdminTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [viewTicket, setViewTicket] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [status, setStatus] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await getAllSupportTickets();
      // In supportTicketController: getAllSupportTickets returns the array directly or in a payload
      // Wait, let's verify what supportTicketController returns:
      // res.status(200).json(tickets);
      // Wait, look at supportTicketController.js getAllSupportTicketsHandler (from lines 27-34):
      // res.status(200).json(tickets);
      // So getAllSupportTickets returns the array of tickets directly!
      setTickets(res || []);
    } catch (err) {
      toast.error(err.message || err.error || "Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const openStatusModal = (t) => {
    setSelectedTicket(t);
    setStatus(t.status);
    setShowStatusModal(true);
  };

  const updateStatus = async () => {
    try {
      setUpdating(true);
      await updateSupportTicketStatus(selectedTicket.ticketId, status);
      
      setTickets((prev) =>
        prev.map((t) =>
          t.ticketId === selectedTicket.ticketId ? { ...t, status } : t
        )
      );
      
      toast.success("Status updated successfully ✅");
      setShowStatusModal(false);
    } catch (err) {
      toast.error(err.message || err.error || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.headerIcon}>🎫</span>
          <div>
            <h1 className={styles.title}>Support Tickets</h1>
            <p className={styles.subtitle}>Manage and resolve user support requests</p>
          </div>
        </div>
        <div className={styles.statsRow}>
          {statusOptions.map((s) => (
            <div key={s} className={`${styles.statChip} ${styles[statusConfig[s].color]}`}>
              <span className={styles.statCount}>
                {tickets.filter((t) => t.status === s).length}
              </span>
              <span className={styles.statLabel}>{statusConfig[s].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* TABLE CARD */}
      <div className={styles.card}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Ticket ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Query</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className={styles.emptyRow}>
                    <div className={styles.loadingSpinner}>
                      <div className={styles.spinner}></div>
                      <span>Fetching tickets…</span>
                    </div>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className={styles.emptyRow}>
                    <div className={styles.emptyState}>
                      <span className={styles.emptyIcon}>📭</span>
                      <p>No tickets found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                tickets.map((t, i) => (
                  <tr key={t.ticketId || i} className={styles.row}>
                    <td className={styles.indexCell}>{i + 1}</td>
                    <td>
                      <span className={styles.ticketId}>#{t.ticketId}</span>
                    </td>
                    <td className={styles.nameCell}>{t.name}</td>
                    <td className={styles.emailCell}>{t.email}</td>
                    <td>{t.mobileNo || t.mobile || "-"}</td>
                    <td>
                      <button
                        className={styles.queryPreview}
                        onClick={() => setViewTicket(t)}
                        title="Click to view full query"
                      >
                        <span className={styles.queryText}>
                          {t.query?.length > 45
                            ? t.query.slice(0, 45) + "…"
                            : t.query}
                        </span>
                        <span className={styles.viewIcon}>↗</span>
                      </button>
                    </td>
                    <td>
                      <span
                        className={`${styles.statusBadge} ${styles[statusConfig[t.status]?.color || "open"]}`}
                      >
                        <span className={styles.statusDot}></span>
                        {statusConfig[t.status]?.label || t.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.updateBtn}
                        onClick={() => openStatusModal(t)}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── VIEW QUERY MODAL ── */}
      {viewTicket && (
        <div className={styles.overlay} onClick={() => setViewTicket(null)}>
          <div
            className={`${styles.modal} ${styles.viewModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <span className={styles.modalIcon}>📋</span>
                <div>
                  <h3 className={styles.modalTitle}>Ticket Details</h3>
                  <span className={styles.modalSubtitle}>#{viewTicket.ticketId}</span>
                </div>
              </div>
              <button
                className={styles.closeX}
                onClick={() => setViewTicket(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Name</span>
                  <span className={styles.infoValue}>{viewTicket.name}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoValue}>{viewTicket.email}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Phone</span>
                  <span className={styles.infoValue}>{viewTicket.mobileNo || viewTicket.mobile || "-"}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Status</span>
                  <span
                    className={`${styles.statusBadge} ${styles[statusConfig[viewTicket.status]?.color || "open"]}`}
                  >
                    <span className={styles.statusDot}></span>
                    {statusConfig[viewTicket.status]?.label || viewTicket.status}
                  </span>
                </div>
              </div>

              <div className={styles.querySection}>
                <span className={styles.infoLabel}>Query</span>
                <div className={styles.queryBox}>{viewTicket.query}</div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.secondaryBtn}
                onClick={() => setViewTicket(null)}
              >
                Close
              </button>
              <button
                className={styles.primaryBtn}
                onClick={() => {
                  setViewTicket(null);
                  openStatusModal(viewTicket);
                }}
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STATUS UPDATE MODAL ── */}
      {showStatusModal && (
        <div className={styles.overlay} onClick={() => setShowStatusModal(false)}>
          <div
            className={`${styles.modal} ${styles.statusModal}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitleGroup}>
                <span className={styles.modalIcon}>⚡</span>
                <div>
                  <h3 className={styles.modalTitle}>Update Status</h3>
                  <span className={styles.modalSubtitle}>
                    #{selectedTicket?.ticketId}
                  </span>
                </div>
              </div>
              <button
                className={styles.closeX}
                onClick={() => setShowStatusModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.selectLabel}>Select new status</p>
              <div className={styles.statusOptions}>
                {statusOptions.map((s) => (
                  <button
                    key={s}
                    className={`${styles.statusOption} ${status === s ? styles.selectedOption : ""} ${styles[statusConfig[s].color]}`}
                    onClick={() => setStatus(s)}
                  >
                    <span className={styles.statusDot}></span>
                    {statusConfig[s].label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.secondaryBtn}
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.primaryBtn}
                onClick={updateStatus}
                disabled={updating}
              >
                {updating ? (
                  <>
                    <span className={styles.btnSpinner}></span> Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
