"use client";

import { useMemo, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Hero } from "@/components/Hero";
import GroupSection from "@/components/GroupSection";
import MatchSchedule from "@/components/MatchSchedule";
import ParticipantsSection from "@/components/ParticipantsSection";
import RoundRobinSection from "@/components/RoundRobinSection";
import SiteFrame from "@/components/SiteFrame";
import { matches, teams } from "@/data/dummyData";

const VALID_DATES = [8, 9, 15, 16, 22, 23, 29, 30];

function HomeContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dateParam = Number(searchParams.get("date") || "8");
  const selectedDate = VALID_DATES.includes(dateParam) ? dateParam : 8;

  const activeTab = pathname === "/groupstage" ? "groups" : pathname === "/matches" ? "matches" : pathname === "/finalstage" ? "roundrobin" : "dashboard";

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

  const filteredMatchesByDate = matches.filter((m) => {
    const day = parseInt(String(m.date).split(" ")[0], 10);
    return day === selectedDate;
  });

  const top8Teams = ["A", "B", "C", "D"].flatMap((group) =>
    teams
      .filter((t) => t.group === group)
      .sort((a, b) => Number(a.logo) - Number(b.logo))
      .slice(0, 2)
  );

  const onDateChange = (day: number) => {
    router.push(`/matches?date=${day}`);
  };

  return (
    <SiteFrame activeTab={activeTab} selectedDate={selectedDate} onDateChange={onDateChange}>
      {activeTab === "dashboard" && (
        <>
          <Hero />
          <ParticipantsSection teams={teams} />
        </>
      )}
      {activeTab === "groups" && <GroupSection teams={teams} />}
      {activeTab === "matches" && (
        <MatchSchedule
          showDateTime={true}
          title={`JADWAL ${dayName} ${selectedDate} MEI`}
          matches={filteredMatchesByDate}
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />
      )}
      {activeTab === "roundrobin" && <RoundRobinSection teams={top8Teams} />}
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
