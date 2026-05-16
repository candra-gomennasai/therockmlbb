"use client";

import { Hero } from "@/components/Hero";
import GroupSection from "@/components/GroupSection";
import MatchSchedule from "@/components/MatchSchedule";
import SiteFrame from "@/components/SiteFrame";
import TeamsShowcase from "@/components/TeamsShowcase";
import FinalStageBracket from "@/components/FinalStageBracket";
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState, useMemo, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const VALID_DATES = [8, 9, 15, 16, 22, 23, 29, 30];

function HomeContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = Number(searchParams.get("date") || "8");
  const selectedDate = VALID_DATES.includes(dateParam) ? dateParam : 8;

  const [matches, setMatches] = useState<any[]>([]);
  const [standings, setStandings] = useState<any[]>([]);
  const [finalMatches, setFinalMatches] = useState<any[]>([]);

  useEffect(() => {
    const unsubMatches = onSnapshot(query(collection(db, 'matches')), (snap) => {
      setMatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubStandings = onSnapshot(query(collection(db, 'standings')), (snap) => {
      setStandings(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubFinalMatches = onSnapshot(query(collection(db, 'finalMatches')), (snap) => {
      setFinalMatches(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubMatches(); unsubStandings(); unsubFinalMatches(); };
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
    const base = matches.filter((m) => {
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
    });

    if (base.length >= 5) return base;

    const dummyPool = [
      { team1: "AE", team2: "BTR" },
      { team1: "DEWA", team2: "EVOS" },
      { team1: "GEEK", team2: "NAVI" },
      { team1: "ONIC", team2: "RRQ" },
      { team1: "TLID", team2: "AE" },
    ];

    const needed = 5 - base.length;
    const dummies = dummyPool.slice(0, needed).map((pair, idx) => ({
      id: `dummy-${selectedDate}-${idx}`,
      phase: "GROUP STAGE",
      date: `ROUND ${idx + 1}`,
      day: selectedDate,
      time: ["13:00", "15:00", "17:00", "19:00", "21:00"][idx] || "13:00",
      team1: pair.team1,
      team2: pair.team2,
      score1: 0,
      score2: 0,
      format: "BO1",
      status: "UPCOMING",
      __dummy: true,
    }));

    return [...base, ...dummies];
  }, [matches, selectedDate]);

  const onDateChange = (day: number) => {
    router.push(`/matches?date=${day}`);
  };

  return (
    <SiteFrame activeTab={activeTab} selectedDate={selectedDate} onDateChange={onDateChange}>
      {activeTab === "dashboard" && (
        <>
          <Hero />
        </>
      )}
      {activeTab === "teams" && <TeamsShowcase teams={standings} />}
      {activeTab === "groups" && <GroupSection teams={standings} />}
      {activeTab === "matches" && (
        <MatchSchedule
          showDateTime={true}
          title={`JADWAL ${dayName} ${selectedDate} MEI`}
          matches={filteredMatchesByDate}
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
