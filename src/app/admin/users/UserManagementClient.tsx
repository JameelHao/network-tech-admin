"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserManagementClient({ userId, email }: { userId: string; email: string }) {
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm(`Delete user ${email}?`)) return;
    setDeleting(true);
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId }),
    });
    if (res.ok) router.refresh();
    else alert("Delete failed");
    setDeleting(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-[11px] font-mono text-rose-500 hover:text-rose-700 transition-colors disabled:opacity-50"
    >
      {deleting ? "..." : "Delete"}
    </button>
  );
}

export function InviteUserForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setDone(false);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      setEmail("");
      setPassword("");
      setDone(true);
      setTimeout(() => setDone(false), 3000);
      router.refresh();
    } else {
      const err = await res.json();
      alert(err.error ?? "Create failed");
    }
    setSending(false);
  };

  return (
    <form onSubmit={handleInvite} className="flex items-center gap-2 flex-wrap">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="email@example.com"
        required
        className="px-2.5 py-1.5 rounded border border-line text-[12px] font-mono bg-paper text-ink-800 w-56"
      />
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          minLength={6}
          className="px-2.5 py-1.5 pr-7 rounded border border-line text-[12px] font-mono bg-paper text-ink-800 w-40"
        />
        <button type="button" onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-ink-400 hover:text-ink-600"
        >{showPassword ? "🙈" : "👁"}</button>
      </div>
      <button
        type="submit"
        disabled={sending || !email || password.length < 6}
        className="px-3 py-1.5 rounded text-[11px] font-mono bg-navy-500 text-white hover:bg-navy-700 transition-colors disabled:opacity-50"
      >
        {sending ? "..." : "Create User"}
      </button>
      {done && <span className="text-[11px] font-mono text-emerald-600">User created!</span>}
    </form>
  );
}
