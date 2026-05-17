"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { 
  Trophy, 
  Users, 
  Calendar, 
  LogOut, 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  Shield, 
  AlertCircle, 
  Award,
  Image as ImageIcon
} from "lucide-react";

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
  order?: number;
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

const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
const getNow = () => Date.now();
const parseScaleInput = (raw: string) => {
  const normalized = String(raw || "").replace(",", ".").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
};

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
  const [finalBracketImageUrl, setFinalBracketImageUrl] = useState("");
  const [championImageUrl, setChampionImageUrl] = useState("");
  const [scaleDrafts, setScaleDrafts] = useState<Record<string, string>>({});
  const matchesRef = useRef<MatchItem[]>([]);
  const standingsRef = useRef<StandingItem[]>([]);
  const teamsRef = useRef<TeamItem[]>([]);
  const finalsRef = useRef<StandingItem[]>([]);
  const persistTimersRef = useRef<Partial<Record<"matches" | "standings" | "teams" | "finalMatches", ReturnType<typeof setTimeout>>>>({});

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
      const payload = single.data() as { items?: Record<string, unknown>[] };
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

      const fmDoc = await getDoc(doc(db, "finalMatches", "data"));
      if (fmDoc.exists()) {
        const rawData = fmDoc.data() as Record<string, unknown>;
        const raw = String(rawData?.bracketImageUrl || "").trim();
        setFinalBracketImageUrl(raw);
        const championRaw = String(rawData?.championImageUrl || "").trim();
        setChampionImageUrl(championRaw);
      }
    };
    load();
  }, []);

  useEffect(() => { matchesRef.current = matches; }, [matches]);
  useEffect(() => { standingsRef.current = standings; }, [standings]);
  useEffect(() => { teamsRef.current = teamsData; }, [teamsData]);
  useEffect(() => { finalsRef.current = finals; }, [finals]);
  useEffect(() => {
    return () => {
      Object.values(persistTimersRef.current).forEach((t) => {
        if (t) clearTimeout(t);
      });
    };
  }, []);

  const filteredMatches = useMemo(() => {
    return matches
      .filter((m) => {
        if (typeof m.day === "number") return m.day === dateFilter;
        const parsed = parseInt(String(m.time || "").split(" ")[0], 10);
        return !Number.isNaN(parsed) ? parsed === dateFilter : true;
      })
      .sort((a: MatchItem, b: MatchItem) => (Number(a.order ?? 9999) - Number(b.order ?? 9999)));
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

  const persistItems = async (col: "matches" | "standings" | "teams" | "finalMatches", items: Record<string, unknown>[]) => {
    await setDoc(doc(db, col, "data"), { updatedAt: getNow(), items });
  };
  const schedulePersist = (col: "matches" | "standings" | "teams" | "finalMatches", items: Record<string, unknown>[]) => {
    const prev = persistTimersRef.current[col];
    if (prev) clearTimeout(prev);
    persistTimersRef.current[col] = setTimeout(() => {
      void persistItems(col, items);
    }, 250);
  };

  const saveFinalBracketImageUrl = async () => {
    await setDoc(
      doc(db, "finalMatches", "data"),
      { updatedAt: getNow(), bracketImageUrl: String(finalBracketImageUrl || "").trim() },
      { merge: true }
    );
  };
  const saveChampionImageUrl = async () => {
    await setDoc(
      doc(db, "finalMatches", "data"),
      { updatedAt: getNow(), championImageUrl: String(championImageUrl || "").trim() },
      { merge: true }
    );
  };

  const updateField = async (
    col: "matches" | "standings" | "finalMatches" | "teams",
    id: string,
    key: string,
    value: unknown
  ) => {
    if (col === "matches") {
      const next = matchesRef.current.map((x: MatchItem) => (x.id === id ? { ...x, [key]: value } : x));
      matchesRef.current = next as MatchItem[];
      setMatches(next as MatchItem[]);
      schedulePersist("matches", next);
      return;
    }
    if (col === "standings") {
      const next = standingsRef.current.map((x: StandingItem) => (x.id === id ? { ...x, [key]: value } : x));
      standingsRef.current = next as StandingItem[];
      setStandings(next as StandingItem[]);
      schedulePersist("standings", next);
      return;
    }
    if (col === "teams") {
      const next = teamsRef.current.map((x: TeamItem) => (x.id === id ? { ...x, [key]: value } : x));
      teamsRef.current = next as TeamItem[];
      setTeamsData(next as TeamItem[]);
      schedulePersist("teams", next);
      return;
    }
    const next = finalsRef.current.map((x: StandingItem) => (x.id === id ? { ...x, [key]: value } : x));
    finalsRef.current = next as StandingItem[];
    setFinals(next as StandingItem[]);
    schedulePersist("finalMatches", next);
  };

  const setScaleDraft = (key: string, value: string) => {
    setScaleDrafts((prev) => ({ ...prev, [key]: value }));
  };

  const commitScaleDraft = async (
    draftKey: string,
    col: "matches" | "teams",
    id: string,
    field: "team1LogoScale" | "team2LogoScale" | "logoScale",
    fallback: number
  ) => {
    const raw = scaleDrafts[draftKey];
    const parsed = parseScaleInput(raw);
    const nextValue = parsed ?? fallback;
    await updateField(col, id, field, nextValue);
    setScaleDrafts((prev) => {
      const next = { ...prev };
      delete next[draftKey];
      return next;
    });
  };


  const addMatch = async () => {
    const dayItems = matchesRef.current.filter((m) => Number(m.day) === dateFilter).length;
    const next = [
      ...matchesRef.current,
      {
        id: generateId("m"),
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
      },
    ];
    matchesRef.current = next as MatchItem[];
    setMatches(next as MatchItem[]);
    await persistItems("matches", next);
  };

  const deleteMatch = async (id: string) => {
    const next = matchesRef.current.filter((m) => m.id !== id);
    matchesRef.current = next;
    setMatches(next);
    await persistItems("matches", next);
  };

  const addTeam = async () => {
    const next = [
      ...teamsData,
      { id: generateId("t"), team: "TIM BARU", logo: "", teamOrder: teamsData.length, logoScale: 1 },
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
      { id: generateId("f"), team: "TIM FINAL", logo: "", played: 0, won: 0, lost: 0, tb: 0, st: 0, points: 0, group: "-" },
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

    const dayItems = matchesRef.current.filter((m: MatchItem) => Number(m.day) === dateFilter);
    const from = dayItems.findIndex((m: MatchItem) => m.id === dragId);
    const to = dayItems.findIndex((m: MatchItem) => m.id === targetId);
    if (from < 0 || to < 0) return;

    const items = [...dayItems];
    const [moved] = items.splice(from, 1);
    items.splice(to, 0, moved);

    const reorderedDay = items.map((m: MatchItem, idx: number) => ({ ...m, order: idx, day: dateFilter }));
    const untouched = matchesRef.current.filter((m: MatchItem) => Number(m.day) !== dateFilter);
    const next = [...untouched, ...reorderedDay];
    matchesRef.current = next as MatchItem[];
    setMatches(next as MatchItem[]);
    await persistItems("matches", next);
    setDragId(null);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-black border-t-[#7a0000] rounded-full animate-spin shadow-[4px_4px_0px_#000]" />
          <p className="font-black tracking-widest text-lg uppercase text-black">MEMUAT SISTEM...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-layout">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <div className="brand-badge">TRC</div>
          <h1>ADMIN PANEL</h1>
        </div>

        <nav className="sidebar-nav">
          <button 
            className={`nav-btn ${tab === "matches" ? "active" : ""}`} 
            onClick={() => setTab("matches")}
          >
            <Calendar className="w-5 h-5" />
            <span>Pertandingan</span>
          </button>
          
          <button 
            className={`nav-btn ${tab === "teams" ? "active" : ""}`} 
            onClick={() => setTab("teams")}
          >
            <Users className="w-5 h-5" />
            <span>Atur Tim</span>
          </button>

          <button 
            className={`nav-btn ${tab === "standings" ? "active" : ""}`} 
            onClick={() => setTab("standings")}
          >
            <Shield className="w-5 h-5" />
            <span>Klasemen Grup</span>
          </button>

          <button 
            className={`nav-btn ${tab === "final" ? "active" : ""}`} 
            onClick={() => setTab("final")}
          >
            <Trophy className="w-5 h-5" />
            <span>Final Stage</span>
          </button>
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-footer">
          <div className="user-info">
            <span className="user-label">Logged in as:</span>
            <p className="user-email">{userEmail}</p>
          </div>
          <button className="logout-btn" onClick={() => signOut(auth)}>
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section className="admin-content">
        <div className="content-container">
          {/* MATCHES TAB */}
          {tab === "matches" && (
            <div className="tab-section">
              <div className="topbar sticky-topbar">
                <div className="topbar-left">
                  <Calendar className="w-8 h-8 text-[#7a0000]" />
                  <h2>JADWAL PERTANDINGAN</h2>
                </div>
                <button className="btn-brutal btn-primary" onClick={addMatch}>
                  <Plus className="w-5 h-5" />
                  <span>Tambah Match</span>
                </button>
              </div>

              <div className="dates-filter">
                {DATES.map((d) => (
                  <button 
                    key={d} 
                    className={`date-tab ${d === dateFilter ? "active" : ""}`} 
                    onClick={() => setDateFilter(d)}
                  >
                    <span>{d} Mei</span>
                  </button>
                ))}
              </div>

              <div className="matches-grid">
                {filteredMatches.length === 0 ? (
                  <div className="empty-state">
                    <AlertCircle className="w-12 h-12 text-gray-400 mb-2" />
                    <p>Belum ada pertandingan di tanggal ini.</p>
                  </div>
                ) : (
                  filteredMatches.map((m) => (
                    <article
                      key={m.id}
                      className={`match-card ${dragId === m.id ? "dragging" : ""}`}
                      draggable
                      onDragStart={() => setDragId(m.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDropMatch(m.id)}
                      onDragEnd={() => setDragId(null)}
                    >
                      {/* Match Header / Meta */}
                      <div className="match-meta">
                        <div className="meta-left">
                          <div className="drag-handle" title="Drag & Drop untuk reorder">
                            <GripVertical className="w-5 h-5 text-gray-500" />
                          </div>
                          <div className="input-group">
                            <label>FASE</label>
                            <input 
                              placeholder="FASE (cth: GROUP STAGE)" 
                              value={m.phase || ""} 
                              onChange={(e) => updateField("matches", m.id, "phase", e.target.value)} 
                            />
                          </div>
                          <div className="input-group">
                            <label>ROUND</label>
                            <input 
                              placeholder="ROUND (cth: ROUND 1)" 
                              value={m.date || ""} 
                              onChange={(e) => updateField("matches", m.id, "date", e.target.value)} 
                            />
                          </div>
                          <div className="input-group">
                            <label>JAM WIB</label>
                            <input 
                              className="time-input"
                              placeholder="JAM (cth: 13:00)" 
                              value={m.time || ""} 
                              onChange={(e) => updateField("matches", m.id, "time", e.target.value)} 
                            />
                          </div>
                          <div className="input-group">
                            <label>FORMAT</label>
                            <input
                              className="format-input"
                              placeholder="BO1 / BO3 / BO5"
                              value={m.format || "BO1"}
                              onChange={(e) => updateField("matches", m.id, "format", e.target.value.toUpperCase())}
                            />
                          </div>
                        </div>

                        <div className="meta-right">
                          <div className="input-group">
                            <label>STATUS</label>
                            <select 
                              className={`status-select ${m.status === "FINISHED" ? "finished" : "upcoming"}`}
                              value={m.status || "UPCOMING"} 
                              onChange={(e) => updateField("matches", m.id, "status", e.target.value)}
                            >
                              <option value="UPCOMING">UPCOMING</option>
                              <option value="FINISHED">FINISHED</option>
                            </select>
                          </div>
                          <button 
                            className="btn-brutal btn-danger btn-icon" 
                            title="Hapus Match"
                            onClick={() => deleteMatch(m.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Match Teams & Scores */}
                      <div className="match-body">
                        {/* Team 1 */}
                        <div className="team-box">
                          <div className="team-header">
                            <span className="team-badge">TIM 1</span>
                          </div>
                          <input 
                            className="team-name-input"
                            placeholder="Nama Tim 1"
                            value={m.team1} 
                            onChange={(e) => updateField("matches", m.id, "team1", e.target.value)} 
                          />
                          <div className="logo-config">
                            <div className="input-group flex-1">
                              <label>LOGO URL</label>
                              <div className="input-with-icon">
                                <ImageIcon className="w-4 h-4 text-gray-400" />
                                <input 
                                  placeholder="https://..." 
                                  value={m.team1Logo || ""} 
                                  onChange={(e) => updateField("matches", m.id, "team1Logo", e.target.value)} 
                                />
                              </div>
                            </div>
                            <div className="input-group w-24">
                              <label>SCALE</label>
                              <input
                                className="scale-input"
                                type="text"
                                inputMode="decimal"
                                value={scaleDrafts[`m1-${m.id}`] ?? String(m.team1LogoScale ?? 1)}
                                onFocus={(e) => e.currentTarget.select()}
                                onChange={(e) => setScaleDraft(`m1-${m.id}`, e.target.value)}
                                onBlur={() => commitScaleDraft(`m1-${m.id}`, "matches", m.id, "team1LogoScale", Number(m.team1LogoScale ?? 1))}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.currentTarget as HTMLInputElement).blur();
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Center Score & VS */}
                        <div className="score-box">
                          <div className="score-input-wrapper">
                            <label>SCORE 1</label>
                            <input 
                              type="number" 
                              className="score-val"
                              value={m.score1 ?? 0} 
                              onChange={(e) => updateField("matches", m.id, "score1", Number(e.target.value))} 
                            />
                          </div>
                          <div className="vs-badge">VS</div>
                          <div className="score-input-wrapper">
                            <label>SCORE 2</label>
                            <input 
                              type="number" 
                              className="score-val"
                              value={m.score2 ?? 0} 
                              onChange={(e) => updateField("matches", m.id, "score2", Number(e.target.value))} 
                            />
                          </div>
                        </div>

                        {/* Team 2 */}
                        <div className="team-box">
                          <div className="team-header">
                            <span className="team-badge">TIM 2</span>
                          </div>
                          <input 
                            className="team-name-input"
                            placeholder="Nama Tim 2"
                            value={m.team2} 
                            onChange={(e) => updateField("matches", m.id, "team2", e.target.value)} 
                          />
                          <div className="logo-config">
                            <div className="input-group flex-1">
                              <label>LOGO URL</label>
                              <div className="input-with-icon">
                                <ImageIcon className="w-4 h-4 text-gray-400" />
                                <input 
                                  placeholder="https://..." 
                                  value={m.team2Logo || ""} 
                                  onChange={(e) => updateField("matches", m.id, "team2Logo", e.target.value)} 
                                />
                              </div>
                            </div>
                            <div className="input-group w-24">
                              <label>SCALE</label>
                              <input
                                className="scale-input"
                                type="text"
                                inputMode="decimal"
                                value={scaleDrafts[`m2-${m.id}`] ?? String(m.team2LogoScale ?? 1)}
                                onFocus={(e) => e.currentTarget.select()}
                                onChange={(e) => setScaleDraft(`m2-${m.id}`, e.target.value)}
                                onBlur={() => commitScaleDraft(`m2-${m.id}`, "matches", m.id, "team2LogoScale", Number(m.team2LogoScale ?? 1))}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    (e.currentTarget as HTMLInputElement).blur();
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TEAMS TAB */}
          {tab === "teams" && (
            <div className="tab-section">
              <div className="topbar">
                <div className="topbar-left">
                  <Users className="w-8 h-8 text-[#7a0000]" />
                  <h2>ATUR TIM TOURNAMENT</h2>
                </div>
                <button className="btn-brutal btn-primary" onClick={addTeam}>
                  <Plus className="w-5 h-5" />
                  <span>Tambah Tim</span>
                </button>
              </div>

              <div className="brutal-table-card">
                <div className="table-header-grid team-grid">
                  <span>Nama Tim</span>
                  <span>Logo URL</span>
                  <span>Urutan</span>
                  <span>Scale</span>
                  <span>Aksi</span>
                </div>
                <div className="table-rows">
                  {sortedTeams.map((s) => (
                    <div className="table-row-grid team-grid" key={s.id}>
                      <div className="input-wrap">
                        <input 
                          placeholder="Nama Tim" 
                          value={s.team} 
                          onChange={(e) => updateField("teams", s.id, "team", e.target.value)} 
                        />
                      </div>
                      <div className="input-wrap">
                        <input 
                          placeholder="https://..." 
                          value={s.logo || ""} 
                          onChange={(e) => updateField("teams", s.id, "logo", e.target.value)} 
                        />
                      </div>
                      <div className="input-wrap">
                        <input 
                          type="number" 
                          value={s.teamOrder ?? 0} 
                          onChange={(e) => updateField("teams", s.id, "teamOrder", Number(e.target.value))} 
                        />
                      </div>
                      <div className="input-wrap">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={scaleDrafts[`t-${s.id}`] ?? String(s.logoScale ?? 1)}
                          onFocus={(e) => e.currentTarget.select()}
                          onChange={(e) => setScaleDraft(`t-${s.id}`, e.target.value)}
                          onBlur={() => commitScaleDraft(`t-${s.id}`, "teams", s.id, "logoScale", Number(s.logoScale ?? 1))}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              (e.currentTarget as HTMLInputElement).blur();
                            }
                          }}
                        />
                      </div>
                      <button 
                        className="btn-brutal btn-danger btn-icon" 
                        title="Hapus Tim"
                        onClick={() => deleteTeam(s.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STANDINGS TAB */}
          {tab === "standings" && (
            <div className="tab-section">
              <div className="topbar">
                <div className="topbar-left">
                  <Shield className="w-8 h-8 text-[#7a0000]" />
                  <h2>KLASEMEN GRUP STAGE</h2>
                </div>
              </div>

              <div className="groups-grid">
                {grouped.map(([group, rows]) => (
                  <article key={group} className="group-card">
                    <div className="group-header">
                      <div className="group-title-badge">GRUP {group}</div>
                      <p className="group-subtitle">5 slot tim siap diisi manual.</p>
                    </div>

                    <div className="brutal-table-card">
                      <div className="table-header-grid standing-grid">
                        <span>Nama Tim</span>
                        <span>Matches</span>
                        <span>Win</span>
                        <span>Lose</span>
                        <span>Points</span>
                      </div>
                      <div className="table-rows">
                        {rows.slice(0, 5).map((s) => (
                          <div className="table-row-grid standing-grid" key={s.id}>
                            <div className="input-wrap">
                              <input 
                                placeholder="Nama Tim"
                                value={s.team} 
                                onChange={(e) => updateField("standings", s.id, "team", e.target.value)} 
                              />
                            </div>
                            <div className="input-wrap">
                              <input 
                                type="number" 
                                value={s.played ?? 0} 
                                onChange={(e) => updateField("standings", s.id, "played", Number(e.target.value))} 
                              />
                            </div>
                            <div className="input-wrap">
                              <input 
                                type="number" 
                                value={s.won ?? 0} 
                                onChange={(e) => updateField("standings", s.id, "won", Number(e.target.value))} 
                              />
                            </div>
                            <div className="input-wrap">
                              <input 
                                type="number" 
                                value={s.lost ?? 0} 
                                onChange={(e) => updateField("standings", s.id, "lost", Number(e.target.value))} 
                              />
                            </div>
                            <div className="input-wrap">
                              <input 
                                type="number" 
                                value={s.points ?? 0} 
                                onChange={(e) => updateField("standings", s.id, "points", Number(e.target.value))} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* FINAL TAB */}
          {tab === "final" && (
            <div className="tab-section">
              <div className="topbar">
                <div className="topbar-left">
                  <Trophy className="w-8 h-8 text-[#7a0000]" />
                  <h2>FINAL STAGE</h2>
                </div>
                <button className="btn-brutal btn-primary" onClick={addFinal}>
                  <Plus className="w-5 h-5" />
                  <span>Tambah Tim Final</span>
                </button>
              </div>

              {/* Bracket Image URL */}
              <article className="config-card">
                <div className="config-header">
                  <ImageIcon className="w-5 h-5 text-[#7a0000]" />
                  <h3>Bracket Image URL</h3>
                </div>
                <div className="config-body">
                  <input
                    className="config-input"
                    value={finalBracketImageUrl}
                    onChange={(e) => setFinalBracketImageUrl(e.target.value)}
                    placeholder="https://ik.imagekit.io/.../bracket-quarter.png"
                  />
                  <button className="btn-brutal btn-primary" onClick={saveFinalBracketImageUrl}>
                    <Save className="w-4 h-4" />
                    <span>Simpan URL</span>
                  </button>
                </div>
              </article>

              {/* Champion Image URL */}
              <article className="config-card">
                <div className="config-header">
                  <Award className="w-5 h-5 text-[#7a0000]" />
                  <h3>Champion Image URL</h3>
                </div>
                <div className="config-body">
                  <input
                    className="config-input"
                    value={championImageUrl}
                    onChange={(e) => setChampionImageUrl(e.target.value)}
                    placeholder="https://... (gambar canva juara)"
                  />
                  <button className="btn-brutal btn-primary" onClick={saveChampionImageUrl}>
                    <Save className="w-4 h-4" />
                    <span>Simpan URL</span>
                  </button>
                </div>
              </article>

              {/* Final Teams Table */}
              <article className="brutal-table-card mt-8">
                <div className="table-header-grid final-grid">
                  <span>Tim</span>
                  <span>Logo URL</span>
                  <span>MP</span>
                  <span>W</span>
                  <span>L</span>
                  <span>PTS</span>
                  <span>Aksi</span>
                </div>
                <div className="table-rows">
                  {finals.map((s) => (
                    <div className="table-row-grid final-grid" key={s.id}>
                      <div className="input-wrap">
                        <input 
                          placeholder="Nama Tim"
                          value={s.team} 
                          onChange={(e) => updateField("finalMatches", s.id, "team", e.target.value)} 
                        />
                      </div>
                      <div className="input-wrap">
                        <input 
                          placeholder="https://..." 
                          value={s.logo || ""} 
                          onChange={(e) => updateField("finalMatches", s.id, "logo", e.target.value)} 
                        />
                      </div>
                      <div className="input-wrap">
                        <input 
                          type="number" 
                          value={s.played ?? 0} 
                          onChange={(e) => updateField("finalMatches", s.id, "played", Number(e.target.value))} 
                        />
                      </div>
                      <div className="input-wrap">
                        <input 
                          type="number" 
                          value={s.won ?? 0} 
                          onChange={(e) => updateField("finalMatches", s.id, "won", Number(e.target.value))} 
                        />
                      </div>
                      <div className="input-wrap">
                        <input 
                          type="number" 
                          value={s.lost ?? 0} 
                          onChange={(e) => updateField("finalMatches", s.id, "lost", Number(e.target.value))} 
                        />
                      </div>
                      <div className="input-wrap">
                        <input 
                          type="number" 
                          value={s.points ?? 0} 
                          onChange={(e) => updateField("finalMatches", s.id, "points", Number(e.target.value))} 
                        />
                      </div>
                      <button 
                        className="btn-brutal btn-danger btn-icon" 
                        title="Hapus Tim"
                        onClick={() => deleteFinal(s.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          )}
        </div>
      </section>

      {/* STYLES */}
      <style jsx>{`
        /* --- LAYOUT & SIDEBAR --- */
        .admin-layout {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          background: #f8fafc;
          color: #0f172a;
          font-family: var(--font-main);
        }

        .admin-sidebar {
          position: sticky;
          top: 0;
          height: 100vh;
          background: #ffffff;
          border-right: 2px solid #1e293b;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          box-shadow: 4px 0 0 #1e293b;
          z-index: 30;
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-bottom: 16px;
          border-bottom: 2px solid #1e293b;
        }

        .brand-badge {
          background: #7a0000;
          color: #ffffff;
          font-weight: 800;
          font-size: 16px;
          padding: 6px 12px;
          border: 2px solid #1e293b;
          border-radius: 8px;
          box-shadow: 2px 2px 0 #1e293b;
          letter-spacing: 0.05em;
        }

        .sidebar-brand h1 {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          height: 52px;
          padding: 0 18px;
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          color: #0f172a;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 3px 3px 0 #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }

        .nav-btn:hover {
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0 #1e293b;
          background: #f1f5f9;
        }

        .nav-btn.active {
          background: #7a0000;
          color: #ffffff;
          border-color: #1e293b;
          box-shadow: 4px 4px 0 #0f172a;
        }

        .sidebar-spacer {
          flex: 1;
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 16px;
          padding-top: 20px;
          border-top: 2px solid #1e293b;
        }

        .user-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .user-label {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .user-email {
          font-size: 13px;
          font-weight: 600;
          color: #0f172a;
          word-break: break-all;
          margin: 0;
        }

        .logout-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 44px;
          background: #ffe4e6;
          border: 2px solid #1e293b;
          border-radius: 10px;
          color: #9f1239;
          font-weight: 700;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 2px 2px 0 #1e293b;
          text-transform: uppercase;
        }

        .logout-btn:hover {
          background: #fecdd3;
          transform: translate(-1px, -1px);
          box-shadow: 3px 3px 0 #1e293b;
        }

        /* --- MAIN CONTENT & TOPBAR --- */
        .admin-content {
          padding: 24px;
        }

        .content-container {
          width: 100%;
          max-width: none;
          margin: 0 auto;
        }

        .tab-section {
          display: flex;
          flex-direction: column;
          gap: 36px;
          animation: fadeIn 0.3s ease forwards;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 16px;
          padding: 20px 28px;
          box-shadow: 4px 4px 0 #1e293b;
          flex-wrap: nowrap;
        }

        .sticky-topbar {
          position: sticky;
          top: 20px;
          z-index: 25;
        }

        .topbar-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .topbar h2 {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
          text-transform: uppercase;
        }

        .topbar-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        /* --- BUTTONS --- */
        .btn-brutal {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 48px;
          padding: 0 24px;
          border: 2px solid #1e293b;
          border-radius: 12px;
          font-weight: 800;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 3px 3px 0 #1e293b;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .btn-brutal:hover {
          transform: translate(-2px, -2px);
          box-shadow: 5px 5px 0 #1e293b;
        }

        .btn-brutal:active {
          transform: translate(1px, 1px);
          box-shadow: 1px 1px 0 #1e293b;
        }

        .btn-primary {
          background: #7a0000;
          color: #ffffff;
        }

        .btn-secondary {
          background: #f1f5f9;
          color: #0f172a;
        }

        .btn-danger {
          background: #ffe4e6;
          color: #9f1239;
        }

        .btn-icon {
          padding: 0;
          width: 44px;
          height: 44px;
          border-width: 2px;
          box-shadow: 2px 2px 0 #1e293b;
          border-radius: 10px;
        }

        .btn-icon:hover {
          box-shadow: 3px 3px 0 #1e293b;
        }

        /* --- DATES FILTER --- */
        .dates-filter {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          width: 100%;
        }

        .date-tab {
          height: 46px;
          padding: 0 22px;
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          color: #0f172a;
          cursor: pointer;
          transition: all 0.15s ease;
          box-shadow: 3px 3px 0 #1e293b;
        }

        .date-tab:hover {
          transform: translate(-2px, -2px);
          box-shadow: 4px 4px 0 #1e293b;
          background: #f8fafc;
        }

        .date-tab.active {
          background: #7a0000;
          color: #ffffff;
          border-color: #1e293b;
          box-shadow: 4px 4px 0 #1e293b;
          font-weight: 800;
        }

        /* --- EMPTY STATE --- */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 64px 32px;
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 16px;
          box-shadow: 4px 4px 0 #1e293b;
          text-align: center;
          font-weight: 700;
          font-size: 18px;
          color: #64748b;
        }

        /* --- MATCHES GRID & CARD --- */
        .matches-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .match-card {
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 16px;
          box-shadow: 4px 4px 0 #1e293b;
          overflow: hidden;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .match-card:nth-child(even) {
          background: #f1f5f9;
        }

        .match-card.dragging {
          opacity: 0.5;
          transform: scale(0.98);
        }

        .match-card .btn-icon {
          box-shadow: none;
        }

        .match-card .btn-icon:hover {
          box-shadow: none;
          transform: none;
        }

        .match-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          background: #f1f5f9;
          border-bottom: 2px solid #1e293b;
          padding: 16px 24px;
          flex-wrap: wrap;
        }

        .match-card:nth-child(even) .match-meta {
          background: #e2e8f0;
        }

        .meta-left, .meta-right {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          flex-wrap: wrap;
        }

        .drag-handle {
          cursor: grab;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 8px;
        }

        .drag-handle:active {
          cursor: grabbing;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-group label {
          font-size: 11px;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .match-meta input {
          height: 40px;
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 8px;
          padding: 0 14px;
          font-weight: 600;
          font-size: 13px;
          color: #0f172a;
          transition: all 0.15s ease;
          width: 180px;
        }

        .match-meta input.time-input {
          width: 110px;
          text-align: center;
        }

        .match-meta input.format-input {
          width: 100px;
          text-align: center;
          font-weight: 800;
        }

        .match-meta input:focus, .match-body input:focus, .config-input:focus, .brutal-table-card input:focus {
          outline: none;
          border-color: #7a0000;
          box-shadow: 2px 2px 0 #7a0000;
        }

        .status-select {
          height: 40px;
          width: 160px;
          border: 2px solid #1e293b;
          border-radius: 8px;
          padding: 0 14px;
          font-weight: 800;
          font-size: 13px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .status-select.upcoming {
          background: #fef08a;
          color: #854d0e;
        }

        .status-select.finished {
          background: #bbf7d0;
          color: #166534;
        }

        .status-select option {
          background: #ffffff;
          color: #0f172a;
          font-weight: 700;
          padding: 8px 12px;
        }

        /* --- MATCH BODY --- */
        .match-body {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(260px, 300px) minmax(0, 1fr);
          gap: 14px;
          padding: 20px 24px;
          align-items: center;
        }

        .team-box {
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .team-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .team-badge {
          background: #0f172a;
          color: #ffffff;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 6px;
          letter-spacing: 0.05em;
        }

        .team-name-input {
          width: 100%;
          height: 42px;
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 8px;
          padding: 0 16px;
          font-weight: 800;
          font-size: 16px;
          color: #0f172a;
        }

        .logo-config {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 90px;
          align-items: end;
          gap: 12px;
        }

        .scale-input {
          width: 100%;
          height: 42px;
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 8px;
          padding: 0 10px;
          font-weight: 700;
          font-size: 14px;
          color: #0f172a;
          text-align: center;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .input-with-icon svg {
          position: absolute;
          left: 12px;
          pointer-events: none;
        }

        .input-with-icon input {
          width: 100%;
          height: 42px;
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 8px;
          padding: 0 12px 0 36px;
          font-weight: 600;
          font-size: 13px;
        }

        /* --- SCORE BOX --- */
        .score-box {
          display: flex;
          align-items: flex-end;
          justify-content: center;
          gap: 16px;
          padding: 12px 16px;
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 12px;
        }

        .score-input-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .score-input-wrapper label {
          font-size: 11px;
          font-weight: 800;
          color: #7a0000;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .score-val {
          width: 64px;
          height: 56px;
          background: #f8fafc;
          border: 2px solid #1e293b;
          border-radius: 8px;
          text-align: center;
          font-weight: 800;
          font-size: 24px;
          color: #0f172a;
        }

        .vs-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          background: #7a0000;
          border: 2px solid #1e293b;
          border-radius: 8px;
          color: #ffffff;
          font-weight: 800;
          font-size: 16px;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        /* --- BRUTAL TABLE CARD --- */
        .brutal-table-card {
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 16px;
          box-shadow: 4px 4px 0 #1e293b;
          overflow: hidden;
        }

        .table-header-grid {
          display: grid;
          align-items: center;
          gap: 16px;
          background: #f1f5f9;
          border-bottom: 2px solid #1e293b;
          padding: 16px 24px;
          font-weight: 800;
          font-size: 13px;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .table-rows {
          display: flex;
          flex-direction: column;
        }

        .table-row-grid {
          display: grid;
          align-items: center;
          gap: 16px;
          padding: 16px 24px;
          border-bottom: 2px solid #e2e8f0;
          transition: background 0.15s ease;
        }

        .table-row-grid:last-child {
          border-bottom: none;
        }

        .table-row-grid:hover {
          background: #f8fafc;
        }

        .team-grid {
          grid-template-columns: 2fr 2.5fr 1fr 1fr 60px;
        }

        .standing-grid {
          grid-template-columns: 2.5fr 1fr 1fr 1fr 1fr;
        }

        .final-grid {
          grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr 60px;
        }

        .input-wrap input {
          width: 100%;
          height: 44px;
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 8px;
          padding: 0 14px;
          font-weight: 600;
          font-size: 14px;
          color: #0f172a;
          box-shadow: 2px 2px 0 #1e293b;
        }

        /* --- GROUPS GRID --- */
        .groups-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 32px;
        }

        .group-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .group-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 14px;
          padding: 16px 24px;
          box-shadow: 3px 3px 0 #1e293b;
        }

        .group-title-badge {
          background: #7a0000;
          color: #ffffff;
          font-weight: 800;
          font-size: 22px;
          padding: 6px 16px;
          border: 2px solid #1e293b;
          border-radius: 10px;
          box-shadow: 2px 2px 0 #1e293b;
        }

        .group-subtitle {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          margin: 0;
        }

        /* --- CONFIG CARDS --- */
        .config-card {
          background: #ffffff;
          border: 2px solid #1e293b;
          border-radius: 16px;
          box-shadow: 4px 4px 0 #1e293b;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .config-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .config-header h3 {
          font-size: 20px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          text-transform: uppercase;
        }

        .config-body {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .config-input {
          flex: 1;
          min-width: 300px;
          height: 48px;
          background: #f8fafc;
          border: 2px solid #1e293b;
          border-radius: 12px;
          padding: 0 16px;
          font-weight: 600;
          font-size: 15px;
          color: #0f172a;
          box-shadow: 2px 2px 0 #1e293b;
        }

        /* --- RESPONSIVE DESIGN --- */
        @media (max-width: 1200px) {
          .topbar { flex-wrap: wrap; }
          .meta-left {
            grid-template-columns: 48px 1fr 1fr;
          }
          .meta-left .input-group:nth-child(4) {
            grid-column: 2 / -1;
          }
          .match-body {
            grid-template-columns: 1fr;
            gap: 20px;
          }
          .score-box {
            justify-content: center;
          }
          .meta-right {
            grid-template-columns: minmax(170px, 1fr) 56px;
          }
        }

        @media (max-width: 1024px) {
          .admin-layout {
            grid-template-columns: 1fr;
          }
          .admin-sidebar {
            position: static;
            height: auto;
            border-right: none;
            border-bottom: 2px solid #1e293b;
            box-shadow: 0 4px 0 #1e293b;
            padding: 20px;
          }
          .sidebar-nav {
            flex-direction: row;
            flex-wrap: wrap;
          }
          .nav-btn {
            flex: 1;
            min-width: 180px;
            justify-content: center;
          }
          .sidebar-spacer {
            display: none;
          }
          .sidebar-footer {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
          .groups-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .admin-content {
            padding: 20px;
          }
          .topbar {
            padding: 16px;
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }
          .topbar-left {
            justify-content: center;
          }
          .topbar-actions {
            justify-content: stretch;
          }
          .topbar-actions button {
            flex: 1;
          }
          .match-meta {
            grid-template-columns: 1fr;
          }
          .meta-left {
            grid-template-columns: 44px 1fr;
          }
          .meta-left .input-group:nth-child(n+3) {
            grid-column: 1 / -1;
          }
          .meta-right {
            grid-template-columns: 1fr 56px;
          }
          .logo-config {
            grid-template-columns: 1fr;
          }
          .team-grid, .standing-grid, .final-grid {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .table-header-grid {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
