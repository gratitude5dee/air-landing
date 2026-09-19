"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import styles from "./AdminDashboard.module.css";

type Entry = {
  id: string;
  name: string;
  email: string;
  imessage: string;
  consent: boolean;
  source: string;
  referralCount: number;
  position: number;
  createdAt: string;
};

const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export function AdminDashboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [password, setPassword] = useState("");
  const [query, setQuery] = useState("");
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/waitlist", { cache: "no-store" });
    if (response.status === 401) {
      setAuthenticated(false);
      setLoading(false);
      return;
    }
    if (!response.ok) {
      setError("Could not load the waitlist. Check the database connection and try again.");
      setLoading(false);
      return;
    }
    const data = (await response.json()) as { entries: Entry[] };
    setEntries(data.entries);
    setAuthenticated(true);
    setLoading(false);
  }, []);

  useEffect(() => { void loadEntries(); }, [loadEntries]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      setError("That password did not work.");
      setLoading(false);
      return;
    }
    setPassword("");
    await loadEntries();
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setEntries([]);
    setAuthenticated(false);
  }

  const filteredEntries = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return entries;
    return entries.filter((entry) =>
      [entry.name, entry.email, entry.imessage, entry.source].some((value) => value.toLowerCase().includes(needle)),
    );
  }, [entries, query]);

  if (authenticated !== true) {
    return (
      <main className={styles.shell}>
        <section className={styles.loginCard} aria-labelledby="admin-title">
          <div className={styles.eyebrow}>AIR / PRIVATE CONTROL ROOM</div>
          <h1 id="admin-title">Waitlist admin</h1>
          <p>Review signups and prepare the next wave of onboarding.</p>
          <form onSubmit={handleLogin} className={styles.loginForm}>
            <label htmlFor="admin-password">Admin password</label>
            <input id="admin-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
            <button type="submit" disabled={loading}>{loading ? "Unlocking…" : "Unlock dashboard"}</button>
          </form>
          {error && <p className={styles.error} role="alert">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div><div className={styles.eyebrow}>AIR / PRIVATE CONTROL ROOM</div><h1>Waitlist</h1></div>
        <div className={styles.actions}><button className={styles.ghostButton} onClick={() => void loadEntries()} disabled={loading}>↻ Refresh</button><button className={styles.ghostButton} onClick={() => void logout()}>Lock</button></div>
      </header>
      <section className={styles.stats}><div><span>Total signups</span><strong>{entries.length}</strong></div><div><span>Showing</span><strong>{filteredEntries.length}</strong></div><div><span>Onboarding email</span><strong className={styles.muted}>Later</strong></div></section>
      <div className={styles.toolbar}><input aria-label="Search signups" placeholder="Search name, email, phone, source" value={query} onChange={(event) => setQuery(event.target.value)} /><span>{loading ? "Syncing…" : "Live database view"}</span></div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <section className={styles.list} aria-label="Waitlist signups">
        {filteredEntries.map((entry) => (
          <article className={styles.row} key={entry.id}>
            <div className={styles.identity}><span className={styles.position}>#{entry.position}</span><div><h2>{entry.name}</h2><p>{entry.email}</p></div></div>
            <div className={styles.detail}><span>iMessage</span><strong>{entry.imessage}</strong></div>
            <div className={styles.detail}><span>Joined</span><strong>{dateFormatter.format(new Date(entry.createdAt))}</strong></div>
            <div className={styles.detail}><span>Referrals</span><strong>{entry.referralCount}</strong></div>
            <div className={styles.followUp}><span className={styles.source}>{entry.source}</span><button disabled title="WZRDmail follow-up will be added later">Follow up later</button></div>
          </article>
        ))}
        {!filteredEntries.length && <div className={styles.empty}>{entries.length ? "No signups match that search." : "No signups yet."}</div>}
      </section>
    </main>
  );
}
