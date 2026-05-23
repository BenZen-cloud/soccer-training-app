import { sampleDrills, samplePlayers, sampleSessions } from "./data";
import type { Drill, Player, Session } from "./types";

const STORAGE_KEY = "soccer-training-tracker-v1";

export type TrackerState = {
  players: Player[];
  drills: Drill[];
  sessions: Session[];
};

export const defaultState: TrackerState = {
  players: samplePlayers,
  drills: sampleDrills,
  sessions: sampleSessions,
};

export function loadState(): TrackerState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const state = saved ? JSON.parse(saved) : defaultState;
    const merged = mergeSampleDrills(state);
    return {
      ...merged,
      drills: merged.drills.map((drill) => ({
        ...drill,
        count: drill.count ?? "",
        countHistory: Array.isArray(drill.countHistory) ? drill.countHistory : [],
        durationSeconds: Number(drill.durationSeconds || 0) || parseStoredDuration(drill.timer),
      })) as Drill[],
    };
  } catch {
    return defaultState;
  }
}

function mergeSampleDrills(state: TrackerState): TrackerState {
  const drills = Array.isArray(state.drills) ? [...state.drills] : [];
  const players = Array.isArray(state.players) ? state.players.map((player) => ({ ...player, drillIds: [...(player.drillIds || [])] })) : [];
  const existing = new Set(drills.map(drillSeedKey));
  const usedIds = new Set(drills.map((drill) => drill.id));

  sampleDrills.forEach((sample) => {
    const key = drillSeedKey(sample);
    if (existing.has(key)) return;
    let id = sample.id;
    let index = 1;
    while (usedIds.has(id)) id = `${sample.id}-${index++}`;
    usedIds.add(id);
    drills.push({ ...sample, id });
    players.forEach((player) => {
      if (!player.drillIds.includes(id)) player.drillIds.push(id);
    });
    existing.add(key);
  });

  return { ...state, drills, players };
}

function drillSeedKey(drill: Pick<Drill, "name" | "videoLink">) {
  const id = String(drill.videoLink || "").match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/)?.[1];
  return id ? `video:${id}` : `name:${drill.name.toLowerCase().replace(/\s+/g, " ").trim()}`;
}

function parseStoredDuration(value: unknown) {
  const text = String(value || "").toLowerCase();
  if (text.includes("30")) return 30;
  const numeric = Number(text.match(/\d+/)?.[0] || 1);
  return Math.max(1, numeric) * (text.includes("sec") ? 1 : 60);
}

export function saveState(state: TrackerState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Keep the tracker usable when storage is unavailable in local file previews.
  }
}

export function resetState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore blocked storage; the app can still reload with sample data.
  }
}
