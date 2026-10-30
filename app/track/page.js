"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

const STEPS = ["pending", "confirmed", "preparing", "ready", "delivered"];
const LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready",
  delivered: "Delivered",
  rejected: "Rejected",
};

function TrackInner() {
  const params = useSearchParams();
  const placed = params.get("placed");
  const [code, setCode] = useState(params.get("code") || "");
  const [order, setOrder] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = useCallback(async (c) => {
    const clean = (c || "").trim().toUpperCase();
    if (!clean) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("get_order_status", {
      p_tracking_code: clean,
    });
    setLoading(false);
    if (error || !data || data.length === 0) {
      setOrder(null);
      setMsg("Is code par koi order nahi mila. Code check karke dobara try karein.");
    } else {
      setMsg("");
      setOrder(data[0]);
    }
  }, []);

  useEffect(() => {
    const initial = params.get("code");
    if (initial) lookup(initial);
  }, [params, lookup]);

  // Auto-refresh every 15 seconds while an order is shown
  useEffect(() => {
    if (!order) return;
    const t = setInterval(() => lookup(code), 15000);
    return () => clearInterval(t);
  }, [order, code, lookup]);

  const stepIndex = order ? STEPS.indexOf(order.status) : -1;

  return (
    <div>
      <h2>Track Your Order</h2>
      {placed && (
        <div className="panel" style={{ borderColor: "#2e7d32" }}>
          🎉 <strong>Order place ho gaya!</strong> Neeche apna tracking code
          mehfooz kar lein — is se aap kabhi bhi status dekh sakte hain.
        </div>
      )}
      <div className="panel">
        <label>Tracking Code</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. K7X2PQ"
            style={{ letterSpacing: 2, textTransform: "uppercase" }}
          />
          <button className="btn" onClick={() => lookup(code)} disabled={loading}>
            {loading ? "…" : "Check"}
          </button>
        </div>
        {msg && <p className="error">{msg}</p>}
      </div>

      {order && (
        <div className="panel">
          <div className="muted">Tracking code</div>
          <div className="big-code">{code.toUpperCase()}</div>
          <p className="muted">
            Total Rs {order.total} · {order.order_type === "delivery" ? "Delivery" : "Pickup"}
          </p>
          {order.status === "rejected" ? (
            <div className="status-steps">
              <span className="step rejected">Order Rejected — restaurant se rabta karein</span>
            </div>
          ) : (
            <div className="status-steps">
              {STEPS.map((s, i) => (
                <span key={s} className={"step" + (i <= stepIndex ? " done" : "")}>
                  {LABELS[s]}
                </span>
              ))}
            </div>
          )}
          <p className="muted">Status har 15 second mein khud update hota hai.</p>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<p className="muted">Loading…</p>}>
      <TrackInner />
    </Suspense>
  );
}
