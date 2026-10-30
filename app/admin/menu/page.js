"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

export default function AdminMenuPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", price: "", category: "General" });
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true });
    setItems(data || []);
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
  }, [load, router]);

  const addItem = async (e) => {
    e.preventDefault();
    const price = parseInt(form.price, 10);
    if (!form.name.trim() || isNaN(price)) return setMsg("Naam aur sahi price lazmi hai.");
    const { error } = await supabase.from("menu_items").insert({
      name: form.name.trim(),
      description: form.description.trim() || null,
      price,
      category: form.category.trim() || "General",
      sort_order: items.length + 1,
    });
    if (error) setMsg("Item add nahi hua.");
    else {
      setMsg("Item add ho gaya ✓");
      setForm({ name: "", description: "", price: "", category: "General" });
      load();
    }
  };

  const updateField = async (id, field, value) => {
    const v = field === "price" ? parseInt(value, 10) || 0 : value;
    await supabase.from("menu_items").update({ [field]: v }).eq("id", id);
    load();
  };

  const toggle = async (item) => {
    await supabase
      .from("menu_items")
      .update({ is_available: !item.is_available })
      .eq("id", item.id);
    load();
  };

  const del = async (id) => {
    if (!confirm("Ye item delete kar dein?")) return;
    await supabase.from("menu_items").delete().eq("id", id);
    load();
  };

  if (!ready) return <p className="muted">Loading…</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Manage Menu</h2>
        <Link href="/admin">
          <button className="btn secondary small">← Orders</button>
        </Link>
      </div>

      <form className="order-form" onSubmit={addItem}>
        <strong>Add New Item</strong>
        <label>Name</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Chicken Tikka" />
        <label>Description</label>
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Short detail" />
        <label>Price (Rs)</label>
        <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} inputMode="numeric" placeholder="e.g. 450" />
        <label>Category</label>
        <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Fast Food / Desi / Drinks / Ice Cream" />
        {msg && <p className="muted">{msg}</p>}
        <button className="btn" style={{ marginTop: 10 }}>Add Item</button>
      </form>

      <div className="panel">
        <table className="menu-admin">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Available</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((i) => (
              <tr key={i.id}>
                <td>
                  <input
                    defaultValue={i.name}
                    onBlur={(e) => e.target.value !== i.name && updateField(i.id, "name", e.target.value)}
                  />
                </td>
                <td style={{ width: 90 }}>
                  <input
                    defaultValue={i.price}
                    inputMode="numeric"
                    onBlur={(e) => e.target.value !== String(i.price) && updateField(i.id, "price", e.target.value)}
                  />
                </td>
                <td style={{ width: 120 }}>
                  <input
                    defaultValue={i.category}
                    onBlur={(e) => e.target.value !== i.category && updateField(i.id, "category", e.target.value)}
                  />
                </td>
                <td>
                  <button className="btn small secondary" onClick={() => toggle(i)}>
                    {i.is_available ? "On ✓" : "Off"}
                  </button>
                </td>
                <td>
                  <button className="btn small dark" onClick={() => del(i.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">Naam/price/category badal kar bahir click karein — save ho jayega.</p>
      </div>
    </div>
  );
}
