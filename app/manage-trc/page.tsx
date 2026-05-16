"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/manage-trc/dashboard");
    } catch {
      setError("Login gagal. Cek email atau password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login">
      <section className="card">
        <p className="eyebrow">TRC ADMIN</p>
        <h1>Masuk Dashboard</h1>
        <p className="sub">Akses panel pengelolaan turnamen.</p>

        <form onSubmit={onSubmit}>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error ? <div className="error">{error}</div> : null}

          <button type="submit" disabled={loading}>{loading ? "Memproses..." : "Masuk"}</button>
        </form>
      </section>

      <style jsx>{`
        .admin-login { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f7f3f3; }
        .card { width: 100%; max-width: 430px; background: #fff; border: 1px solid #eadede; border-top: 6px solid #7a0000; border-radius: 12px; padding: 28px; box-shadow: 0 10px 30px rgba(34, 12, 12, 0.08); }
        .eyebrow { margin: 0 0 8px; color: #7a0000; font-size: 12px; letter-spacing: .14em; font-weight: 800; }
        h1 { margin: 0; color: #111827; font-size: 30px; }
        .sub { margin: 8px 0 20px; color: #6b7280; }
        form { display: grid; gap: 8px; }
        label { margin-top: 8px; font-size: 12px; font-weight: 700; color: #374151; }
        input { height: 44px; border: 1px solid #d8cfcf; border-radius: 8px; padding: 0 12px; outline: none; }
        input:focus { border-color: #7a0000; box-shadow: 0 0 0 3px rgba(122,0,0,.12); }
        .error { margin-top: 8px; padding: 10px 12px; border: 1px solid #fecdd3; background: #fff1f2; color: #b91c1c; border-radius: 8px; font-size: 13px; }
        button { margin-top: 14px; height: 44px; border: none; border-radius: 8px; background: #7a0000; color: #fff; font-weight: 800; cursor: pointer; }
        button:hover { background: #8e0000; }
        @media (max-width: 520px) {
          .admin-login { padding: 14px; }
          .card { border-radius: 10px; padding: 18px; }
          h1 { font-size: 26px; }
          .sub { font-size: 14px; margin-bottom: 16px; }
          input, button { height: 42px; }
        }
      `}</style>
    </main>
  );
}
