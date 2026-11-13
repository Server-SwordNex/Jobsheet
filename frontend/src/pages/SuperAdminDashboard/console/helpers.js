import { useCallback, useEffect, useRef, useState } from "react";

/* ---------- dates & money ---------- */

/** Firestore timestamps reach the browser as { _seconds } (or { seconds }); ISO strings and Dates work too. */
export const toDate = (value) => {
  if (!value) return null;
  const seconds = value._seconds ?? value.seconds;
  const d = seconds != null ? new Date(seconds * 1000) : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatDate = (value) => {
  const d = toDate(value);
  return d ? d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-";
};

export const formatDateTime = (value) => {
  const d = toDate(value);
  return d
    ? d.toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "-";
};

export const rupees = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(n) || 0);

/* ---------- status colours ---------- */

export const statusTone = (status) => {
  switch (String(status || "").toUpperCase().replace(/[\s-]+/g, "_")) {
    case "ACTIVE":
    case "RESOLVED":
    case "COMPLETED":
    case "PAID":
      return "ok";
    case "EXPIRED":
    case "REJECTED":
    case "CANCELLED":
      return "bad";
    case "OPEN":
    case "INITIATED":
      return "warn";
    case "IN_PROGRESS":
    case "PENDING":
      return "info";
    default:
      return "";
  }
};

/* ---------- API ---------- */

/** The API client rejects with the response body ({ error } or { message }), not an Error. */
export const errMsg = (err) => err?.error || err?.message || (typeof err === "string" ? err : "Something went wrong");

/**
 * Runs `fetcher()` on mount. Returns { data, error, loading, reload }.
 * `fetcher` may be a new function on every render; only the first one is used until reload().
 */
export const useApi = (fetcher) => {
  const ref = useRef(fetcher);
  useEffect(() => {
    ref.current = fetcher;
  });

  const [state, setState] = useState({ data: null, error: "", loading: true });

  const run = useCallback(async () => {
    try {
      return { data: await ref.current(), error: "", loading: false };
    } catch (err) {
      return { data: null, error: errMsg(err), loading: false };
    }
  }, []);

  useEffect(() => {
    let alive = true;
    run().then((next) => alive && setState(next));
    return () => {
      alive = false;
    };
  }, [run]);

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    return run().then(setState);
  }, [run]);

  return { ...state, reload };
};
