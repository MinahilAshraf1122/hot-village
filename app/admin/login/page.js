"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError("Login fail — email ya password ghalat hai.");
    else router.push("/admin");
  };

  return (
    <div>
      <h2>Restaurant Admin Login</h2>
      <form className="order-form" onSubmit={login}>
        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error">{error}</p>}
        <button className="btn" style={{ marginTop: 14, width: "100%" }} disabled={busy}>
          {busy ? "Logging in…" : "Login"}
        </button>
      </form>
    </div>
  );
}
