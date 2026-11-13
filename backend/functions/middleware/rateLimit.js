/**
 * Small in-memory fixed-window rate limiter.
 * NOTE: state is per server instance (Cloud Functions may run several), so this is
 * a first line of defence against brute force / email bombing, not a global cap.
 */
export function rateLimit({ windowMs, max, key, message = "Too many requests, please try again later." }) {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const k = key ? key(req) : req.ip;

    if (hits.size > 5000) {
      for (const [hk, entry] of hits) if (entry.reset <= now) hits.delete(hk);
    }

    let entry = hits.get(k);
    if (!entry || entry.reset <= now) {
      entry = { count: 0, reset: now + windowMs };
      hits.set(k, entry);
    }
    entry.count += 1;

    if (entry.count > max) {
      res.set("Retry-After", String(Math.ceil((entry.reset - now) / 1000)));
      return res.status(429).json({ error: message });
    }
    next();
  };
}

export const ipAndEmailKey = (req) =>
  `${req.ip}|${String(req.body?.email || "").trim().toLowerCase()}`;
