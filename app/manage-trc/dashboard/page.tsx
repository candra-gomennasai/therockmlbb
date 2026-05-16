"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type MatchItem = {
  id: string;
  team1: string;
  team2: string;
  team1Logo?: string;
  team2Logo?: string;
  team1LogoScale?: number;
  team2LogoScale?: number;
  score1: number;
  score2: number;
  status: string;
  time: string;
  day?: number;
  date?: string;
  phase?: string;
  format?: string;
};

type StandingItem = {
  id: string;
  team: string;
  logo?: string;
  teamOrder?: number;
  logoScale?: number;
  group: string;
  played: number;
  won: number;
  lost: number;
  tb?: number;
  st?: number;
  points: number;
};

type TeamItem = {
  id: string;
  team: string;
  logo?: string;
  teamOrder?: number;
  logoScale?: number;
};

const DATES = [8, 9, 15, 16, 22, 23, 29, 30];
const FIXED_GROUPS = ["A", "B", "C", "D"];

export default function AdminDashboardPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"matches" | "teams" | "standings" | "final">("matches");
  const [dateFilter, setDateFilter] = useState(8);
  const [dragId, setDragId] = useState<string | null>(null);
  const [matches, setMatches] = useState<MatchItem[]>([]);
  const [standings, setStandings] = useState<StandingItem[]>([]);
  const [finals, setFinals] = useState<StandingItem[]>([]);
  const [teamsData, setTeamsData] = useState<TeamItem[]>([]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/manage-trc");
      else {
        setUserEmail(u.email || "");
        setLoading(false);
      }
    });
    return () => unsubAuth();
  }, [router]);

  const loadSingleCollection = async (collectionName: string) => {
    const single = await getDoc(doc(db, collectionName, "data"));
    if (single.exists()) {
      const payload = single.data() as { items?: any[] };
      if (Array.isArray(payload?.items)) return payload.items;
    }
    const snap = await getDocs(query(collection(db, collectionName)));
    return snap.docs
      .filter((d) => d.id !== "data")
      .map((d) => ({ id: d.id, ...d.data() }));
  };

  useEffect(() => {
    const load = async () => {
      const [m, s, t, f] = await Promise.all([
        loadSingleCollection("matches"),
        loadSingleCollection("standings"),
        loadSingleCollection("teams"),
        loadSingleCollection("finalMatches"),
      ]);
      setMatches(m as MatchItem[]);
      setStandings(s as StandingItem[]);
      setTeamsData(t as TeamItem[]);
      setFinals(f as StandingItem[]);
    };
    load();
  }, []);

  const filteredMatches = useMemo(() => {
    return matches
      .filter((m) => {
      if (typeof m.day === "number") return m.day === dateFilter;
      const parsed = parseInt(String(m.time || "").split(" ")[0], 10);
      return !Number.isNaN(parsed) ? parsed === dateFilter : true;
      })
      .sort((a: any, b: any) => (Number(a.order ?? 999999) - Number(b.order ?? 999999)));
  }, [matches, dateFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, StandingItem[]>();
    FIXED_GROUPS.forEach((g) => map.set(g, []));
    for (const s of standings) {
      const g = (s.group || "-").toUpperCase();
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(s);
    }
    return Array.from(map.entries()).sort((a, b) => {
      const ai = FIXED_GROUPS.indexOf(a[0]);
      const bi = FIXED_GROUPS.indexOf(b[0]);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a[0].localeCompare(b[0]);
    });
  }, [standings]);

  const sortedTeams = useMemo(() => {
    return [...teamsData].sort((a, b) => {
      const ao = Number(a.teamOrder ?? 999999);
      const bo = Number(b.teamOrder ?? 999999);
      if (ao !== bo) return ao - bo;
      return String(a.team || "").localeCompare(String(b.team || ""));
    });
  }, [teamsData]);

  const persistItems = async (col: "matches" | "standings" | "teams" | "finalMatches", items: any[]) => {
    await setDoc(doc(db, col, "data"), { updatedAt: Date.now(), items });
  };

  const updateField = async (
    col: "matches" | "standings" | "finalMatches" | "teams",
    id: string,
    key: string,
    value: unknown
  ) => {
    if (col === "matches") {
      const next = matches.map((x: any) => (x.id === id ? { ...x, [key]: value } : x));
      setMatches(next as MatchItem[]);
      await persistItems("matches", next);
      return;
    }
    if (col === "standings") {
      const next = standings.map((x: any) => (x.id === id ? { ...x, [key]: value } : x));
      setStandings(next as StandingItem[]);
      await persistItems("standings", next);
      return;
    }
    if (col === "teams") {
      const next = teamsData.map((x: any) => (x.id === id ? { ...x, [key]: value } : x));
      setTeamsData(next as TeamItem[]);
      await persistItems("teams", next);
      return;
    }
    const next = finals.map((x: any) => (x.id === id ? { ...x, [key]: value } : x));
    setFinals(next as StandingItem[]);
    await persistItems("finalMatches", next);
  };

  const ensureFiveTeamsPerGroup = async () => {
    let next = [...standings];
    for (const group of FIXED_GROUPS) {
      const count = next.filter((s) => String(s.group || "").toUpperCase() === group).length;
      const missing = Math.max(0, 5 - count);
      for (let i = 0; i < missing; i++) {
        next.push({
          id: `s-${Date.now()}-${group}-${i}`,
          team: `TIM ${group}${count + i + 1}`,
          logo: "",
          teamOrder: next.length + i,
          group,
          played: 0,
          won: 0,
          lost: 0,
          tb: 0,
          st: 0,
          points: 0,
        });
      }
    }
    setStandings(next);
    await persistItems("standings", next);
  };

  const normalizeGroupsToFiveEach = async () => {
    const pool = [...standings].sort((a, b) => {
      const ao = Number(a.teamOrder ?? 999999);
      const bo = Number(b.teamOrder ?? 999999);
      if (ao !== bo) return ao - bo;
      return String(a.team || "").localeCompare(String(b.team || ""));
    });

    const targets = ["A", "B", "C", "D"];
    const needed = 20;

    // Ensure at least 20 rows exist so each group can have 5.
    if (pool.length < needed) {
      for (let i = pool.length; i < needed; i++) {
        pool.push({
          id: `s-${Date.now()}-${i}`,
          team: `TIM ${i + 1}`,
          logo: "",
          teamOrder: i,
          logoScale: 1,
          group: "A",
          played: 0,
          won: 0,
          lost: 0,
          tb: 0,
          st: 0,
          points: 0,
        });
      }
      setStandings(pool as StandingItem[]);
      await persistItems("standings", pool);
      return;
    }
    const next = pool.map((s: any, idx: number) => {
      if (idx < needed) {
        return { ...s, group: targets[Math.floor(idx / 5)], teamOrder: idx };
      }
      return { ...s, group: "D", teamOrder: idx };
    });
    setStandings(next as StandingItem[]);
    await persistItems("standings", next);
  };


  const addMatch = async () => {
    const dayItems = filteredMatches.length;
    const next = [
      ...matches,
      {
      id: `m-${Date.now()}`,
      team1: "TEAM A",
      team2: "TEAM B",
      team1Logo: "",
      team2Logo: "",
      team1LogoScale: 1,
      team2LogoScale: 1,
      score1: 0,
      score2: 0,
      status: "UPCOMING",
      time: "13:00",
      day: dateFilter,
      order: dayItems,
      date: "ROUND 1",
      phase: "GROUP STAGE",
      format: "BO1",
    }];
    setMatches(next as MatchItem[]);
    await persistItems("matches", next);
  };

  const deleteMatch = async (id: string) => {
    const next = matches.filter((m) => m.id !== id);
    setMatches(next);
    await persistItems("matches", next);
  };

  const addTeam = async () => {
    const next = [
      ...teamsData,
      { id: `t-${Date.now()}`, team: "TIM BARU", logo: "", teamOrder: teamsData.length, logoScale: 1 },
    ];
    setTeamsData(next);
    await persistItems("teams", next);
  };

  const deleteTeam = async (id: string) => {
    const next = teamsData.filter((t) => t.id !== id);
    setTeamsData(next);
    await persistItems("teams", next);
  };

  const addFinal = async () => {
    const next = [
      ...finals,
      { id: `f-${Date.now()}`, team: "TIM FINAL", logo: "", played: 0, won: 0, lost: 0, tb: 0, st: 0, points: 0, group: "-" },
    ];
    setFinals(next as StandingItem[]);
    await persistItems("finalMatches", next);
  };

  const deleteFinal = async (id: string) => {
    const next = finals.filter((t) => t.id !== id);
    setFinals(next);
    await persistItems("finalMatches", next);
  };

  const onDropMatch = async (targetId: string) => {
    if (!dragId || dragId === targetId) return;

    const dayItems = matches.filter((m: any) => Number(m.day) === dateFilter);
    const from = dayItems.findIndex((m: any) => m.id === dragId);
    const to = dayItems.findIndex((m: any) => m.id === targetId);
    if (from < 0 || to < 0) return;

    const items = [...dayItems];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);

    const reorderedDay = items.map((m: any, idx: number) => ({ ...m, order: idx, day: dateFilter }));
    const untouched = matches.filter((m: any) => Number(m.day) !== dateFilter);
    const next = [...untouched, ...reorderedDay];
    setMatches(next as MatchItem[]);
    await persistItems("matches", next);
    setDragId(null);
  };

  if (loading) return <main style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>Loading...</main>;

  return (
    <main className="dash">
      <aside className="side">
        <h1>TRC ADMIN</h1>
        <div className="side-nav">
          <button className={tab === "matches" ? "active" : ""} onClick={() => setTab("matches")}>Pertandingan</button>
          <button className={tab === "teams" ? "active" : ""} onClick={() => setTab("teams")}>Atur Tim</button>
          <button className={tab === "standings" ? "active" : ""} onClick={() => setTab("standings")}>Klasemen Grup</button>
          <button className={tab === "final" ? "active" : ""} onClick={() => setTab("final")}>Klasemen Final</button>
        </div>
        <div className="spacer" />
        <p>{userEmail}</p>
        <button className="logout" onClick={() => signOut(auth)}>Logout</button>
      </aside>

      <section className="content">
        <div className="wrap">
          {tab === "matches" && (
            <>
              <div className="topbar">
                <h2>PERTANDINGAN</h2>
                <button className="primary" onClick={addMatch}>+ Tambah Match</button>
              </div>

              <div className="dates">
                {DATES.map((d) => (
                  <button key={d} className={d === dateFilter ? "active" : ""} onClick={() => setDateFilter(d)}>{d} Mei</button>
                ))}
              </div>

              <div className="list">
                {filteredMatches.map((m) => (
                  <article
                    key={m.id}
                    className={`card ${dragId === m.id ? "dragging" : ""}`}
                    draggable
                    onDragStart={() => setDragId(m.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDropMatch(m.id)}
                    onDragEnd={() => setDragId(null)}
                  >
                    <div className="row meta">
                      <input placeholder="FASE (contoh: GROUP STAGE)" value={m.phase || ""} onChange={(e) => updateField("matches", m.id, "phase", e.target.value)} />
                      <input placeholder="ROUND (contoh: ROUND 1)" value={m.date || ""} onChange={(e) => updateField("matches", m.id, "date", e.target.value)} />
                      <input placeholder="JAM WIB (contoh: 13:00)" value={m.time || ""} onChange={(e) => updateField("matches", m.id, "time", e.target.value)} />
                      <select value={m.status || "UPCOMING"} onChange={(e) => updateField("matches", m.id, "status", e.target.value)}>
                        <option value="UPCOMING">UPCOMING</option>
                        <option value="FINISHED">FINISHED</option>
                      </select>
                      <button className="danger" onClick={() => deleteMatch(m.id)}>Hapus</button>
                    </div>
                    <div className="row teams">
                      <input value={m.team1} onChange={(e) => updateField("matches", m.id, "team1", e.target.value)} />
                      <input value={m.team1Logo || ""} onChange={(e) => updateField("matches", m.id, "team1Logo", e.target.value)} placeholder="Logo A URL" />
                      <input type="number" step="0.01" value={m.team1LogoScale ?? 1} onChange={(e) => updateField("matches", m.id, "team1LogoScale", Number(e.target.value))} placeholder="Scale A" />
                      <input type="number" value={m.score1 ?? 0} onChange={(e) => updateField("matches", m.id, "score1", Number(e.target.value))} />
                      <span className="vs">VS</span>
                      <input type="number" value={m.score2 ?? 0} onChange={(e) => updateField("matches", m.id, "score2", Number(e.target.value))} />
                      <input type="number" step="0.01" value={m.team2LogoScale ?? 1} onChange={(e) => updateField("matches", m.id, "team2LogoScale", Number(e.target.value))} placeholder="Scale B" />
                      <input value={m.team2Logo || ""} onChange={(e) => updateField("matches", m.id, "team2Logo", e.target.value)} placeholder="Logo B URL" />
                      <input value={m.team2} onChange={(e) => updateField("matches", m.id, "team2", e.target.value)} />
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          {tab === "teams" && (
            <div className="list">
              <div className="topbar">
                <h2>ATUR TIM</h2>
                <button className="primary" onClick={addTeam}>+ Tambah Tim</button>
              </div>

              <article className="card">
                <div className="thead row teamcfg-head">
                  <span>Nama Tim</span><span>Logo URL</span><span>Urutan</span><span>Scale</span><span>Aksi</span>
                </div>
                {sortedTeams.map((s) => (
                  <div className="row teamcfg" key={s.id}>
                    <input value={s.team} onChange={(e) => updateField("teams", s.id, "team", e.target.value)} />
                    <input value={s.logo || ""} onChange={(e) => updateField("teams", s.id, "logo", e.target.value)} placeholder="https://..." />
                    <input type="number" value={s.teamOrder ?? 0} onChange={(e) => updateField("teams", s.id, "teamOrder", Number(e.target.value))} />
                    <input type="number" step="0.01" value={s.logoScale ?? 1} onChange={(e) => updateField("teams", s.id, "logoScale", Number(e.target.value))} />
                    <button className="danger" onClick={() => deleteTeam(s.id)}>Hapus</button>
                  </div>
                ))}
              </article>
            </div>
          )}

          {tab === "standings" && (
            <div className="list">
              <div className="topbar">
                <h2>KLASEMEN GRUP</h2>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="primary" onClick={ensureFiveTeamsPerGroup}>Lengkapi 5 Tim/Grup</button>
                  <button className="primary" onClick={normalizeGroupsToFiveEach}>Normalisasi Grup A-D</button>
                </div>
              </div>

              {grouped.map(([group, rows]) => (
                <article key={group} className="card">
                  <h3>GRUP {group}</h3>
                  <p className="group-note">5 slot tim siap diisi manual.</p>
                  <div className="thead row standing-head">
                    <span>Tim</span><span>MP</span><span>W</span><span>L</span><span>PTS</span>
                  </div>
                  {rows.slice(0, 5).map((s) => (
                    <div className="row standing" key={s.id}>
                      <input value={s.team} onChange={(e) => updateField("standings", s.id, "team", e.target.value)} />
                      <input type="number" value={s.played ?? 0} onChange={(e) => updateField("standings", s.id, "played", Number(e.target.value))} />
                      <input type="number" value={s.won ?? 0} onChange={(e) => updateField("standings", s.id, "won", Number(e.target.value))} />
                      <input type="number" value={s.lost ?? 0} onChange={(e) => updateField("standings", s.id, "lost", Number(e.target.value))} />
                      <input type="number" value={s.points ?? 0} onChange={(e) => updateField("standings", s.id, "points", Number(e.target.value))} />
                    </div>
                  ))}
                </article>
              ))}
            </div>
          )}

          {tab === "final" && (
            <div className="list">
              <div className="topbar">
                <h2>KLASEMEN FINAL</h2>
                <button className="primary" onClick={addFinal}>+ Tambah Tim Final</button>
              </div>
              <article className="card">
                <div className="thead row final-head">
                  <span>Tim</span><span>Logo URL</span><span>MP</span><span>W</span><span>L</span><span>PTS</span><span>Aksi</span>
                </div>
                {finals.map((s) => (
                  <div className="row final" key={s.id}>
                    <input value={s.team} onChange={(e) => updateField("finalMatches", s.id, "team", e.target.value)} />
                    <input value={s.logo || ""} onChange={(e) => updateField("finalMatches", s.id, "logo", e.target.value)} placeholder="https://..." />
                    <input type="number" value={s.played ?? 0} onChange={(e) => updateField("finalMatches", s.id, "played", Number(e.target.value))} />
                    <input type="number" value={s.won ?? 0} onChange={(e) => updateField("finalMatches", s.id, "won", Number(e.target.value))} />
                    <input type="number" value={s.lost ?? 0} onChange={(e) => updateField("finalMatches", s.id, "lost", Number(e.target.value))} />
                    <input type="number" value={s.points ?? 0} onChange={(e) => updateField("finalMatches", s.id, "points", Number(e.target.value))} />
                    <button className="danger" onClick={() => deleteFinal(s.id)}>Hapus</button>
                  </div>
                ))}
              </article>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .dash { min-height: 100vh; display: grid; grid-template-columns: 250px 1fr; background: #f7f3f3; color: #111827; }
        .side { background: #fff; border-right: 1px solid #eadede; padding: 20px 14px; display: flex; flex-direction: column; gap: 10px; }
        .side h1 { margin: 0 0 6px; font-size: 22px; color: #7a0000; letter-spacing: .05em; }
        .side-nav { display: grid; gap: 8px; }
        .side button { height: 40px; border-radius: 8px; border: 1px solid #e6d9d9; background: #fff; text-align: left; padding: 0 12px; font-weight: 700; cursor: pointer; }
        .side button.active { background: #7a0000; color: #fff; border-color: #7a0000; }
        .side .spacer { flex: 1; }
        .side p { margin: 8px 0 0; font-size: 12px; color: #6b7280; word-break: break-all; }
        .side .logout { border-color: #fecaca; color: #991b1b; }

        .content { padding: 20px; overflow-x: hidden; }
        .wrap { max-width: 1180px; }
        .topbar { display: flex; justify-content: space-between; align-items: center; gap: 10px; margin-bottom: 12px; flex-wrap: wrap; }
        h2 { margin: 0; color: #111827; letter-spacing: .02em; }
        .dates { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px; }
        .dates button { height: 36px; padding: 0 12px; border-radius: 8px; border: 1px solid #e6d9d9; background: #fff; font-weight: 700; cursor: pointer; }
        .dates button.active { background: #7a0000; color: #fff; border-color: #7a0000; }
        .primary { height: 36px; border: none; border-radius: 8px; background: #7a0000; color: #fff; padding: 0 14px; font-weight: 800; cursor: pointer; }

        .list { display: grid; gap: 12px; }
        .card { width: 100%; background: #fff; border: 1px solid #eadede; border-radius: 10px; padding: 12px; cursor: grab; }
        .card.dragging { opacity: 0.45; transform: scale(0.99); }
        .card h3 { margin: 0 0 8px; color: #7a0000; }
        .group-note { margin: 0 0 8px; font-size: 12px; color: #64748b; }

        .row { display: grid; gap: 8px; margin-top: 8px; align-items: center; }
        .meta { grid-template-columns: 1.2fr 1fr .8fr 1fr .8fr; }
        .teams { grid-template-columns: 1.1fr 1.4fr .65fr .45fr .3fr .45fr .65fr 1.4fr 1.1fr; }
        .teamcfg, .teamcfg-head { grid-template-columns: 1.2fr 2fr .6fr .6fr .8fr; }
        .standing, .standing-head { grid-template-columns: 1.6fr .7fr .7fr .7fr .7fr; }
        .final, .final-head { grid-template-columns: 1.2fr 1.8fr .6fr .6fr .6fr .6fr .8fr; }

        .thead { font-size: 12px; color: #7a0000; font-weight: 800; margin-top: 0; }
        .row input, .row select { width: 100%; height: 36px; border: 1px solid #ddcfcf; border-radius: 7px; padding: 0 10px; }
        .vs { text-align: center; font-weight: 800; color: #7a0000; }
        .danger { height: 36px; border: 1px solid #fecaca; background: #fff1f2; color: #991b1b; border-radius: 7px; font-weight: 700; cursor: pointer; }

        @media (max-width: 980px) {
          .dash { grid-template-columns: 1fr; }
          .side { border-right: 0; border-bottom: 1px solid #eadede; padding: 12px; }
          .side h1 { font-size: 18px; }
          .side-nav { display: flex; overflow-x: auto; }
          .side-nav button { min-width: 150px; text-align: center; }
          .side .spacer { display: none; }
          .content { padding: 12px; }
        }

        @media (max-width: 760px) {
          .dates { flex-wrap: nowrap; overflow-x: auto; }
          .dates button { min-width: 84px; white-space: nowrap; }
          .topbar { align-items: stretch; }
          .primary { width: 100%; }
          .meta { grid-template-columns: 1fr 1fr; }
          .teams { grid-template-columns: 1fr 1fr; }
          .teams .vs { grid-column: 1 / -1; }
          .standing, .standing-head { grid-template-columns: 1fr 1fr; }
          .final, .final-head { grid-template-columns: 1fr 1fr; }
          .danger { width: 100%; }
        }
      `}</style>
    </main>
  );
}
