"use client";

import { useEffect, useState } from "react";

type Member = { id: string; name: string; email: string; imessage: string; source: string; interest: string; referralCount: number; position: number; createdAt: string; paid: boolean; paymentStatus: string | null };
type Summary = { total: number; fromWzrd: number; fromAir: number; paid: number };

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [query, setQuery] = useState("");
  const [source, setSource] = useState("all");

  async function refresh() {
    const [summaryResponse, membersResponse] = await Promise.all([fetch("/api/admin/summary", { cache: "no-store" }), fetch(`/api/admin/members?q=${encodeURIComponent(query)}&source=${source}`, { cache: "no-store" })]);
    if (summaryResponse.status === 401 || membersResponse.status === 401) { setAuthenticated(false); return; }
    const summaryJson = await summaryResponse.json(); const membersJson = await membersResponse.json();
    setSummary(summaryJson); setMembers(membersJson.members || []);
  }

  useEffect(() => { fetch("/api/admin/session", { cache: "no-store" }).then((response) => response.json()).then((result) => { setAuthenticated(Boolean(result.authenticated)); if (result.authenticated) void refresh(); }); }, []);

  async function login(event: React.FormEvent) { event.preventDefault(); setError(""); const response = await fetch("/api/admin/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password }) }); const result = await response.json(); if (!response.ok) { setError(result.message || "Could not sign in."); return; } setAuthenticated(true); setPassword(""); void refresh(); }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); setAuthenticated(false); setMembers([]); setSummary(null); }

  if (authenticated === null) return <main className="admin-shell"><p>Loading admin…</p></main>;
  if (!authenticated) return <main className="admin-shell"><form className="admin-login" onSubmit={login}><p className="admin-kicker">Air / private operations</p><h1>Waitlist admin</h1><label htmlFor="admin-password">Password</label><input id="admin-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /><button type="submit">Sign in</button>{error && <p role="alert">{error}</p>}</form></main>;
  return <main className="admin-shell"><header className="admin-header"><div><p className="admin-kicker">Air / private operations</p><h1>Waitlist</h1></div><div className="admin-actions"><a href={`/api/admin/export?q=${encodeURIComponent(query)}&source=${source}`}>Export CSV</a><button type="button" onClick={logout}>Sign out</button></div></header><section className="admin-summary" aria-label="Waitlist summary">{summary && <><p><strong>{summary.total}</strong><span>Total</span></p><p><strong>{summary.fromWzrd}</strong><span>From WZRD</span></p><p><strong>{summary.fromAir}</strong><span>From Air</span></p><p><strong>{summary.paid}</strong><span>Paid</span></p></>}</section><form className="admin-filters" onSubmit={(event) => { event.preventDefault(); void refresh(); }}><input aria-label="Search members" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or phone" /><select aria-label="Filter source" value={source} onChange={(event) => { setSource(event.target.value); setTimeout(() => void refresh(), 0); }}><option value="all">All sources</option><option value="wzrd">WZRD</option><option value="air">Air</option></select><button type="submit">Filter</button></form><div className="admin-table-wrap"><table><caption className="visually-hidden">Air waitlist members</caption><thead><tr><th>Place</th><th>Name</th><th>Contact</th><th>Source</th><th>Referrals</th><th>Payment</th><th>Joined</th></tr></thead><tbody>{members.map((member) => <tr key={member.id}><td>#{member.position}</td><td>{member.name}<small>{member.interest}</small></td><td>{member.email}<small>{member.imessage}</small></td><td>{member.source}</td><td>{member.referralCount}</td><td>{member.paid ? "Paid" : member.paymentStatus || "—"}</td><td>{new Date(member.createdAt).toLocaleDateString()}</td></tr>)}</tbody></table></div></main>;
}
