"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { useCart } from "../context/CartContext";
import { imageForDish, HERO_DISH_IMAGE } from "../lib/dishImages";

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

// The "What are you craving?" tiles. Each tile points at one menu category
// (the first of its cats) and shows the lowest real price in its categories.
const SHOWCASE = [
  { label: "Karahi & Handi", urdu: "کڑاہی", cats: ["Chicken Karahi", "Mutton Karahi", "Beef Karahi", "Chicken Handi"] },
  { label: "BBQ & Boti", urdu: "باربی کیو", cats: ["Bar-B-Q"] },
  { label: "Tandoori", urdu: "تندوری", cats: ["Tandoori"] },
  { label: "Pizza", urdu: "پیزا", cats: ["Pizza"] },
  { label: "Fast Food", urdu: "فاسٹ فوڈ", cats: ["Fast Food"] },
  { label: "Pakistani", urdu: "پاکستانی", cats: ["Pakistani"] },
];

// One dish card: its own photo, name, size buttons (when the dish has
// sizes), and the price + Add controls for the currently selected size.
function MenuCard({ group }) {
  const { items, add, remove } = useCart();
  const [selected, setSelected] = useState(0);
  const variant = group.variants[Math.min(selected, group.variants.length - 1)];
  const qty = items.find((i) => i.id === variant.id)?.qty || 0;

  return (
    <div className="card">
      <div className="card-media">
        <img
          className="card-img"
          src={imageForDish(group.variants[0], group.base)}
          alt={group.base}
          loading="lazy"
        />
        <span className="card-tag">{group.category}</span>
      </div>
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
            <span className="qtyctrl">
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

// One family-deal card: red header strip with the deal name and price,
// the deal contents underneath, and its own Add button.
function DealCard({ item }) {
  const { items, add, remove } = useCart();
  const qty = items.find((i) => i.id === item.id)?.qty || 0;

  return (
    <div className="deal-card">
      <div className="deal-head">
        <span className="deal-name">{item.name}</span>
        <span className="deal-price">Rs. {item.price}</span>
      </div>
      <div className="deal-body">
        <p>{item.description}</p>
        <div className="row">
          <span className="deal-note">Family deal</span>
          {qty === 0 ? (
            <button className="btn small" onClick={() => add(item)}>
              + Add
            </button>
          ) : (
            <span className="qtyctrl">
              <button className="qtybtn" onClick={() => remove(item.id)}>
                −
              </button>{" "}
              <strong>{qty}</strong>{" "}
              <button className="qtybtn" onClick={() => add(item)}>
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

  const deals = useMemo(
    () => menu.filter((m) => m.category === "Deals"),
    [menu]
  );

  // Lowest real price inside each showcase tile's categories.
  const tileFrom = (cats) => {
    const prices = menu.filter((m) => cats.includes(m.category)).map((m) => m.price);
    return prices.length ? Math.min(...prices) : null;
  };

  const goCategory = (cat) => {
    setCategory(cat);
    document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      {/* ---------- Hero (solid red band) ---------- */}
      <section className="band hero-band">
        <div className="band-inner hero-inner">
          <div className="hero-copy">
            <span className="hero-eyebrow">FAMILY RESTAURANT · KOT RADHA KISHAN</span>
            <h1 className="hero-title">HOT VILLAGE</h1>
            <span className="hero-tagline">Fastest in taste</span>
            <p>
              Karahi, BBQ, tandoori naan, pizza and fast food. Order a family
              deal or call for home delivery.
            </p>
            <div className="hero-actions">
              <a className="btn amber big" href="#menu">
                View full menu
              </a>
              <a className="btn outline-light big" href="tel:+923451132854">
                Call 0345-1132854
              </a>
            </div>
          </div>
          <img
            className="hero-photo"
            src={HERO_DISH_IMAGE}
            alt="Hot Village Special Karahi"
          />
        </div>
      </section>

      {loading && <p className="muted center-note">Menu load ho raha hai…</p>}
      {error && <p className="error center-note">{error}</p>}

      {/* ---------- What are you craving? ---------- */}
      {!loading && !error && (
        <section className="band cream-band">
          <div className="band-inner">
            <h2 className="sec-title">What are you craving?</h2>
            <div className="tiles">
              {SHOWCASE.map((tile) => {
                const from = tileFrom(tile.cats);
                return (
                  <button
                    key={tile.label}
                    className="tile"
                    onClick={() => goCategory(tile.cats[0])}
                  >
                    <span className="tile-name">{tile.label}</span>
                    <span className="tile-urdu" lang="ur" dir="rtl">
                      {tile.urdu}
                    </span>
                    {from !== null && (
                      <span className="tile-from">
                        from <strong>Rs. {from}</strong>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Family deals ---------- */}
      {deals.length > 0 && (
        <section className="band white-band" id="deals">
          <div className="band-inner">
            <div className="sec-head">
              <div>
                <h2 className="sec-title">Family deals</h2>
                <p className="sec-sub">Every deal comes with a cold drink.</p>
              </div>
              <button className="text-link" onClick={() => goCategory("Deals")}>
                See all {deals.length} deals →
              </button>
            </div>
            <div className="deal-grid">
              {deals.slice(0, 6).map((deal) => (
                <DealCard key={deal.id} item={deal} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Full menu / ordering ---------- */}
      <section className="band cream-band" id="menu">
        <div className="band-inner">
          <h2 className="sec-title">Our menu</h2>

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
                  <button className="btn amber">Checkout →</button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ---------- Home delivery banner ---------- */}
      <section className="band dark-band">
        <div className="band-inner delivery-inner">
          <div>
            <span className="delivery-title">HOME DELIVERY</span>
            <a className="delivery-number" href="tel:+923451132854">
              0345-1132854
            </a>
            <span className="delivery-min">Minimum order Rs. 1000</span>
          </div>
          <a className="btn amber big" href="tel:+923451132854">
            Call now
          </a>
        </div>
      </section>
    </div>
  );
}
