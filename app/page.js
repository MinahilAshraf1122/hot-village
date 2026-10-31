"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import { imageFor, HERO_IMAGE } from "../lib/categoryImages";

// Menu items whose name ends in a size — like "Chicken Tikka Pizza (Small)"
// or "Chicken Karahi (Half)" — are ONE dish with several sizes. This splits
// a full item name into its dish name (base) and its size label.
const SIZE_RE = /\s*\((Small|Medium|Large|Family|Half|Full)\)\s*$/;
const SIZE_ORDER = { Small: 0, Medium: 1, Large: 2, Family: 3, Half: 0, Full: 1 };

function splitName(name) {
  const match = name.match(SIZE_RE);
  if (!match) return { base: name, size: null };
  return { base: name.replace(SIZE_RE, ""), size: match[1] };
}

// Groups flat menu rows into dish cards, each holding its size variants.
function groupMenu(items) {
  const map = new Map();
  for (const item of items) {
    const { base, size } = splitName(item.name);
    const key = item.category + "|" + base;
    if (!map.has(key)) {
      map.set(key, { key, base, category: item.category, variants: [] });
    }
    map.get(key).variants.push({ ...item, size });
  }
  const groups = Array.from(map.values());
  for (const group of groups) {
    group.variants.sort(
      (a, b) => (SIZE_ORDER[a.size] ?? 9) - (SIZE_ORDER[b.size] ?? 9)
    );
    const withDesc = group.variants.find((v) => v.description);
    group.description = withDesc ? withDesc.description : "";
  }
  return groups;
}

// One dish card: photo, name, size buttons (when the dish has sizes),
// and the price + Add controls for the currently selected size.
function MenuCard({ group }) {
  const { items, add, remove } = useCart();
  const [selected, setSelected] = useState(0);
  const variant = group.variants[Math.min(selected, group.variants.length - 1)];
  const qty = items.find((i) => i.id === variant.id)?.qty || 0;

  return (
    <div className="card">
      <img
        className="card-img"
        src={imageFor(group.variants[0])}
        alt={group.base}
        loading="lazy"
      />
      <div className="card-body">
        <h3>{group.base}</h3>
        <div className="desc">{group.description}</div>

        {group.variants.length > 1 && (
          <div className="sizes">
            {group.variants.map((v, i) => (
              <button
                key={v.id}
                className={"size-chip" + (i === selected ? " active" : "")}
                onClick={() => setSelected(i)}
              >
                {v.size}
              </button>
            ))}
          </div>
        )}

        <div className="row">
          <span className="price">Rs {variant.price}</span>
          {qty === 0 ? (
            <button className="btn small" onClick={() => add(variant)}>
              + Add
            </button>
          ) : (
            <span>
              <button className="qtybtn" onClick={() => remove(variant.id)}>
                −
              </button>{" "}
              <strong>{qty}</strong>{" "}
              <button className="qtybtn" onClick={() => add(variant)}>
                +
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");
  const { items, total, count } = useCart();

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
  const groups = useMemo(() => groupMenu(shown), [shown]);

  return (
    <div>
      <div className="hero">
        <div className="hero-text">
          <img src="/logo.png" alt="Hot Village logo" className="hero-logo" />
          <h1>
            Hot <span>Village</span>
          </h1>
          <p>
            Fresh &amp; tasty food in Kot Radha Kishan — order online, pay cash
            at your door.
          </p>
          <div className="hero-pills">
            <span className="hero-pill">
              📞 Home Delivery <strong>0345-1132854</strong>
            </span>
            <span className="hero-pill">
              Minimum Order <strong>Rs 1000</strong>
            </span>
            <span className="hero-pill">⚡ Fastest in Taste</span>
          </div>
        </div>
        <img src={HERO_IMAGE} alt="Hot Village food" className="hero-img" />
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
        {groups.map((group) => (
          <MenuCard key={group.key} group={group} />
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
