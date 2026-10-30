"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

const NEXT_ACTIONS = {
  pending: [
    { label: "✓ Confirm", status: "confirmed" },
    { label: "✕ Reject", status: "rejected" },
  ],
  confirmed: [{ label: "Start Preparing", status: "preparing" }],
  preparing: [{ label: "Mark Ready", status: "ready" }],
  ready: [{ label: "Mark Delivered", status: "delivered" }],
  delivered: [],
  rejected: [],
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [ready, setReady] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setOrders(data || []);
  }, []);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
        return;
      }
      setReady(true);
      load();
    })();

    // Live updates: reload when any order changes
    const channel = supabase
      .channel("orders-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => load()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load, router]);

  const setStatus = async (id, status) => {
    await supabase.from("orders").update({ status }).eq("id", id);
    load();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const today = new Date().toDateString();
  const todays = orders.filter(
    (o) => new Date(o.created_at).toDateString() === today
  );
  const todaySales = todays
    .filter((o) => o.status === "delivered")
    .reduce((s, o) => s + o.total, 0);

  if (!ready) return <p className="muted">Loading…</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Orders</h2>
        <span>
          <Link href="/admin/menu">
            <button className="btn secondary small">Manage Menu</button>
          </Link>{" "}
          <button className="btn dark small" onClick={logout}>
            Logout
          </button>
        </span>
      </div>

      <div className="panel">
        <strong>Today:</strong> {todays.length} order(s) · Delivered sales:{" "}
        <strong>Rs {todaySales}</strong>
        <span className="muted"> · New orders appear here automatically.</span>
      </div>

      {orders.length === 0 && <p className="muted">Abhi koi order nahi aya.</p>}

      {orders.map((o) => (
        <div className="order-card" key={o.id}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>Order #{o.id}</strong>
            <span className="pill">{o.status}</span>
          </div>
          <div className="meta">
            {o.customer_name} · {o.customer_phone} ·{" "}
            {o.order_type === "delivery" ? "Delivery" : "Pickup"}
            <br />
            {o.customer_address || ""}
            <br />
            {new Date(o.created_at).toLocaleString()}
          </div>
          <div style={{ marginTop: 6 }}>
            {(o.items || []).map((i, idx) => (
              <div key={idx}>
                {i.name} × {i.qty} — Rs {i.price * i.qty}
              </div>
            ))}
            <strong>Total: Rs {o.total}</strong>
          </div>
          <div className="status-actions">
            {(NEXT_ACTIONS[o.status] || []).map((a) => (
              <button
                key={a.status}
                className="btn small"
                onClick={() => setStatus(o.id, a.status)}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
