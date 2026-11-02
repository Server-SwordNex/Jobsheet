import React, { useEffect, useState } from "react";
import styles from "./Support.module.css";
import { toast } from "react-toastify";
import { Headphones } from "lucide-react";
import { createSupportTicket, getSupportTickets } from "../../../api/support.js";

export default function Support() {
  const [profile, setProfile] = useState(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [fetching, setFetching] = useState(false);

  /* =========================
     LOAD USER
  ========================== */
  useEffect(() => {
    const storedProfile = localStorage.getItem("user");
    if (storedProfile) {
      const parsed = JSON.parse(storedProfile);
      setProfile(parsed);
      fetchTickets(parsed.email);
    }
  }, []);

  /* =========================
     FETCH TICKETS
  ========================== */
  const fetchTickets = async (email) => {
    try {
      setFetching(true);
      const data = await getSupportTickets(email);
      setTickets(data || []);
    } catch (error) {
      console.error(error);
      toast.error(error.error || error.message || "Failed to fetch tickets");
    } finally {
      setFetching(false);
    }
  };

  /* =========================
     SUBMIT QUERY
  ========================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      return toast.error("Please enter your query");
    }

    if (!profile) {
      return toast.error("User profile not found");
    }

    try {
      setLoading(true);
      const res = await createSupportTicket({
        name: profile.username,
        companyName: profile.companyName,
        email: profile.email,
        mobileNo: profile.mobileNo,
        query,
      });

      toast.success("Query submitted successfully");

      /* AUTO ADD NEW TICKET */
      setTickets((prev) => [
        {
          ticketId: res.ticketId,
          name: profile.username,
          companyName: profile.companyName,
          query,
          status: "OPEN",
        },
        ...prev,
      ]);

      setQuery("");
    } catch (error) {
      console.error(error);
      toast.error(error.error || error.message || "Failed to submit query");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className={styles.supportSection}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className={styles.supportSection}>
      {/* HEADER */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "14px" }}>
        <div className={styles.subuserIcon}>
          <Headphones size={18} />
        </div>
        <div>
          <h2 style={{ fontSize: 16, margin: 0 }}>Support</h2>
          <p className={styles.subText}>
            Need help? Send us your query and our support team will get back to you.
          </p>
        </div>
      </div>

      {/* FORM */}
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.grid}>
          <div className={styles.field}>
            <label>Name</label>
            <input type="text" value={profile.username || ""} disabled />
          </div>
          <div className={styles.field}>
            <label>Company Name</label>
            <input type="text" value={profile.companyName || ""} disabled />
          </div>
          <div className={styles.field}>
            <label>Email</label>
            <input type="email" value={profile.email || ""} disabled />
          </div>
          <div className={styles.field}>
            <label>Phone</label>
            <input type="text" value={profile.mobileNo || ""} disabled />
          </div>
        </div>

        {/* QUERY */}
        <div className={styles.queryBox}>
          <label>Your Query</label>
          <textarea
            placeholder="Describe your issue or question..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
        </div>

        {/* BUTTON */}
        <div className={styles.footer}>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <span className={styles.loaderWrapper}>
                <span className={styles.loader}></span>
                Submitting...
              </span>
            ) : (
              "Submit Query"
            )}
          </button>
        </div>
      </form>

      {/* TICKETS TABLE */}
      <div className={styles.ticketSection}>
        <h3>Your Support Tickets</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>S.No</th>
                <th>Ticket ID</th>
                <th>Name</th>
                <th>Query</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {fetching ? (
                <tr>
                  <td colSpan="5">Loading...</td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="5">No support tickets found</td>
                </tr>
              ) : (
                tickets.map((item, index) => (
                  <tr key={item.ticketId || index}>
                    <td>{index + 1}</td>
                    <td>{item.ticketId || "-"}</td>
                    <td>{item.name || "-"}</td>
                    <td>{item.query}</td>
                    <td>
                      <span
                        className={
                          item.status === "OPEN"
                            ? styles.open
                            : item.status === "PENDING"
                            ? styles.pending
                            : styles.closed
                        }
                      >
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}