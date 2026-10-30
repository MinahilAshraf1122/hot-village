"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";

export default function HomePage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");
  const { items, add, remove, total, count } = useCart();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_available", true)
        .order("sort_order", { ascending: true });
      if (error) setError("Menu load nahi ho saka. Thori dair baad dobara try karein.");
      else setMenu(data || []);
      setLoading(false);
    })();
  }, []);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(menu.map((m) => m.category)))],
    [menu]
  );
  const shown =
    category === "All" ? menu : menu.filter((m) => m.category === category);
  const qtyOf = (id) => items.find((i) => i.id === id)?.qty || 0;

  return (
    <div>
      <div className="hero">
        <h1>Hot Village</h1>
        <p>Fresh &amp; tasty food in Kot Radha Kishan — order online, pay cash at your door.</p>
      </div>

      {loading && <p className="muted">Menu load ho raha hai…</p>}
      {error && <p className="error">{error}</p>}

      <div className="chips">
        {categories.map((c) => (
          <button
            key={c}
            className={"chip" + (category === c ? " active" : "")}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid">
        {shown.map((item) => (
          <div className="card" key={item.id}>
            <h3>{item.name}</h3>
            <div className="desc">{item.description || ""}</div>
            <div className="row">
              <span className="price">Rs {item.price}</span>
              {qtyOf(item.id) === 0 ? (
                <button className="btn small" onClick={() => add(item)}>
                  + Add
                </button>
              ) : (
                <span>
                  <button className="qtybtn" onClick={() => remove(item.id)}>−</button>{" "}
                  <strong>{qtyOf(item.id)}</strong>{" "}
                  <button className="qtybtn" onClick={() => add(item)}>+</button>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {items.length > 0 && (
        <>
          <div className="cartlist">
            <strong>Your Cart</strong>
            {items.map((i) => (
              <div className="cartline" key={i.id}>
                <span>
                  {i.name} × {i.qty}
                </span>
                <span>Rs {i.price * i.qty}</span>
              </div>
            ))}
          </div>
          <div className="cartbar">
            <span>
              {count} item(s) · <strong>Rs {total}</strong>
            </span>
            <Link href="/checkout">
              <button className="btn">Checkout →</button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
