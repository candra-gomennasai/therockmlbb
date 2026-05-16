"use client";

import { Hero } from "@/components/Hero";
import GroupSection from "@/components/GroupSection";
import MatchSchedule from "@/components/MatchSchedule";
import SiteFrame from "@/components/SiteFrame";
import TeamsShowcase from "@/components/TeamsShowcase";
import FinalStageBracket from "@/components/FinalStageBracket";
import { collection, doc, getDoc, getDocs, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState, useMemo, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const VALID_DATES = [8, 9, 15, 16, 22, 23, 29, 30];
const PUBLIC_CACHE_TTL_MS = 5 * 60 * 1000;

async function loadCollectionWithTTL(key: string, collectionName: string) {
  const now = Date.now();
  const storageKey = `trc-cache:${key}`;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.expiresAt && parsed.expiresAt > now && Array.isArray(parsed.data)) {
        return parsed.data;
      }
    }
  } catch {}

  let data: any[] = [];

  // Primary mode: single document per collection -> { items: [...] }
  const singleDoc = await getDoc(doc(db, collectionName, "data"));
  if (singleDoc.exists()) {
    const payload = singleDoc.data() as { items?: any[] };
    if (Array.isArray(payload?.items)) {
      data = payload.items.map((item: any, idx: number) => ({
        id: String(item?.id || `${collectionName}-${idx}`),
        ...item,
      }));
    }
  }

  // Fallback for old multi-document structure (temporary compatibility)
  if (!data.length) {
    const snap = await getDocs(query(collection(db, collectionName)));
    data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }

  try {
    localStorage.setItem(
      storageKey,
      JSON.stringify({
        expiresAt: now + PUBLIC_CACHE_TTL_MS,
        data,
      })
    );
  } catch {}

  return data;
}

function HomeContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = Number(searchParams.get("date") || "8");
  const selectedDate = VALID_DATES.includes(dateParam) ? dateParam : 8;

  const [matches, setMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [finalMatches, setFinalMatches] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    const loadAll = async () => {
      const [matchesData, standingsData, teamsData, finalMatchesData] = await Promise.all([
        loadCollectionWithTTL("matches", "matches"),
        loadCollectionWithTTL("standings", "standings"),
        loadCollectionWithTTL("teams", "teams"),
        loadCollectionWithTTL("finalMatches", "finalMatches"),
      ]);
      if (!mounted) return;
      setMatches(matchesData);
      setStandings(standingsData);
      setTeams(teamsData);
      setFinalMatches(finalMatchesData);
    };

    loadAll();
    return () => {
      mounted = false;
    };
  }, []);

  const activeTab = pathname === "/teams"
    ? "teams"
    : pathname === "/groupstage"
    ? "groups"
    : pathname === "/matches"
    ? "matches"
    : pathname === "/finalstage"
    ? "roundrobin"
    : "dashboard";

  const dayName = useMemo(
    () =>
      (
        {
          8: "JUMAT",
          9: "SABTU",
          15: "JUMAT",
          16: "SABTU",
          22: "JUMAT",
          23: "SABTU",
          29: "JUMAT",
          30: "SABTU",
        } as Record<number, string>
      )[selectedDate] || "",
    [selectedDate]
  );

  const filteredMatchesByDate = useMemo(() => {
    const base = matches
      .filter((m) => {
        // 1. Check dedicated 'day' field first (New structure)
        if (typeof m.day === 'number') {
          return m.day === selectedDate;
        }
        
        // 2. Fallback to old structure (parsing string "08 MEI 19:00")
        const dayFromTime = parseInt(String(m.time).split(" ")[0], 10);
        if (!isNaN(dayFromTime)) {
          return dayFromTime === selectedDate;
        }
        
        const dayFromDate = parseInt(String(m.date).split(" ")[0], 10);
        if (!isNaN(dayFromDate)) {
          return dayFromDate === selectedDate;
        }

        return false;
      })
      .sort((a: any, b: any) => Number(a.order ?? 999999) - Number(b.order ?? 999999));

    return base;
  }, [matches, selectedDate]);

  const onDateChange = (day: number) => {
    router.push(`/matches?date=${day}`);
  };

  const teamLogoMap = useMemo(() => {
    const map: Record<string, string> = {};
    teams.forEach((s: any) => {
      const name = String(s.team || "").toUpperCase().trim();
      const logo = String(s.logo || "").trim();
      if (name && logo) map[name] = logo;
    });
    return map;
  }, [teams]);

  return (
    <SiteFrame activeTab={activeTab} selectedDate={selectedDate} onDateChange={onDateChange}>
      {activeTab === "dashboard" && (
        <>
          <Hero />
        </>
      )}
      {activeTab === "teams" && <TeamsShowcase teams={teams} />}
      {activeTab === "groups" && <GroupSection teams={standings} />}
      {activeTab === "matches" && (
        <MatchSchedule
          showDateTime={true}
          title={`JADWAL ${dayName} ${selectedDate} MEI`}
          matches={filteredMatchesByDate}
          teamLogoMap={teamLogoMap}
        />
      )}
      {activeTab === "roundrobin" && <FinalStageBracket matches={finalMatches} />}
    </SiteFrame>
  );
}

export default function RoutedHomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
