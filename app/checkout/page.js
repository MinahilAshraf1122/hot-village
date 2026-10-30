"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import { useCart } from "../../context/CartContext";

function makeTrackingCode() {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no confusing 0/O, 1/I/L
  let code = "";
  const arr = new Uint32Array(6);
  crypto.getRandomValues(arr);
  arr.forEach((n) => (code += alphabet[n % alphabet.length]));
  return code;
}

export default function CheckoutPage() {
  const { items, total, clear } = useCart();
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [type, setType] = useState("delivery");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const placeOrder = async (e) => {
    e.preventDefault();
    setError("");
    if (items.length === 0) return setError("Cart khaali hai.");
    if (!name.trim()) return setError("Apna naam likhein.");
    if (!/^(\+?92|0)?3\d{9}$/.test(phone.replace(/[\s-]/g, "")))
      return setError("Sahi mobile number likhein (03XX-XXXXXXX).");
    if (type === "delivery" && !address.trim())
      return setError("Delivery ke liye address lazmi hai.");

    setPlacing(true);
    const tracking_code = makeTrackingCode();
    const { error } = await supabase.from("orders").insert({
      customer_name: name.trim(),
      customer_phone: phone.trim(),
      customer_address: type === "delivery" ? address.trim() : null,
      order_type: type,
      items: items.map((i) => ({ name: i.name, price: i.price, qty: i.qty })),
      total,
      tracking_code,
    });
    setPlacing(false);

    if (error) {
      setError("Order place nahi ho saka. Dobara try karein.");
      return;
    }
    try {
      const saved = JSON.parse(localStorage.getItem("hv_orders") || "[]");
      saved.unshift(tracking_code);
      localStorage.setItem("hv_orders", JSON.stringify(saved.slice(0, 5)));
    } catch {}
    clear();
    router.push(`/track?code=${tracking_code}&placed=1`);
  };

  return (
    <div>
      <h2>Checkout</h2>
      {items.length === 0 ? (
        <p className="muted">
          Cart khaali hai. <a href="/">Menu par wapas jayein →</a>
        </p>
      ) : (
        <form className="order-form" onSubmit={placeOrder}>
          <p className="muted">
            Total: <strong>Rs {total}</strong> · Payment: Cash on{" "}
            {type === "delivery" ? "Delivery" : "Pickup"}
          </p>
          <label>Your Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ahmed Raza" />
          <label>Mobile Number</label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03XX-XXXXXXX" inputMode="tel" />
          <label>Order Type</label>
          <div className="radio-row">
            <label>
              <input type="radio" checked={type === "delivery"} onChange={() => setType("delivery")} />
              Delivery
            </label>
            <label>
              <input type="radio" checked={type === "pickup"} onChange={() => setType("pickup")} />
              Pickup
            </label>
          </div>
          {type === "delivery" && (
            <>
              <label>Address</label>
              <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={2} placeholder="House, street, area…" />
            </>
          )}
          {error && <p className="error">{error}</p>}
          <button className="btn" style={{ marginTop: 14, width: "100%" }} disabled={placing}>
            {placing ? "Placing order…" : `Place Order · Rs ${total}`}
          </button>
        </form>
      )}
    </div>
  );
}
