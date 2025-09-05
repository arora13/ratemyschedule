// src/pages/Feed.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Filter } from "lucide-react";
import { ScheduleCard } from "@/components/schedule/ScheduleCard";
import { MetricsDisplay } from "@/components/MetricsDisplay";
import type { FeedResponse, Schedule, ReactionResponse } from "@/lib/types";

// ---------- helpers ----------
const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/\u2013|\u2014/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// ---------- options ----------
type College = { slug: string; name: string };

const MAJORS = [
  "computer science","electrical engineering","mechanical engineering","biology","psychology","business"
];

const LEVELS = ["freshman", "sophomore", "junior", "senior"] as const;

const SORTS = [
  { value: "new", label: "Newest First" },
  { value: "trending", label: "Most Popular" },
] as const;

// ---------- component ----------
export default function Feed() {
  const [params, setParams] = useSearchParams();
  const queryClient = useQueryClient();

  // colleges state - fetched from backend
  const [colleges, setColleges] = useState<College[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);

  // Fetch colleges from backend on component mount
  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch('/api/colleges');
        if (response.ok) {
          const collegesData = await response.json();
          setColleges(collegesData);
        } else {
          console.error('Failed to fetch colleges');
        }
      } catch (error) {
        console.error('Error fetching colleges:', error);
      } finally {
        setLoadingColleges(false);
      }
    };

    fetchColleges();
  }, []);

  // read initial filters from url
  const [collegeSlug, setCollegeSlug] = useState(params.get("college") ?? "");
  const [major, setMajor] = useState(params.get("major") ?? "");
  const [level, setLevel] = useState(params.get("level") ?? "");
  const [sort, setSort] = useState(params.get("sort") ?? "new");

  // keep url in sync with local state
  useEffect(() => {
    const next = new URLSearchParams();
    if (collegeSlug) next.set("college", collegeSlug);
    if (major) next.set("major", major);
    if (level) next.set("level", level);
    if (sort) next.set("sort", sort);
    setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collegeSlug, major, level, sort]);

  // normalize incoming "college" to a known slug (supports old links that passed names)
  const normalizedCollegeSlug = useMemo(() => {
    if (!collegeSlug) return "";
    // already a known slug?
    if (colleges.find((c) => c.slug === collegeSlug)) return collegeSlug;
    // try slugifying a label
    const fromName = colleges.find((c) => c.slug === slugify(collegeSlug))?.slug;
    return fromName ?? "";
  }, [collegeSlug, colleges]);

  // fetch real feed with debugging
  const { data, isLoading, isError, refetch, error } = useQuery({
    queryKey: ["feed", normalizedCollegeSlug, major, level, sort],
    queryFn: async (): Promise<Schedule[]> => {
      console.log("🚀 Starting feed fetch...");
      const qs = new URLSearchParams();
      if (normalizedCollegeSlug) qs.set("college", normalizedCollegeSlug);
      if (major) qs.set("major", major);
      if (level) qs.set("level", level);
      if (sort) qs.set("sort", sort);
      
      const url = `/api/feed?${qs.toString()}`;
      console.log("📡 Fetching:", url);
      
      try {
        const res = await fetch(url, {
          credentials: "include",
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
        console.log("📊 Response status:", res.status);
        console.log("📊 Response ok:", res.ok);
        
        if (!res.ok) {
          console.error("❌ Response not ok:", res.status, res.statusText);
          const errorText = await res.text();
          console.error("❌ Error body:", errorText);
          return [];
        }
        
        const json = await res.json() as FeedResponse;
        console.log("✅ Feed response:", json);
        console.log("✅ Items count:", json?.items?.length || 0);
        
        if (json?.items) {
          console.log("📋 Sample items:", json.items.slice(0, 2));
        }
        
        return json?.items ?? [];
      } catch (err) {
        console.error("💥 Fetch error:", err);
        throw err;
      }
    },
    staleTime: 0, // Disable stale time for debugging
    refetchOnMount: true,
    retry: 1,
  });

  const items = data ?? [];

  // chips for active filters
  const activeChips = useMemo(() => {
    const chips: string[] = [];
    if (normalizedCollegeSlug) {
      const c = colleges.find((x) => x.slug === normalizedCollegeSlug);
      if (c) chips.push(c.name);
    }
    if (major) chips.push(major);
    if (level) chips.push(level);
    return chips;
  }, [normalizedCollegeSlug, major, level, colleges]);

  // optimistic reactions
  const handleReaction = async (scheduleId: string, kind: "up" | "down") => {
    // optimistic local update
    queryClient.setQueryData<Schedule[]>(
      ["feed", normalizedCollegeSlug, major, level, sort],
      (old) => {
        if (!old) return old;
        return old.map((s) => {
          if (s.id !== scheduleId) return s;
          const prevMine = s.reactions.mine;
          let up = s.reactions.up;
          let down = s.reactions.down;
          // remove previous vote
          if (prevMine === "up") up = Math.max(0, up - 1);
          if (prevMine === "down") down = Math.max(0, down - 1);
          // add new vote
          if (kind === "up") up += 1;
          if (kind === "down") down += 1;
          return { ...s, reactions: { up, down, mine: kind } };
        });
      }
    );

    try {
      const res = await fetch(`/api/schedules/${scheduleId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ kind }),
      });
      if (res.ok) {
        const rr = (await res.json()) as ReactionResponse;
        // sync with server numbers
        queryClient.setQueryData<Schedule[]>(
          ["feed", normalizedCollegeSlug, major, level, sort],
          (old) =>
            old?.map((s) =>
              s.id === scheduleId ? { ...s, reactions: rr } : s
            ) ?? old
        );
      } else {
        // rollback by refetching
        refetch();
      }
    } catch {
      refetch();
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-6">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">feed</h1>
        </div>

        {/* controls: native selects for reliability */}
        <div className="flex flex-wrap items-center gap-2">
          {/* college */}
          <div className="flex items-center gap-2">
            <label htmlFor="college" className="text-sm text-muted-foreground">
              college
            </label>
            <select
              id="college"
              value={normalizedCollegeSlug}
              onChange={(e) => setCollegeSlug(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
              disabled={loadingColleges}
            >
              <option value="">
                {loadingColleges ? "Loading colleges..." : "all colleges"}
              </option>
              {colleges.map((college) => (
                <option key={college.slug} value={college.slug}>
                  {college.name}
                </option>
              ))}
            </select>
          </div>

          {/* major */}
          <div className="flex items-center gap-2">
            <label htmlFor="major" className="text-sm text-muted-foreground">
              major
            </label>
            <select
              id="major"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">all majors</option>
              {MAJORS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* level */}
          <div className="flex items-center gap-2">
            <label htmlFor="level" className="text-sm text-muted-foreground">
              level
            </label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">any level</option>
              {LEVELS.map((lv) => (
                <option key={lv} value={lv}>
                  {lv}
                </option>
              ))}
            </select>
          </div>

          {/* sort */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort" className="text-sm text-muted-foreground">
              sort
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            onClick={() => {
              setCollegeSlug("");
              setMajor("");
              setLevel("");
              setSort("new");
              refetch();
            }}
          >
            <Filter className="mr-2 h-4 w-4" />
            clear
          </Button>
        </div>
      </div>

      {/* metrics display */}
      <div className="mb-6">
        <MetricsDisplay />
      </div>

      {/* active chips */}
      {activeChips.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {activeChips.map((txt, i) => (
            <Badge key={i} variant="secondary">
              {txt}
            </Badge>
          ))}
        </div>
      )}

      {/* states */}
      {isLoading ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-muted-foreground">loading feed…</p>
        </Card>
      ) : isError ? (
        <Card className="p-8 text-center">
          <h3 className="mb-1 text-lg font-semibold">error loading feed</h3>
          <p className="mb-2 text-sm text-muted-foreground">
            try again or adjust your filters.
          </p>
          {error && (
            <p className="mb-4 text-xs text-red-500 font-mono max-w-md mx-auto break-words">
              {error instanceof Error ? error.message : String(error)}
            </p>
          )}
          <div className="space-x-2">
            <Button variant="outline" onClick={() => refetch()}>
              retry
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
                console.log("🧪 Testing direct API call...");
                try {
                  const response = await fetch('/api/feed', {
                    headers: { 'Cache-Control': 'no-cache' }
                  });
                  console.log("🧪 Direct API status:", response.status);
                  const data = await response.json();
                  console.log("🧪 Direct API data:", data);
                  alert(`API returned: ${JSON.stringify(data, null, 2)}`);
                } catch (e) {
                  console.error("🧪 Direct API error:", e);
                  alert(`API error: ${e}`);
                }
              }}
            >
              test api directly
            </Button>
          </div>
        </Card>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center">
          <h3 className="mb-1 text-lg font-semibold">no posts yet</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            be the first to upload a schedule — tag your college, major, and
            level on the upload page.
          </p>
          <Button asChild>
            <a href="/">upload a schedule</a>
          </Button>
          {/* Debug button even when no posts */}
          <div className="mt-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={async () => {
                console.log("🔍 Debug: Current data state:", data);
                console.log("🔍 Debug: Items array:", items);
                console.log("🔍 Debug: Is loading:", isLoading);
                console.log("🔍 Debug: Is error:", isError);
                
                try {
                  const response = await fetch('/api/feed', {
                    headers: { 'Cache-Control': 'no-cache' }
                  });
                  const apiData = await response.json();
                  console.log("🔍 Debug: Direct API call result:", apiData);
                  alert(`Feed data:\nStatus: ${response.status}\nItems: ${apiData?.items?.length || 0}\nData: ${JSON.stringify(apiData, null, 2).substring(0, 500)}...`);
                } catch (e) {
                  console.error("🔍 Debug error:", e);
                }
              }}
            >
              debug feed data
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {items.map((s) => (
            <ScheduleCard
              key={s.id}
              schedule={s}
              onReaction={(id, kind) => handleReaction(id, kind)}
            />
          ))}
        </div>
      )}
    </div>
  );
}