import { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import {
  Clock3,
  Edit3,
  Home,
  ListChecks,
  Menu,
  Play,
  Plus,
  RotateCcw,
  Save,
  SkipForward,
  Star,
  Trash2,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { loadState, resetState, saveState, type TrackerState } from "./storage";
import type { Drill, DrillCountEntry, Player, Session } from "./types";

type Page = "Home" | "Players" | "Drills" | "Training Sessions" | "Progress";

const pages: { name: Page; icon: LucideIcon }[] = [
  { name: "Home", icon: Home },
  { name: "Players", icon: Users },
  { name: "Drills", icon: ListChecks },
  { name: "Training Sessions", icon: Clock3 },
  { name: "Progress", icon: Star },
];

const emptyDrill: Omit<Drill, "id"> = {
  name: "",
  videoLink: "",
  notes: "",
  completed: false,
  rating: 3,
  timer: "1",
  assigned: true,
};

export function BouncingSoccerBall({
  className = "",
  label = "Bouncing soccer ball",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <span className={`bouncing-soccer-ball ${className}`} role="img" aria-label={label}>
      <span className="bouncing-soccer-ball__ball" aria-hidden="true" />
      <span className="bouncing-soccer-ball__shadow" aria-hidden="true" />
    </span>
  );
}

const drillCategoryOrder = [
  "Beginner Ball Skills",
  "1 Cone Drills",
  "2 Cone Drills",
  "2 Cone Turns",
  "10 Cone Turns",
  "The Series",
  "Full Pro Sessions",
  "Beginner Juggling",
  "Advance Juggling",
  "Beginner Juggling Tricks",
  "Advance Juggling Tricks",
  "Ladder Drills",
  "Shooting",
  "Other Drills",
];

const drillCategoryByName: Record<string, string> = {
  "stationary boxes": "Beginner Ball Skills",
  "boxes up and back": "Beginner Ball Skills",
  "box and roll": "Beginner Ball Skills",
  "stationary tap": "Beginner Ball Skills",
  "stationary taps": "Beginner Ball Skills",
  "taps up and back": "Beginner Ball Skills",
  "staionary scissor": "Beginner Ball Skills",
  "stationary scissor": "Beginner Ball Skills",
  "stationary scissors": "Beginner Ball Skills",
  "push and scissor": "Beginner Ball Skills",
  "how to do the in and out": "Beginner Ball Skills",
  "the snake 3 variations": "Beginner Ball Skills",
  "how to do the triangle step": "1 Cone Drills",
  "how to do push and pull": "1 Cone Drills",
  "how to do the one cone salsa": "1 Cone Drills",
  "how to do the v then box": "1 Cone Drills",
  "how to do the v inside": "1 Cone Drills",
  "how to do the crossover push": "1 Cone Drills",
  "how to do the box then roll": "1 Cone Drills",
  "how to do the v outside": "1 Cone Drills",
  "how to do the square step": "1 Cone Drills",
  "how to box step": "2 Cone Drills",
  "how to do the cross back": "2 Cone Drills",
  "how to do in and out boxes": "2 Cone Drills",
  "how to do the drag": "2 Cone Drills",
  "how to do the outside v": "2 Cone Drills",
  "how to do the fake shot v": "2 Cone Drills",
  "how to do the irish jig": "2 Cone Drills",
  "how to do the laces pull back": "2 Cone Drills",
  "how to do the v turn": "2 Cone Drills",
  "how to do the repeat v": "2 Cone Drills",
  "how to slide and roll": "2 Cone Drills",
  "how to do hot steppers": "2 Cone Drills",
  "how to do the right foot 8": "2 Cone Turns",
  "right foot 8": "2 Cone Turns",
  "how to do the left foot 8": "2 Cone Turns",
  "left foot 8": "2 Cone Turns",
  "messie slide": "2 Cone Turns",
  "messi slide": "2 Cone Turns",
  "maradona turn": "2 Cone Turns",
  "ronaldo combo": "2 Cone Turns",
  "fake shot pull": "2 Cone Turns",
  "body fake combo": "2 Cone Turns",
  "sole turn combo": "2 Cone Turns",
  "v turn combo": "2 Cone Turns",
  "step over turn": "2 Cone Turns",
  "sole turn right": "2 Cone Turns",
  "sole turn left": "2 Cone Turns",
  "v turn right": "2 Cone Turns",
  "v turn left": "2 Cone Turns",
  "step over inside": "2 Cone Turns",
  "how to do the stop and go": "10 Cone Turns",
  "how to do the stop and go remix": "10 Cone Turns",
  "how to do the boxers and push": "10 Cone Turns",
  "how to do the smiley face": "10 Cone Turns",
  "how to do the box step": "10 Cone Turns",
  "how to do the roll and push": "10 Cone Turns",
  "how to do the outside v step": "10 Cone Turns",
  "right foot only": "10 Cone Turns",
  "left foot only": "10 Cone Turns",
  "how to do all outside": "10 Cone Turns",
  "how to do the backwards v": "10 Cone Turns",
  "scissor step left": "10 Cone Turns",
  "scissor step right": "10 Cone Turns",
  "how to do the v step": "10 Cone Turns",
  "how to do the v combo": "10 Cone Turns",
  "how to do the hot steppers": "10 Cone Turns",
  "how to do the slide": "10 Cone Turns",
  "how to do the up and backs": "10 Cone Turns",
  "how to do the salsa slide": "10 Cone Turns",
  "learning the series part 1": "The Series",
  "learning the series part 2": "The Series",
  "learning the series part 3": "The Series",
  "learning the series part 4": "The Series",
  "elite training w mls pro": "Full Pro Sessions",
  "1000 touches w mls pro": "Full Pro Sessions",
  "how to practice like a mls pro": "Full Pro Sessions",
  "pro soccer skills session": "Full Pro Sessions",
  "how to train like a pro": "Full Pro Sessions",
  "beginner skills session": "Full Pro Sessions",
  "1 touch and catch": "Beginner Juggling",
  "1 touch bounce juggling": "Beginner Juggling",
  "2 touches and catch": "Beginner Juggling",
  "2 touch bounce juggling": "Beginner Juggling",
  "1 touch alternating": "Advance Juggling",
  "2 touch alternating": "Advance Juggling",
  "3 touch alternating": "Advance Juggling",
  "above the head juggling": "Advance Juggling",
  "all body one touch": "Advance Juggling",
  "all body 2 touches": "Advance Juggling",
  "how to do low then high juggles": "Advance Juggling",
  "feet and thigh combo": "Advance Juggling",
  "head only juggling": "Advance Juggling",
  "rainbow": "Beginner Juggling Tricks",
  "one foot flick": "Beginner Juggling Tricks",
  "scoop": "Beginner Juggling Tricks",
  "stomp": "Beginner Juggling Tricks",
  "spin lift": "Beginner Juggling Tricks",
  "toe pinch": "Beginner Juggling Tricks",
  "toe lift": "Beginner Juggling Tricks",
  "two foot flick": "Beginner Juggling Tricks",
  "touzani": "Advance Juggling Tricks",
  "spin backheel": "Advance Juggling Tricks",
  "wingrove": "Advance Juggling Tricks",
  "around the world": "Advance Juggling Tricks",
  "crossover": "Advance Juggling Tricks",
  "slam down lift": "Advance Juggling Tricks",
  "hop the world": "Advance Juggling Tricks",
  "all body stalls": "Advance Juggling Tricks",
  "heel touch": "Advance Juggling Tricks",
  "toe to toe lift": "Advance Juggling Tricks",
  "around the leg lift": "Advance Juggling Tricks",
  "heel to toe lift": "Advance Juggling Tricks",
  "waltz": "Advance Juggling Tricks",
  "one in each": "Ladder Drills",
  "two in each": "Ladder Drills",
  "lateral step": "Ladder Drills",
  "skier": "Ladder Drills",
  "lateral hops": "Ladder Drills",
  "jab step": "Ladder Drills",
  "typewriter": "Ladder Drills",
  "backwards typewriter": "Ladder Drills",
  "karaoke": "Ladder Drills",
  "karaoke combo": "Ladder Drills",
  "2 forward and 1 back": "Ladder Drills",
  "lateral double step": "Ladder Drills",
  "shooting with right foot": "Shooting",
  "shooting with left foot": "Shooting",
};

function drillCategoryKey(name: string) {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, "")
    .replace(/&/g, "and")
    .replace(/\byoutube\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function getDrillCategory(drill: Drill) {
  return drill.category || drillCategoryByName[drillCategoryKey(drill.name)] || "Other Drills";
}

function groupDrillsByCategory(drills: Drill[]) {
  const groups = new Map<string, Drill[]>();
  drills.forEach((drill) => {
    const category = getDrillCategory(drill);
    const categoryDrills = groups.get(category) ?? [];
    const key = drillCategoryKey(drill.name);
    const duplicateIndex = categoryDrills.findIndex((item) => drillCategoryKey(item.name) === key);
    if (duplicateIndex === -1) {
      groups.set(category, [...categoryDrills, drill]);
    } else if (!categoryDrills[duplicateIndex].videoLink && drill.videoLink) {
      const nextDrills = [...categoryDrills];
      nextDrills[duplicateIndex] = drill;
      groups.set(category, nextDrills);
    }
  });
  return Array.from(groups.entries()).sort(([a], [b]) => {
    const aIndex = drillCategoryOrder.indexOf(a);
    const bIndex = drillCategoryOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex) || a.localeCompare(b);
  });
}

const eliteTrainingPlaylistNames = [
  "HOW TO DO THE STOP & GO",
  "HOW TO DO THE SMILEY FACE",
  "HOW TO DO THE BOX STEP",
  "HOW TO DO THE BOX STEP (Right)",
  "HOW TO DO THE BOX STEP (Left)",
  "HOW TO DO THE SCISSOR STEP (LEFT)",
  "HOW TO DO THE SCISSOR STEP (RIGHT)",
  "HOW TO DO THE V COMBO (LEFT)",
  "HOW TO DO THE V COMBO (RIGHT)",
  "HOW TO DO THE V COMBO",
  "HOW TO DO THE ALL OUTSIDE",
  "HOW TO DO THE MESSI SLIDE",
  "Messie slide",
  "HOW TO DO THE V TURN COMBO",
  "HOW TO DO THE SOLE TURN COMBO",
  "HOW TO DO THE MARADONA TURN",
  "MARADONA TURN",
  "HOW TO DO THE FAKE SHOT, PULL",
  "Fake shot pull",
  "HOW TO DO THE BODY FAKE COMBO",
  "Body fake combo",
  "HOW TO SLIDE & ROLL (Left)",
  "HOW TO SLIDE & ROLL (Right)",
  "HOW TO SLIDE & ROLL",
  "HOW TO DO IN & OUT BOXES",
  "HOW TO DO THE V TURN",
  "How TO DO V TURN",
  "HOW TO BOX STEP",
  "Learning the Series: Part 1",
  "Learning the Series: Part 2",
  "Learning the Series: Part 3",
  "Learning the Series: Part 4",
];

const thousandTouchesPlaylistNames = [
  "HOW TO DO THE V INSIDE",
  "HOW TO DO THE PUSH & PULL",
  "HOW TO DO THE CROSSOVER PUSH",
  "HOW TO DO THE TRIANGLE STEP",
  "HOW TO DO IN & OUT BOXES",
  "HOW TO BOX STEP",
  "HOW TO DO HOT STEPPERS",
  "HOW TO SLIDE & ROLL (Left)",
  "HOW TO SLIDE & ROLL (Right)",
  "HOW TO DO THE SOLE TURN COMBO (Pull BackTurn)",
  "HOW TO DO THE RONALDO COMBO",
  "HOW TO DO THE STEP OVER INSIDE",
  "HOW TO DO THE BODY FAKE COMBO",
  "HOW TO DO THE OUTSIDE V STEP",
  "HOW TO DO THE IN & OUT",
  "HOW TO DO THE SLIDE",
  "HOW TO DO THE SCISSOR STEP (LEFT)",
  "HOW TO DO THE SCISSOR STEP (RIGHT)",
];

function getDrillsByNames(drills: Drill[], names: string[]) {
  const exactNameKey = (name: string) => name.toLowerCase().replace(/&/g, "and").replace(/\byoutube\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();
  const byExactName = new Map(drills.map((drill) => [exactNameKey(drill.name), drill]));
  const byLooseName = new Map(drills.map((drill) => [drillCategoryKey(drill.name), drill]));
  const seen = new Set<string>();
  return names
    .map((name) => byExactName.get(exactNameKey(name)) ?? byLooseName.get(drillCategoryKey(name)))
    .filter((drill): drill is Drill => Boolean(drill))
    .filter((drill) => {
      if (seen.has(drill.id)) return false;
      seen.add(drill.id);
      return true;
    });
}

function App() {
  const [state, setState] = useState<TrackerState>(() => loadState());
  const [page, setPage] = useState<Page>("Home");
  const [selectedPlayerId, setSelectedPlayerId] = useState(state.players[0]?.id ?? "");
  const [duration, setDuration] = useState(60);
  const [seconds, setSeconds] = useState(60);
  const [running, setRunning] = useState(false);
  const [selectedVideoDrillId, setSelectedVideoDrillId] = useState("");
  const [sessionDrillIds, setSessionDrillIds] = useState<string[]>(() => state.players[0]?.drillIds.slice(0, 6) ?? []);
  const [pendingCountSave, setPendingCountSave] = useState(false);
  const [resting, setResting] = useState(false);
  const [restRepsSaved, setRestRepsSaved] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [restSeconds, setRestSeconds] = useState(30);
  const [restDuration, setRestDuration] = useState(30);
  const [playlistPlayRequest, setPlaylistPlayRequest] = useState(0);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => saveState(state), [state]);

  const selectedPlayer = state.players.find((player) => player.id === selectedPlayerId) ?? state.players[0];
  const playerDrills = useMemo(() => {
    if (!selectedPlayer) return [];
    return state.drills.filter((drill) => selectedPlayer.drillIds.includes(drill.id));
  }, [selectedPlayer, state.drills]);
  const sessionDrills = playerDrills.filter((drill) => sessionDrillIds.includes(drill.id));
  const orderedSessionDrills = sessionDrillIds.map((id) => playerDrills.find((drill) => drill.id === id)).filter((drill): drill is Drill => Boolean(drill));
  const completedCount = playerDrills.filter((drill) => drill.completed).length;
  const progress = playerDrills.length ? Math.round((completedCount / playerDrills.length) * 100) : 0;
  const featuredVideo = playerDrills.find((drill) => drill.videoLink)?.videoLink ?? state.drills.find((drill) => drill.videoLink)?.videoLink ?? "";
  const selectableVideoDrills = orderedSessionDrills.length ? orderedSessionDrills : playerDrills;
  const selectedVideoDrill = selectableVideoDrills.find((drill) => drill.id === selectedVideoDrillId) ?? selectableVideoDrills.find((drill) => drill.videoLink) ?? state.drills.find((drill) => drill.videoLink);

  const updateDrill = (updated: Drill) => {
    setState((current) => ({
      ...current,
      drills: current.drills.map((drill) => (drill.id === updated.id ? updated : drill)),
    }));
  };

  const deleteDrill = (id: string) => {
    setState((current) => ({
      ...current,
      drills: current.drills.filter((drill) => drill.id !== id),
      players: current.players.map((player) => ({
        ...player,
        drillIds: player.drillIds.filter((drillId) => drillId !== id),
      })),
    }));
  };

  const addSessionFromTimer = () => {
    if (!selectedPlayer) return;
    const minutes = Math.max(1, Math.round(seconds / 60));
    const session: Session = {
      id: crypto.randomUUID(),
      playerId: selectedPlayer.id,
      date: new Date().toISOString().slice(0, 10),
      minutes,
      completedDrills: completedCount,
      notes: "Saved from home training timer.",
    };
    setState((current) => ({ ...current, sessions: [session, ...current.sessions] }));
  };

  const saveCurrentCountForSession = () => {
    const drillId = selectedVideoDrill?.id;
    if (!drillId) return;
    setState((current) => ({
      ...current,
      drills: current.drills.map((drill) => {
        if (drill.id !== drillId) return drill;
        const numericCount = Number(drill.count);
        if (!Number.isFinite(numericCount)) return drill;
        return {
          ...drill,
          completed: true,
          countHistory: [
            ...(drill.countHistory ?? []),
            {
              id: crypto.randomUUID(),
              date: new Date().toISOString().slice(0, 10),
              count: numericCount,
              sessionId: current.sessions[0]?.id ?? "current-session",
            },
          ],
        };
      }),
    }));
  };

  const advanceToNextPlaylistDrill = (startNext = false) => {
    const ids = sessionDrillIds.length ? sessionDrillIds : orderedSessionDrills.map((drill) => drill.id);
    if (!ids.length) return;
    const currentIndex = ids.indexOf(selectedVideoDrill?.id ?? "");
    const nextId = currentIndex < 0 ? ids[0] : ids[currentIndex + 1];
    const nextDrill = playerDrills.find((drill) => drill.id === nextId);
    if (!nextDrill) {
      setRunning(false);
      setResting(false);
      setPendingCountSave(false);
      setSessionComplete(true);
      return;
    }
    setSelectedVideoDrillId(nextDrill.id);
    const nextDuration = nextDrill.durationSeconds || duration;
    setDuration(nextDuration);
    setSeconds(nextDuration);
    setPendingCountSave(false);
    if (startNext) {
      unlockAudio(audioRef);
      setPlaylistPlayRequest((current) => current + 1);
      setRunning(true);
    }
  };

  useEffect(() => {
    if (!running) return;
    const interval = window.setInterval(() => {
      setSeconds((current) => {
          if (current <= 1) {
            setRunning(false);
            setPendingCountSave(false);
            playTimerDoneSound(audioRef);
            const ids = sessionDrillIds.length ? sessionDrillIds : orderedSessionDrills.map((drill) => drill.id);
            const currentIndex = ids.indexOf(selectedVideoDrill?.id ?? "");
            if (currentIndex >= 0 && currentIndex < ids.length - 1) {
              setRestSeconds(restDuration);
              setResting(true);
              setRestRepsSaved(false);
              setSessionComplete(false);
            } else {
              saveCurrentCountForSession();
              setResting(false);
              setSessionComplete(true);
            }
            return 0;
          }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [running, sessionDrillIds, orderedSessionDrills, selectedVideoDrill?.id, restDuration]);

  useEffect(() => {
    if (!resting) return;
    const interval = window.setInterval(() => {
      setRestSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          if (!restRepsSaved) saveCurrentCountForSession();
          setResting(false);
          setRestRepsSaved(false);
          advanceToNextPlaylistDrill(true);
          return restDuration;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [resting, restDuration, restRepsSaved]);

  const restPlaylistIds = sessionDrillIds.length ? sessionDrillIds : orderedSessionDrills.map((drill) => drill.id);
  const currentRestIndex = restPlaylistIds.indexOf(selectedVideoDrill?.id ?? "");
  const nextRestDrill = currentRestIndex >= 0 ? playerDrills.find((drill) => drill.id === restPlaylistIds[currentRestIndex + 1]) : undefined;

  return (
    <div className="min-h-screen bg-sun text-ink">
      <header className="border-b border-slate-300 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full border-4 border-field bg-white shadow-sm" aria-label="Soccer ball">
              <div className="h-8 w-8 rounded-full border-2 border-slate-900 bg-white [background:radial-gradient(circle_at_50%_50%,#111_0_16%,transparent_17%),linear-gradient(36deg,transparent_41%,#111_42%_46%,transparent_47%),linear-gradient(108deg,transparent_41%,#111_42%_46%,transparent_47%),linear-gradient(180deg,transparent_41%,#111_42%_46%,transparent_47%),linear-gradient(252deg,transparent_41%,#111_42%_46%,transparent_47%),linear-gradient(324deg,transparent_41%,#111_42%_46%,transparent_47%)]" />
            </div>
            <div>
              <h1 className="flex flex-wrap items-center gap-2 text-2xl font-black tracking-wide">
                SOCCER <span className="text-field">TRAINING</span>
                <BouncingSoccerBall className="[--ball-size:1.35rem]" />
              </h1>
              <p className="text-xs font-black uppercase tracking-[0.08em] text-ink">Created by Ben, for the Love of the Game.</p>
            </div>
          </div>
          <button className="rounded-md p-2 text-3xl leading-none text-ink" aria-label="Menu">
            <Menu size={34} />
          </button>
          <nav className="fixed bottom-0 left-1/2 z-20 grid w-full max-w-6xl -translate-x-1/2 grid-cols-5 border-x border-t border-slate-300 bg-white/95 shadow-[0_-10px_25px_rgba(15,23,42,0.08)] backdrop-blur">
            {pages.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => {
                  setPage(name);
                  if (name === "Home") window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`focus-ring flex min-h-16 flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-black transition ${
                  page === name ? "bg-green-50 text-field shadow-[inset_0_5px_0_#16A34A]" : "bg-white text-ink hover:bg-slate-100"
                }`}
              >
                <Icon size={16} />
                {name}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 pb-28 sm:px-6">
        {page === "Home" && selectedPlayer && (
          <HomePage
            player={selectedPlayer}
            players={state.players}
            drills={playerDrills}
            allDrills={state.drills}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={setSelectedPlayerId}
            seconds={seconds}
            running={running}
            duration={duration}
            restDuration={restDuration}
            featuredVideo={selectedVideoDrill?.videoLink || featuredVideo}
            playRequest={playlistPlayRequest}
            selectedVideoDrillId={selectedVideoDrill?.id || ""}
            sessionDrillIds={sessionDrillIds}
            pendingCountSave={pendingCountSave}
            onSelectVideoDrill={setSelectedVideoDrillId}
            onActivateDrill={(drill) => {
              setSelectedVideoDrillId(drill.id);
              const nextDuration = drill.durationSeconds || duration;
              setDuration(nextDuration);
              setSeconds(nextDuration);
              setRunning(false);
              setPendingCountSave(false);
            }}
            onToggleSessionDrill={(id, checked) => {
              setSessionDrillIds((current) => {
                const next = checked ? Array.from(new Set([...current, id])) : current.filter((item) => item !== id);
                if (!next.includes(selectedVideoDrillId)) setSelectedVideoDrillId(next[0] ?? "");
                return next;
              });
            }}
            onMoveSessionDrill={(id, direction) => {
              setSessionDrillIds((current) => {
                const next = [...current];
                const index = next.indexOf(id);
                const nextIndex = index + direction;
                if (index < 0 || nextIndex < 0 || nextIndex >= next.length) return current;
                [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
                return next;
              });
            }}
            onClearPlaylist={() => {
              setState((current) => ({
                ...current,
                drills: current.drills.map((drill) =>
                  ({
                    ...drill,
                    completed: false,
                    count: "",
                    countHistory: [],
                  })
                ),
              }));
              setSessionDrillIds([]);
              setSelectedVideoDrillId("");
              setRunning(false);
              setPendingCountSave(false);
              setResting(false);
              setSessionComplete(false);
            }}
            onUseRecommendedPlaylist={(drillIds) => {
              const nextIds = drillIds.filter((id) => state.drills.some((drill) => drill.id === id));
              const first = state.drills.find((drill) => drill.id === nextIds[0]);
              setState((current) => ({
                ...current,
                players: current.players.map((player) =>
                  player.id === selectedPlayerId
                    ? { ...player, drillIds: Array.from(new Set([...player.drillIds, ...nextIds])) }
                    : player
                ),
              }));
              setSessionDrillIds(nextIds);
              setSelectedVideoDrillId(first?.id ?? "");
              if (first) {
                const nextDuration = first.durationSeconds || duration;
                setDuration(nextDuration);
                setSeconds(nextDuration);
              }
              setRunning(false);
              setPendingCountSave(false);
              setResting(false);
              setSessionComplete(false);
            }}
            onStartPlaylist={() => {
              const first = orderedSessionDrills[0] ?? selectedVideoDrill ?? playerDrills.find((drill) => drill.videoLink);
              if (!first) return;
              setSessionComplete(false);
              setSessionDrillIds((current) => (current.includes(first.id) ? current : [first.id, ...current]));
              setSelectedVideoDrillId(first.id);
              const nextDuration = first.durationSeconds || duration;
              setDuration(nextDuration);
              setSeconds(nextDuration);
              setPendingCountSave(false);
              setResting(false);
              unlockAudio(audioRef);
              setPlaylistPlayRequest((current) => current + 1);
              openCompanionVideoIfNeeded(first.videoLink);
              setRunning(true);
            }}
            onNextDrill={() => advanceToNextPlaylistDrill(running)}
            onUpdateDrillDuration={(drill, minutes) => {
              const durationSeconds = Math.max(1, minutes) * 60;
              updateDrill({ ...drill, durationSeconds, timer: String(minutes) });
              if (selectedVideoDrill?.id === drill.id) {
                setDuration(durationSeconds);
                setSeconds(durationSeconds);
                setRunning(false);
                setPendingCountSave(false);
                setSessionComplete(false);
              }
            }}
            onSaveCountForSession={() => {
              saveCurrentCountForSession();
              setPendingCountSave(false);
              advanceToNextPlaylistDrill();
            }}
            onChooseDuration={(nextDuration) => {
              setDuration(nextDuration);
              setSeconds(nextDuration);
              setRunning(false);
              setPendingCountSave(false);
              setResting(false);
              setSessionComplete(false);
            }}
            onRestDurationChange={(nextRestDuration) => {
              const clamped = Math.min(30, Math.max(15, nextRestDuration));
              setRestDuration(clamped);
              if (!resting) setRestSeconds(clamped);
            }}
            onStart={() => {
              setSessionComplete(false);
              unlockAudio(audioRef);
              if (seconds <= 0) setSeconds(duration);
              setResting(false);
              setRunning(true);
            }}
            onPause={() => setRunning(false)}
            onReset={() => {
              setRunning(false);
              setResting(false);
              setSessionComplete(false);
              setSeconds(duration);
            }}
            onSaveSession={addSessionFromTimer}
            onUpdateDrill={updateDrill}
            onUpdatePlayerPhoto={(photoDataUrl) => {
              setState((current) => ({
                ...current,
                players: current.players.map((player) => (player.id === selectedPlayer.id ? { ...player, photoDataUrl } : player)),
              }));
            }}
          />
        )}
        {page === "Players" && <PlayersPage state={state} setState={setState} selectedPlayerId={selectedPlayerId} setSelectedPlayerId={setSelectedPlayerId} />}
        {page === "Drills" && <DrillsPage drills={state.drills} setState={setState} updateDrill={updateDrill} deleteDrill={deleteDrill} />}
        {page === "Training Sessions" && <SessionsPage state={state} setState={setState} />}
        {page === "Progress" && <ProgressPage players={state.players} drills={state.drills} sessions={state.sessions} />}
      </main>
      {resting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-5">
          <div className="w-full max-w-sm rounded-lg border border-slate-300 bg-white p-6 text-center shadow-soft">
            <h3 className="text-xl font-black uppercase text-field">{restDuration} Second Rest</h3>
            <div className="my-5 text-6xl font-black tabular-nums text-slate-900">{formatTimeHms(restSeconds)}</div>
            <div className="mb-4 rounded-lg border border-green-100 bg-green-50 p-3 text-left">
              <span className="block text-xs font-black uppercase text-field">Next drill</span>
              <strong className="mt-1 block text-lg leading-tight text-slate-900">{nextRestDrill?.name ?? "Training complete"}</strong>
            </div>
            <label className="mb-4 grid gap-1 text-left text-sm font-bold text-ink">
              Reps completed for {selectedVideoDrill?.name ?? "drill"}
              <input
                type="number"
                min={0}
                inputMode="numeric"
                autoFocus
                value={selectedVideoDrill?.count ?? ""}
                onChange={(event) => {
                  if (!selectedVideoDrill) return;
                  updateDrill({ ...selectedVideoDrill, count: event.target.value });
                }}
                placeholder="Type number of reps"
                className="focus-ring rounded-md border border-slate-300 px-3 py-3 text-center text-2xl font-black"
              />
            </label>
            <p className="mb-5 text-sm font-semibold text-ink">{restRepsSaved ? "Reps saved. Continue when ready." : "Type reps, save them, then continue when ready."}</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  saveCurrentCountForSession();
                  setRestRepsSaved(true);
                }}
                className="focus-ring rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-ink hover:bg-slate-100"
              >
                Save Reps
              </button>
              <button
                onClick={() => {
                  setResting(false);
                  setRestRepsSaved(false);
                  advanceToNextPlaylistDrill(true);
                }}
                className="focus-ring min-h-11 rounded-md bg-field px-4 py-3 text-sm font-black text-white hover:bg-green-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
      {sessionComplete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-5">
          <div className="w-full max-w-md rounded-lg border border-green-200 bg-white p-6 text-center shadow-soft">
            <div className="text-5xl" aria-hidden="true">
              🏆
            </div>
            <h3 className="mt-3 text-2xl font-black uppercase text-field">Congratulations!</h3>
            <p className="mt-3 text-lg font-black text-slate-900">You have completed your training session.</p>
            <p className="mt-2 text-sm font-semibold text-ink">Great work. The playlist video has stopped.</p>
            <button
              onClick={() => setSessionComplete(false)}
              className="focus-ring mt-5 min-h-11 w-full rounded-md bg-field px-4 py-3 text-sm font-black text-white hover:bg-green-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type CategoryVisual = {
  icon: string;
  title: string;
  subtitle: string;
  background: string;
  border: string;
  accent: string;
  pattern: string;
};

const categoryPalette = [
  { background: "linear-gradient(135deg, #effaf3 0%, #d7f2e1 100%)", border: "#bbdfc8", accent: "#16A34A" },
  { background: "linear-gradient(135deg, #eef6ff 0%, #dbeafe 100%)", border: "#bfdbfe", accent: "#2563eb" },
  { background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)", border: "#fed7aa", accent: "#ea580c" },
  { background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)", border: "#ddd6fe", accent: "#7c3aed" },
  { background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)", border: "#fecaca", accent: "#dc2626" },
  { background: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)", border: "#a5f3fc", accent: "#0891b2" },
];

function categoryVisual(category: string, index: number): CategoryVisual {
  const normalized = category.toLowerCase();
  const fallback = categoryPalette[index % categoryPalette.length];
  let visual: CategoryVisual = {
    ...fallback,
    icon: "SK",
    title: category,
    subtitle: "Choose a drill and add it to your plan.",
    pattern: "repeating-linear-gradient(45deg, transparent 0 14px, rgba(255,255,255,.5) 14px 15px)",
  };

  if (normalized.includes("ball") || normalized.includes("cone drills") || normalized.includes("1 cone")) {
    visual = {
      icon: "BM",
      title: normalized.includes("beginner") ? "Ball Mastery" : category,
      subtitle: "Quick touches and close control.",
      background: "linear-gradient(135deg, #edfdf4 0%, #d9f99d 120%)",
      border: "#bbf7d0",
      accent: "#16A34A",
      pattern: "radial-gradient(circle at 18% 20%, rgba(21,128,61,.14) 0 18px, transparent 19px), radial-gradient(circle at 90% 10%, rgba(21,128,61,.12) 0 28px, transparent 29px)",
    };
  } else if (normalized.includes("pass")) {
    visual = {
      icon: "PA",
      title: "Passing",
      subtitle: "Move the ball with purpose.",
      background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
      border: "#bfdbfe",
      accent: "#2563eb",
      pattern: "linear-gradient(120deg, transparent 0 45%, rgba(37,99,235,.18) 45% 47%, transparent 47%)",
    };
  } else if (normalized.includes("turn") || normalized.includes("dribbl") || normalized.includes("cone")) {
    visual = {
      icon: "DR",
      title: category === "2 Cone Turns" ? "2 Cones Turns Drills" : normalized.includes("turn") ? category : "Dribbling",
      subtitle: "Change direction and beat space.",
      background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)",
      border: "#fed7aa",
      accent: "#ea580c",
      pattern: "linear-gradient(135deg, transparent 0 20%, rgba(234,88,12,.14) 20% 23%, transparent 23% 43%, rgba(234,88,12,.14) 43% 46%, transparent 46%)",
    };
  } else if (normalized.includes("shoot")) {
    visual = {
      icon: "GO",
      title: "Shooting",
      subtitle: "Strike clean and aim with power.",
      background: "linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)",
      border: "#fecaca",
      accent: "#dc2626",
      pattern: "linear-gradient(90deg, rgba(220,38,38,.10) 1px, transparent 1px), linear-gradient(0deg, rgba(220,38,38,.10) 1px, transparent 1px)",
    };
  } else if (normalized.includes("ladder") || normalized.includes("fitness") || normalized.includes("agility")) {
    visual = {
      icon: "FT",
      title: "Fitness",
      subtitle: "Build speed, balance, and stamina.",
      background: "linear-gradient(135deg, #ecfeff 0%, #cffafe 100%)",
      border: "#a5f3fc",
      accent: "#0891b2",
      pattern: "repeating-linear-gradient(90deg, transparent 0 18px, rgba(8,145,178,.14) 18px 20px)",
    };
  } else if (normalized.includes("first") || normalized.includes("touch") || normalized.includes("control")) {
    visual = {
      icon: "TC",
      title: "First Touch",
      subtitle: "Receive, cushion, and set up.",
      background: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%)",
      border: "#99f6e4",
      accent: "#0f766e",
      pattern: "radial-gradient(circle at 80% 20%, rgba(15,118,110,.14) 0 34px, transparent 35px)",
    };
  } else if (normalized.includes("juggl")) {
    visual = {
      icon: "JG",
      title: "Juggling",
      subtitle: "Coordination and ball feel.",
      background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)",
      border: "#ddd6fe",
      accent: "#7c3aed",
      pattern: "radial-gradient(circle at 22% 80%, rgba(124,58,237,.14) 0 26px, transparent 27px)",
    };
  } else if (normalized.includes("series") || normalized.includes("pro")) {
    visual = {
      icon: "TR",
      title: normalized.includes("pro") ? "Pro Sessions" : "Training Series",
      subtitle: "Follow a complete skill progression.",
      background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      border: "#cbd5e1",
      accent: "#334155",
      pattern: "linear-gradient(145deg, transparent 0 28%, rgba(51,65,85,.10) 28% 30%, transparent 30%)",
    };
  }

  return visual;
}

function HomePage(props: {
  player: Player;
  players: Player[];
  drills: Drill[];
  allDrills: Drill[];
  selectedPlayerId: string;
  onSelectPlayer: (id: string) => void;
  seconds: number;
  running: boolean;
  duration: number;
  restDuration: number;
  featuredVideo: string;
  playRequest: number;
  selectedVideoDrillId: string;
  sessionDrillIds: string[];
  pendingCountSave: boolean;
  onSelectVideoDrill: (id: string) => void;
  onActivateDrill: (drill: Drill) => void;
  onToggleSessionDrill: (id: string, checked: boolean) => void;
  onMoveSessionDrill: (id: string, direction: -1 | 1) => void;
  onClearPlaylist: () => void;
  onUseRecommendedPlaylist: (drillIds: string[]) => void;
  onStartPlaylist: () => void;
  onNextDrill: () => void;
  onUpdateDrillDuration: (drill: Drill, minutes: number) => void;
  onSaveCountForSession: () => void;
  onChooseDuration: (seconds: number) => void;
  onRestDurationChange: (seconds: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSaveSession: () => void;
  onUpdateDrill: (drill: Drill) => void;
  onUpdatePlayerPhoto: (photoDataUrl: string) => void;
}) {
  const featuredDrill = props.drills.find((drill) => drill.videoLink) ?? props.allDrills.find((drill) => drill.videoLink);
  const videoDrill = props.drills.find((drill) => drill.id === props.selectedVideoDrillId) ?? featuredDrill;
  const playlistDrills = props.sessionDrillIds.map((id) => props.drills.find((drill) => drill.id === id)).filter((drill): drill is Drill => Boolean(drill));
  const playlistCompletedCount = playlistDrills.filter((drill) => drill.completed).length;
  const playlistProgress = playlistDrills.length ? Math.round((playlistCompletedCount / playlistDrills.length) * 100) : 0;
  const playlistMinutes = Math.round(playlistDrills.reduce((total, drill) => total + (drill.durationSeconds || 60), 0) / 60);
  const [drillSearch, setDrillSearch] = useState("");
  const [selectedCategoryDrills, setSelectedCategoryDrills] = useState<Record<string, string[]>>({});
  const [allDrillPickerOpen, setAllDrillPickerOpen] = useState(false);
  const [allSelectedDrillIds, setAllSelectedDrillIds] = useState<string[]>([]);
  const [browseAllDrillsOpen, setBrowseAllDrillsOpen] = useState(false);
  const visibleDrills = props.drills.filter((drill) => drill.name.toLowerCase().includes(drillSearch.trim().toLowerCase()));
  const categorizedVisibleDrills = useMemo(() => groupDrillsByCategory(visibleDrills), [visibleDrills]);
  const recommendedPlaylists = useMemo(
    () =>
      [
        { label: "Elite Training Playlist", detail: "Play this playlist", categories: [] },
        { label: "1000 Touches Drills", detail: "Play this playlist", categories: [] },
        { label: "Juggling", detail: "Control challenge", categories: ["Beginner Juggling", "Advance Juggling"] },
      ].map((preset) => ({
        ...preset,
        drills:
          preset.label === "Elite Training Playlist"
            ? getDrillsByNames(props.allDrills, eliteTrainingPlaylistNames)
            : preset.label === "1000 Touches Drills"
              ? getDrillsByNames(props.allDrills, thousandTouchesPlaylistNames)
            : props.drills.filter((drill) => preset.categories.includes(getDrillCategory(drill)) && drill.videoLink).slice(0, 5),
      })),
    [props.allDrills, props.drills]
  );
  return (
    <div className="space-y-5">
      <section className="rounded-3xl border border-slate-300 bg-white p-4 shadow-soft sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-2xl font-black uppercase text-field">Tutorial Video</h3>
        </div>
        <div className="mb-4 grid items-start gap-4">
          <label className="grid gap-3 rounded-2xl border-2 border-green-200 bg-white p-4 text-sm font-black text-ink shadow-sm sm:grid-cols-[1fr_auto] sm:items-center">
            <span>
              <span className="block text-sm uppercase tracking-wide text-field">Current Drill</span>
              <span className="mt-1 block text-2xl font-black text-slate-900">{videoDrill?.name ?? "Select a drill"}</span>
              <span className="mt-1 block text-sm font-extrabold text-slate-700">Preview or change the drill before you train.</span>
            </span>
            <select
              value={videoDrill?.id || ""}
              onChange={(event) => {
                const drill = props.drills.find((item) => item.id === event.target.value);
                if (drill) props.onActivateDrill(drill);
              }}
              className="focus-ring min-h-16 w-full rounded-2xl border-2 border-slate-300 bg-white px-5 py-4 text-lg font-black text-slate-900 sm:w-80"
            >
              {(props.drills.filter((drill) => props.sessionDrillIds.includes(drill.id)).length
                ? props.drills.filter((drill) => props.sessionDrillIds.includes(drill.id))
                : props.drills
              )
                .filter((drill) => drill.videoLink)
                .map((drill) => (
                  <option key={drill.id} value={drill.id}>
                    {drill.name}
                  </option>
              ))}
            </select>
          </label>
          <div className="w-full justify-self-center md:max-w-[900px]">
            <VideoFrame url={videoDrill?.videoLink || props.featuredVideo} playing={props.running} playRequest={props.playRequest} seconds={props.seconds} duration={props.duration} onVideoPause={props.onPause} />
            <div className="mt-3 rounded-2xl border border-slate-300 bg-white p-3 shadow-sm">
              <TimerPanel
                seconds={props.seconds}
                running={props.running}
                duration={props.duration}
                restDuration={props.restDuration}
                onChooseDuration={props.onChooseDuration}
                onRestDurationChange={props.onRestDurationChange}
                onStart={props.onStart}
                onPause={props.onPause}
                onReset={props.onReset}
                onNext={props.onNextDrill}
                onSaveSession={props.onSaveSession}
                compact
                completedCount={playlistCompletedCount}
                totalDrills={playlistDrills.length}
                progress={playlistProgress}
                countHistory={videoDrill?.countHistory ?? []}
                pendingCountSave={props.pendingCountSave}
                onSaveCountForSession={props.onSaveCountForSession}
              />
            </div>
          </div>
          <details className="group rounded-2xl border border-green-200 bg-white p-3">
            <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-3 rounded-xl px-2 py-2 text-base font-black text-field">
              Instruction guide
              <span className="text-lg font-black text-field group-open:rotate-180">v</span>
            </summary>
            <TrainingInstructions />
          </details>
          <details className="group rounded-2xl border border-slate-300 bg-white p-3 shadow-sm">
            <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-1 py-1">
              <span>
                <span className="block text-sm font-bold text-ink">Training playlist</span>
                <span className="text-xs font-semibold text-ink">
                  {props.sessionDrillIds.length ? `${props.sessionDrillIds.length} selected` : "Select drills below"}
                </span>
              </span>
              <span className="text-sm font-black text-field group-open:rotate-180">⌄</span>
            </summary>
            <div className="mt-3 flex flex-wrap justify-end gap-2">
              <button onClick={props.onClearPlaylist} className="focus-ring min-h-12 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-900 hover:bg-slate-100">
                Clear All
              </button>
              <button onClick={props.onStartPlaylist} className="focus-ring min-h-12 rounded-xl bg-field px-5 py-3 text-sm font-black text-white shadow-sm hover:bg-green-700">
                Start Playlist
              </button>
            </div>
            <div className="mt-3 grid max-h-80 gap-2 overflow-auto">
              {props.sessionDrillIds
                .map((id) => props.drills.find((drill) => drill.id === id))
                .filter((drill): drill is Drill => Boolean(drill))
                .map((drill, index) => (
                <div
                  key={drill.id}
                  className={`grid grid-cols-[1.5rem_minmax(0,1fr)_4.25rem_auto_auto] items-center gap-2 rounded-xl border bg-white px-3 py-2 text-sm ${
                    videoDrill?.id === drill.id ? "border-field shadow-[inset_4px_0_0_#16A34A]" : "border-slate-300"
                  }`}
                >
                  <span className="font-black text-ink">{index + 1}</span>
                  <button onClick={() => props.onActivateDrill(drill)} className="min-h-11 truncate rounded-lg border border-slate-300 px-3 py-2 text-left font-black">
                    {drill.name}
                  </button>
                  <label className="grid gap-0.5 text-xs font-black text-ink">
                    Min
                    <input
                      type="number"
                      min={1}
                      value={Math.round((drill.durationSeconds || 60) / 60)}
                      onChange={(event) => props.onUpdateDrillDuration(drill, Number(event.target.value))}
                      className="focus-ring min-h-10 w-full rounded-lg border border-slate-300 px-2 py-1 text-sm font-bold"
                    />
                  </label>
                  <span className="flex gap-1">
                    <button onClick={() => props.onMoveSessionDrill(drill.id, -1)} className="min-h-10 rounded-lg border border-slate-300 px-3 py-1 font-black" aria-label="Move drill up">
                      ↑
                    </button>
                    <button onClick={() => props.onMoveSessionDrill(drill.id, 1)} className="min-h-10 rounded-lg border border-slate-300 px-3 py-1 font-black" aria-label="Move drill down">
                      ↓
                    </button>
                  </span>
                  <button
                    onClick={() => props.onToggleSessionDrill(drill.id, false)}
                    className="min-h-11 rounded-lg border border-danger bg-red-50 px-3 py-2 font-black text-danger hover:bg-red-100"
                    aria-label={`Remove ${drill.name} from playlist`}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {props.sessionDrillIds.length === 0 && <div className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm font-semibold text-ink">Select drills from the player or drill pages.</div>}
            </div>
          </details>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-300 bg-white p-4 shadow-soft sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-black uppercase text-field">Playlist Selection</h3>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center">
            <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center">
              <span className="block text-[10px] font-black uppercase text-green-700">Selected</span>
              <strong className="block text-2xl leading-none text-field">{props.sessionDrillIds.length}</strong>
            </div>
            <div className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-center">
              <span className="block text-[10px] font-black uppercase text-ink">Minutes</span>
              <strong className="block text-2xl leading-none text-slate-900">{playlistMinutes}</strong>
            </div>
            <button
              type="button"
              onClick={() => setBrowseAllDrillsOpen((open) => !open)}
              className="focus-ring min-h-14 rounded-xl bg-field px-4 py-3 text-sm font-black uppercase text-white shadow-sm hover:bg-green-700"
            >
              {browseAllDrillsOpen ? "Hide Drills" : "+ Add Drill"}
            </button>
          </div>
        </div>
        <div className="mb-3 grid gap-2 sm:grid-cols-3">
          {recommendedPlaylists.map((playlist) => (
            <button
              key={playlist.label}
              type="button"
              onClick={() => props.onUseRecommendedPlaylist(playlist.drills.map((drill) => drill.id))}
              disabled={!playlist.drills.length}
              className="focus-ring rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-left hover:border-field hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="block text-sm font-black text-field">{playlist.label}</span>
              <span className="block text-xs font-bold text-ink">
                {playlist.drills.length} drills - {playlist.detail}
              </span>
            </button>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-300 bg-white p-3">
          <button
            type="button"
            onClick={() => setBrowseAllDrillsOpen((open) => !open)}
            className="focus-ring flex min-h-14 w-full items-center justify-between gap-3 rounded-xl bg-[#F8FAF5] px-4 py-3 text-left hover:bg-green-50"
          >
            <span>
              <span className="block text-lg font-black uppercase text-field">Browse All Drills</span>
              <span className="block text-sm font-bold text-slate-800">Open categories, check drills, and add selected drills.</span>
            </span>
            <span className="rounded-full bg-field px-3 py-1 text-sm font-black text-white">{browseAllDrillsOpen ? "Hide" : "Open"}</span>
          </button>
          {browseAllDrillsOpen && (
          <div className="mt-4 space-y-4">
        <label className="grid gap-2 text-base font-black text-ink">
          Search drills
          <input
            id="drillSearch"
            type="search"
            value={drillSearch}
            onChange={(event) => setDrillSearch(event.target.value)}
            placeholder="Type a drill name..."
            className="focus-ring min-h-14 rounded-xl border-2 border-slate-300 px-4 py-3 text-base font-bold"
          />
        </label>
        <div className="rounded-xl border border-green-200 bg-green-50/70 p-3">
          <button
            type="button"
            onClick={() => setAllDrillPickerOpen((open) => !open)}
            className="focus-ring flex w-full items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-left shadow-sm"
          >
            <span>
              <span className="block text-sm font-black text-field">All drills dropdown</span>
              <span className="block text-xs font-semibold text-ink">
                {allSelectedDrillIds.length ? `${allSelectedDrillIds.length} checked` : "Open this list to pick multiple drills"}
              </span>
            </span>
            <span className={`text-lg font-black text-field transition ${allDrillPickerOpen ? "rotate-180" : ""}`}>v</span>
          </button>
          {allDrillPickerOpen && (
            <div className="mt-3 overflow-hidden rounded-lg border border-green-200 bg-white">
              <div className="max-h-72 divide-y divide-slate-100 overflow-auto">
                {visibleDrills.map((drill) => (
                  <label key={drill.id} className="grid min-h-14 cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 px-3 py-2 text-base hover:bg-green-50">
                    <input
                      type="checkbox"
                      checked={allSelectedDrillIds.includes(drill.id)}
                      onChange={(event) =>
                        setAllSelectedDrillIds((current) =>
                          event.target.checked ? Array.from(new Set([...current, drill.id])) : current.filter((id) => id !== drill.id)
                        )
                      }
                      className="h-6 w-6 rounded border-slate-300 accent-field"
                    />
                    <span className="min-w-0">
                      <span className="block truncate font-black text-slate-900">{drill.name}</span>
                      <span className="block truncate text-xs font-bold text-ink">{getDrillCategory(drill)}</span>
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-ink">{formatDuration(drill.durationSeconds)}</span>
                  </label>
                ))}
                {!visibleDrills.length && <div className="px-3 py-4 text-sm font-bold text-ink">No drills match your search.</div>}
              </div>
              <div className="grid gap-2 border-t border-green-100 bg-green-50 p-3 sm:grid-cols-[1fr_auto]">
                <button
                  type="button"
                  disabled={!allSelectedDrillIds.length}
                  onClick={() => {
                    allSelectedDrillIds.forEach((id) => props.onToggleSessionDrill(id, true));
                    setAllSelectedDrillIds([]);
                  }}
                  className="focus-ring min-h-14 rounded-xl bg-field px-4 py-3 text-base font-black text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Add Selected to Playlist
                </button>
                <button
                  type="button"
                  onClick={() => setAllSelectedDrillIds([])}
                  className="focus-ring min-h-14 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-base font-black text-ink hover:bg-slate-100"
                >
                  Clear Checks
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categorizedVisibleDrills.map(([category, drills], index) => {
            const visual = categoryVisual(category, index);
            const selectedIds = selectedCategoryDrills[category] ?? [];
            const selectedDrills = drills.filter((drill) => selectedIds.includes(drill.id));
            const previewDrill = selectedDrills[0];

            return (
              <article
                key={category}
                className="relative overflow-hidden rounded-2xl border-2 bg-white p-4 shadow-sm"
                style={{ borderColor: visual.border }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-35" style={{ background: visual.pattern }} />
                <div className="relative flex items-start gap-3">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-base font-black text-white shadow-sm" style={{ backgroundColor: visual.accent }}>
                    {visual.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-xl font-black leading-tight text-slate-900">{visual.title}</h4>
                        <p className="mt-1 text-sm font-extrabold leading-snug text-slate-800">{visual.subtitle}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-900">{drills.length} drills</span>
                    </div>
                    <div className="mt-3 grid gap-2">
                      <div className="max-h-48 overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-sm" role="group" aria-label={`Select drills from ${category}`}>
                        {drills.map((drill) => (
                          <label key={drill.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-base font-black text-slate-900 hover:bg-green-50">
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(drill.id)}
                              onChange={(event) =>
                                setSelectedCategoryDrills((current) => {
                                  const currentIds = current[category] ?? [];
                                  const nextIds = event.target.checked
                                    ? [...currentIds, drill.id]
                                    : currentIds.filter((id) => id !== drill.id);
                                  return { ...current, [category]: nextIds };
                                })
                              }
                              className="h-6 w-6 rounded border-slate-300"
                              style={{ accentColor: visual.accent }}
                            />
                            <span className="leading-snug">{drill.name}</span>
                          </label>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={!selectedDrills.length}
                          onClick={() => selectedDrills.forEach((drill) => props.onToggleSessionDrill(drill.id, true))}
                          className="focus-ring min-h-14 rounded-xl px-4 py-3 text-base font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ backgroundColor: visual.accent }}
                        >
                          Add Selected
                        </button>
                        <button
                          type="button"
                          disabled={!previewDrill}
                          onClick={() => previewDrill && props.onActivateDrill(previewDrill)}
                          className="focus-ring min-h-14 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-base font-black text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Preview
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          {!categorizedVisibleDrills.length && (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-sm font-bold text-ink md:col-span-2 xl:col-span-3">
              No drill categories match your search.
            </div>
          )}
        </div>
        <div className="pt-1 text-sm font-bold text-slate-800">{visibleDrills.length} of {props.drills.length} drills shown from Jordan 2.0 and the All Drills sheet.</div>
          </div>
          )}
        </div>
      </section>

    </div>
  );
}

function TrainingInstructions() {
  const steps = [
    { art: "choose" as const, badge: "01", stepLabel: "Step 1", badgeClass: "bg-field text-white", title: "Choose Drills", detail: "Pick your skills." },
    { art: "playlist" as const, badge: "02", stepLabel: "Step 2", badgeClass: "bg-[#f6c200] text-[#06233d]", title: "Build Playlist", detail: "Add drills in order." },
    { art: "start" as const, badge: "03", stepLabel: "Step 3", badgeClass: "bg-[#1683e8] text-white", title: "Start Training", detail: "Follow the video and timer." },
  ];

  return (
    <section className="mb-2 overflow-hidden rounded-3xl border-2 border-white bg-gradient-to-br from-green-500 via-lime-500 to-green-600 shadow-[0_12px_28px_rgba(21,128,61,0.18),inset_0_0_0_2px_rgba(21,128,61,0.14)]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap');`}</style>
      <div className="relative grid gap-3 p-3 font-['Fredoka',ui-sans-serif] text-[#06233d] sm:p-4 md:p-5">
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(90deg,rgba(255,255,255,0.1)_0_10%,transparent_10%_20%)]" />
        <SoccerFieldLines />
        <div className="relative z-[1] flex flex-col items-start gap-2 text-white sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#06233d] px-3 py-1 text-[11px] font-black uppercase tracking-wide shadow-[0_3px_0_rgba(23,33,27,0.18)]">
              Instructions
              <BouncingSoccerBall className="[--ball-size:1rem]" label="Small bouncing soccer ball" />
            </div>
            <h4 className="mt-1.5 text-2xl font-black leading-none [text-shadow:0_2px_0_#06233d] sm:text-3xl">How to Start Training</h4>
            <p className="mt-1 max-w-xl text-xs font-bold text-white/95 sm:text-sm">Choose your drills, build your playlist, and press Start.</p>
          </div>
        </div>
        <div className="relative z-[1] grid grid-cols-1 gap-2 sm:grid-cols-3 md:gap-3">
          {steps.map((step) => (
            <div key={step.title} className="relative min-h-[76px] rounded-2xl border-2 border-[#06233d] bg-white/95 p-2 shadow-[0_3px_0_#06233d,0_8px_12px_rgba(23,33,27,0.12)] sm:min-h-[90px]">
              <div
                className={`absolute -top-2 right-2 grid h-7 w-7 place-items-center rounded-full border-2 border-white text-[11px] font-black shadow-[0_0_0_2px_#06233d,0_3px_0_rgba(6,35,61,0.18)] sm:h-8 sm:w-8 sm:text-xs ${step.badgeClass}`}
              >
                {step.badge}
              </div>
              <InstructionArt type={step.art} />
              <div className="mt-1 text-sm font-black uppercase leading-none tracking-wide text-green-700 sm:text-base">{step.stepLabel}</div>
              <div className="text-base font-black leading-tight text-[#06233d] sm:text-lg">{step.title}</div>
              <p className="mt-0.5 text-[11px] font-bold leading-snug text-ink sm:text-xs">{step.detail}</p>
            </div>
          ))}
        </div>
        <div className="relative z-[1] justify-self-center rounded-full bg-white/95 px-4 py-1.5 text-xs font-black uppercase tracking-wide text-[#06233d] shadow-[0_4px_0_rgba(6,35,61,0.16)] sm:text-sm">
          Every touch counts.
        </div>
      </div>
    </section>
  );
}

function SoccerFieldLines() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-30" viewBox="0 0 100 58" preserveAspectRatio="none" aria-hidden="true">
      <rect x="3" y="4" width="94" height="50" rx="2" fill="none" stroke="white" strokeWidth="0.75" />
      <line x1="50" y1="4" x2="50" y2="54" stroke="white" strokeWidth="0.75" />
      <circle cx="50" cy="29" r="7.8" fill="none" stroke="white" strokeWidth="0.75" />
      <circle cx="50" cy="29" r="0.8" fill="white" />
      <rect x="3" y="16" width="16" height="26" fill="none" stroke="white" strokeWidth="0.75" />
      <rect x="3" y="22" width="7" height="14" fill="none" stroke="white" strokeWidth="0.75" />
      <circle cx="13" cy="29" r="0.65" fill="white" />
      <path d="M19 22a8 8 0 0 1 0 16" fill="none" stroke="white" strokeWidth="0.75" />
      <rect x="81" y="16" width="16" height="26" fill="none" stroke="white" strokeWidth="0.75" />
      <rect x="90" y="22" width="7" height="14" fill="none" stroke="white" strokeWidth="0.75" />
      <circle cx="87" cy="29" r="0.65" fill="white" />
      <path d="M81 22a8 8 0 0 0 0 16" fill="none" stroke="white" strokeWidth="0.75" />
      <path d="M3 9a5 5 0 0 0 5-5M97 9a5 5 0 0 1-5-5M3 49a5 5 0 0 1 5 5M97 49a5 5 0 0 0-5 5" fill="none" stroke="white" strokeWidth="0.75" />
    </svg>
  );
}

function InstructionArt({ type }: { type: "choose" | "playlist" | "start" }) {
  if (type === "choose") {
    return (
      <div className="relative h-9 overflow-hidden rounded-xl border border-green-200 bg-gradient-to-br from-green-50 via-white to-sky-50 sm:h-11">
        <div className="absolute inset-x-4 bottom-1.5 h-1 rounded-full bg-green-200" />
        <ConeIcon className="absolute bottom-1.5 left-4 h-6 w-5" shade="dark" />
        <ConeIcon className="absolute bottom-1.5 right-4 h-6 w-5" shade="light" />
        <WorldCupBall className="absolute left-1/2 top-1 h-7 w-7 -translate-x-1/2" />
        <div className="absolute bottom-1.5 left-1/2 h-6 w-9 -translate-x-1/2 rounded-md border border-[#06233d]/20 bg-white/80">
          <div className="absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full border border-[#06233d]" />
          <div className="absolute right-1.5 top-1.5 h-1 w-4 rounded bg-field" />
          <div className="absolute right-1.5 top-3.5 h-1 w-4 rounded bg-green-300" />
        </div>
      </div>
    );
  }

  if (type === "playlist") {
    return (
      <div className="relative h-9 overflow-hidden rounded-xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white sm:h-11">
        <div className="absolute left-1/2 top-4 h-4 w-12 -translate-x-1/2 rounded-md bg-[#06233d] sm:top-5" />
        <div className="absolute left-[38%] top-2 h-5 w-6 -rotate-6 rounded border border-[#06233d]/20 bg-white">
          <div className="absolute left-2 top-1.5 h-0 w-0 border-y-[4px] border-l-[7px] border-y-transparent border-l-field" />
        </div>
        <div className="absolute left-[51%] top-1.5 h-5 w-6 rotate-6 rounded border border-[#06233d]/20 bg-white">
          <div className="absolute left-2 top-1.5 h-0 w-0 border-y-[4px] border-l-[7px] border-y-transparent border-l-[#1683e8]" />
        </div>
        <div className="absolute left-1/2 top-[26px] -translate-x-1/2 text-[6px] font-black uppercase text-white sm:top-[30px]">Playlist</div>
        <div className="absolute bottom-1 left-1/2 grid h-3.5 w-3.5 -translate-x-1/2 place-items-center rounded-full bg-[#f6c200] text-[10px] font-black leading-none text-[#06233d]">+</div>
      </div>
    );
  }

  return (
    <div className="relative h-9 overflow-hidden rounded-xl border border-blue-200 bg-gradient-to-br from-field to-green-400 sm:h-11">
      <div className="absolute inset-y-0 left-1/2 w-px bg-white/45" />
      <div className="absolute left-1/2 top-1/2 h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-[#1683e8] shadow-[0_3px_0_rgba(6,35,61,0.16)]" />
      <div className="absolute left-1/2 top-1/2 h-0 w-0 -translate-x-[35%] -translate-y-1/2 border-y-[8px] border-l-[12px] border-y-transparent border-l-white drop-shadow-sm" />
      <div className="absolute bottom-1 right-2 rounded bg-white/90 px-1.5 py-0.5 text-[8px] font-black text-[#06233d]">00:30</div>
    </div>
  );
}

function ConeIcon({ className, shade }: { className: string; shade: "dark" | "light" }) {
  return (
    <div className={className}>
      <div className="absolute bottom-0 left-0 h-1.5 w-full rounded bg-[#c2410c]" />
      <div className={`absolute bottom-1 left-1/2 h-8 w-6 -translate-x-1/2 [clip-path:polygon(50%_0,100%_100%,0_100%)] ${shade === "dark" ? "bg-[#f97316]" : "bg-[#fb923c]"}`} />
      <div className="absolute bottom-4 left-1/2 h-1 w-4 -translate-x-1/2 rounded bg-white/90" />
      <div className="absolute bottom-6 left-1/2 h-1 w-3 -translate-x-1/2 rounded bg-white/90" />
    </div>
  );
}

function WorldCupBall({ className }: { className: string }) {
  return (
    <div className={`${className} rounded-full border-[3px] border-[#06233d] bg-white shadow-[0_4px_0_rgba(23,33,27,0.12)]`}>
      <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded bg-[#06233d]" />
      <div className="absolute left-2 top-2 h-2 w-2 rounded-full bg-[#2dd4bf]" />
      <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#2563eb]" />
      <div className="absolute bottom-2 left-2 h-2 w-2 rounded-full bg-[#ef4444]" />
      <div className="absolute bottom-2 right-2 h-2 w-2 rounded-full bg-[#facc15]" />
    </div>
  );
}

function PlayersPage({
  state,
  setState,
  selectedPlayerId,
  setSelectedPlayerId,
}: {
  state: TrackerState;
  setState: Dispatch<SetStateAction<TrackerState>>;
  selectedPlayerId: string;
  setSelectedPlayerId: (id: string) => void;
}) {
  const [draft, setDraft] = useState({ name: "", notes: "" });
  const selectedPlayer = state.players.find((player) => player.id === selectedPlayerId) ?? state.players[0];

  const addPlayer = () => {
    if (!draft.name.trim()) return;
    const player: Player = { id: crypto.randomUUID(), name: draft.name.trim(), notes: draft.notes.trim(), drillIds: [] };
    setState((current) => ({ ...current, players: [...current.players, player] }));
    setSelectedPlayerId(player.id);
    setDraft({ name: "", notes: "" });
  };

  return (
    <PageShell title="Players" description="Add, edit, and delete players. Assign drills from the drill page.">
      {selectedPlayer && (
        <section className="mb-5 flex items-center gap-5 rounded-lg border border-slate-300 bg-white p-4 shadow-soft">
          <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-300 bg-white">
            {selectedPlayer.photoDataUrl ? (
              <img src={selectedPlayer.photoDataUrl} alt={`${selectedPlayer.name} photo`} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-b-lg rounded-t-2xl bg-field text-2xl font-black text-white [clip-path:polygon(18%_12%,34%_0,66%_0,82%_12%,100%_22%,88%_42%,78%_36%,78%_100%,22%_100%,22%_36%,12%_42%,0_22%)]">
                10
              </div>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-3xl font-black">{selectedPlayer.name}</h3>
            <div className="mt-2 flex flex-wrap gap-4 text-sm font-semibold text-ink sm:gap-8">
              <span>Position: Midfielder</span>
              <span>Age: 6</span>
              <span>Foot: Right</span>
            </div>
            <p className="mt-2 text-sm font-semibold text-ink">{selectedPlayer.notes || "Selected player profile"}</p>
          </div>
        </section>
      )}
      <FormGrid>
        <TextField label="Player name" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} />
        <TextField label="Notes" value={draft.notes} onChange={(value) => setDraft({ ...draft, notes: value })} />
        <ActionButton onClick={addPlayer} icon={Plus}>
          Add Player
        </ActionButton>
      </FormGrid>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {state.players.map((player) => (
          <EditablePlayerCard
            key={player.id}
            player={player}
            selected={selectedPlayerId === player.id}
            onSelect={() => setSelectedPlayerId(player.id)}
            onSave={(updated) =>
              setState((current) => ({
                ...current,
                players: current.players.map((item) => (item.id === updated.id ? updated : item)),
              }))
            }
            onDelete={() =>
              setState((current) => ({
                ...current,
                players: current.players.filter((item) => item.id !== player.id),
              }))
            }
            allDrills={state.drills}
          />
        ))}
      </div>
    </PageShell>
  );
}

function DrillsPage({
  drills,
  setState,
  updateDrill,
  deleteDrill,
}: {
  drills: Drill[];
  setState: Dispatch<SetStateAction<TrackerState>>;
  updateDrill: (drill: Drill) => void;
  deleteDrill: (id: string) => void;
}) {
  const [draft, setDraft] = useState(emptyDrill);

  const addDrill = () => {
    if (!draft.name.trim()) return;
    const drill = { ...draft, id: crypto.randomUUID(), name: draft.name.trim() };
    setState((current) => ({
      ...current,
      drills: [drill, ...current.drills],
      players: current.players.map((player) => ({ ...player, drillIds: [...player.drillIds, drill.id] })),
    }));
    setDraft(emptyDrill);
  };

  return (
    <PageShell title="Drills" description="Manage drill names, tutorial video links, notes, completion, and ratings.">
      <FormGrid>
        <TextField label="Drill name" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} />
        <TextField label="Video link" value={draft.videoLink} onChange={(value) => setDraft({ ...draft, videoLink: value })} />
        <TextField label="Notes" value={draft.notes} onChange={(value) => setDraft({ ...draft, notes: value })} />
        <ActionButton onClick={addDrill} icon={Plus}>
          Add Drill
        </ActionButton>
      </FormGrid>
      <div className="mt-5 max-h-[520px] overflow-auto rounded-lg border border-slate-300 bg-white">
        {drills.map((drill) => (
          <DrillRow key={drill.id} drill={drill} onSave={updateDrill} onDelete={() => deleteDrill(drill.id)} />
        ))}
      </div>
    </PageShell>
  );
}

function SessionsPage({
  state,
  setState,
}: {
  state: TrackerState;
  setState: Dispatch<SetStateAction<TrackerState>>;
}) {
  const [draft, setDraft] = useState({
    playerId: state.players[0]?.id ?? "",
    date: new Date().toISOString().slice(0, 10),
    minutes: 30,
    completedDrills: 0,
    notes: "",
  });

  const addSession = () => {
    const session: Session = { ...draft, id: crypto.randomUUID(), minutes: Number(draft.minutes), completedDrills: Number(draft.completedDrills) };
    setState((current) => ({ ...current, sessions: [session, ...current.sessions] }));
    setDraft({ ...draft, notes: "" });
  };

  return (
    <PageShell title="Training Sessions" description="Log training time, completed drills, and coach notes.">
      <div className="grid gap-3 rounded-lg border border-slate-300 bg-white p-4 md:grid-cols-5">
        <select
          value={draft.playerId}
          onChange={(event) => setDraft({ ...draft, playerId: event.target.value })}
          className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {state.players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>
        <input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input type="number" value={draft.minutes} onChange={(event) => setDraft({ ...draft, minutes: Number(event.target.value) })} className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <input type="number" value={draft.completedDrills} onChange={(event) => setDraft({ ...draft, completedDrills: Number(event.target.value) })} className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <ActionButton onClick={addSession} icon={Save}>
          Save Session
        </ActionButton>
        <textarea
          value={draft.notes}
          onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
          placeholder="Session notes"
          className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-5"
        />
      </div>
      <div className="mt-5 space-y-3">
        {state.sessions.map((session) => (
          <div key={session.id} className="rounded-lg border border-slate-300 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <strong>{state.players.find((player) => player.id === session.playerId)?.name ?? "Player"}</strong>
              <span className="text-sm font-semibold text-ink">{session.date}</span>
            </div>
            <p className="mt-2 text-sm text-ink">
              {session.minutes} minutes, {session.completedDrills} completed drills
            </p>
            <p className="mt-1 text-sm font-semibold text-ink">{session.notes}</p>
          </div>
        ))}
      </div>
    </PageShell>
  );
}

function ProgressPage({ players, drills, sessions }: { players: Player[]; drills: Drill[]; sessions: Session[] }) {
  return (
    <PageShell title="Progress" description="Quick progress view by player and drill.">
      <div className="grid gap-4 lg:grid-cols-3">
        {players.map((player) => {
          const playerDrills = drills.filter((drill) => player.drillIds.includes(drill.id));
          const complete = playerDrills.filter((drill) => drill.completed).length;
          const percent = playerDrills.length ? Math.round((complete / playerDrills.length) * 100) : 0;
          const playerSessions = sessions.filter((session) => session.playerId === player.id);
          return (
            <section key={player.id} className="rounded-lg border border-slate-300 bg-white p-5 shadow-soft">
              <h3 className="text-xl font-bold">{player.name}</h3>
              <div className="mt-4 h-3 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-progress" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-3 text-sm text-ink">{percent}% complete</p>
              <p className="text-sm font-semibold text-ink">{playerSessions.reduce((sum, session) => sum + session.minutes, 0)} total training minutes</p>
              <div className="mt-4 space-y-2">
                {playerDrills.slice(0, 5).map((drill) => (
                  <div key={drill.id} className="flex justify-between rounded-md bg-white px-3 py-2 text-sm">
                    <span>{drill.name}</span>
                    <span>
                      {drill.countHistory?.[drill.countHistory.length - 1]?.count ?? (drill.completed ? "Done" : "Open")}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <button
        onClick={() => {
          resetState();
          window.location.reload();
        }}
        className="focus-ring mt-5 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-slate-100"
      >
        Reset to Excel sample data
      </button>
    </PageShell>
  );
}

function TimerPanel({
  seconds,
  running,
  duration,
  restDuration,
  onChooseDuration,
  onRestDurationChange,
  onStart,
  onPause,
  onReset,
  onNext,
  compact = false,
  countHistory = [],
  pendingCountSave = false,
  onSaveCountForSession,
  completedCount,
  totalDrills,
  progress,
}: {
  seconds: number;
  running: boolean;
  duration: number;
  restDuration: number;
  onChooseDuration: (seconds: number) => void;
  onRestDurationChange: (seconds: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onNext?: () => void;
  onSaveSession: () => void;
  compact?: boolean;
  countHistory?: DrillCountEntry[];
  pendingCountSave?: boolean;
  onSaveCountForSession?: () => void;
  completedCount?: number;
  totalDrills?: number;
  progress?: number;
}) {
  const lastSavedReps = countHistory[countHistory.length - 1]?.count;
  const details = lastSavedReps !== undefined ? `Reps: ${lastSavedReps}` : totalDrills && completedCount !== undefined && completedCount >= totalDrills && !running ? "Complete" : running ? "Running" : "Press Start";
  const timeLeftPercent = duration ? Math.max(0, Math.min(100, Math.round((seconds / duration) * 100))) : 0;

  if (compact) {
    return (
      <div>
        <div className="grid items-center gap-3 xl:grid-cols-[auto_minmax(260px,1fr)_auto_auto]">
          <h3 className="text-lg font-black uppercase text-field">Training Timer</h3>
          <div className="flex flex-wrap items-center gap-3">
            <label className="grid min-w-36 flex-1 gap-1 text-sm font-black text-ink sm:max-w-40">
              Countdown
              <select
                value={duration}
                onChange={(event) => onChooseDuration(Number(event.target.value))}
                className="focus-ring min-h-14 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-lg font-black text-ink"
              >
                <option value={60}>1:00</option>
                <option value={45}>0:45</option>
                <option value={30}>0:30</option>
              </select>
            </label>
            <label className="grid min-w-36 flex-1 gap-1 text-sm font-black text-ink sm:max-w-40">
              Rest
              <input
                type="number"
                min={15}
                max={30}
                value={restDuration}
                onChange={(event) => onRestDurationChange(Number(event.target.value))}
                className="focus-ring min-h-14 rounded-xl border-2 border-slate-300 bg-white px-4 py-3 text-lg font-black text-ink"
              />
            </label>
          </div>
          <div className="text-5xl font-black tracking-wider tabular-nums text-ink sm:text-6xl">{formatTimeHms(seconds)}</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <ActionButton onClick={onStart} icon={Play} disabled={running} compact>
              Start
            </ActionButton>
            <ActionButton onClick={onPause} icon={Clock3} disabled={!running} compact>
              Pause
            </ActionButton>
            <ActionButton onClick={onReset} icon={RotateCcw} variant="light" compact>
              Reset
            </ActionButton>
            <ActionButton onClick={onNext ?? (() => {})} icon={SkipForward} variant="light" disabled={!onNext} compact>
              Next
            </ActionButton>
          </div>
        </div>
        <div className="mt-4 h-4 overflow-hidden rounded-full bg-slate-200" aria-label="Countdown time left">
          <div className="h-full rounded-full bg-progress transition-[width] duration-200 ease-linear" style={{ width: `${timeLeftPercent}%` }} />
        </div>
        {pendingCountSave && onSaveCountForSession && (
          <button onClick={onSaveCountForSession} className="focus-ring mt-2 min-h-12 w-full rounded-md bg-field px-3 py-3 text-sm font-black text-white shadow-sm hover:bg-green-700">
            End Count & Save
          </button>
        )}
        {totalDrills !== undefined && progress !== undefined && (
          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-200 pt-3">
            <div className="rounded-xl border border-slate-300 bg-white p-2">
              <span className="block truncate text-[11px] font-black uppercase text-ink">Completed</span>
              <strong className="block text-lg leading-tight text-ink">{completedCount ?? 0}/{totalDrills}</strong>
            </div>
            <div className="rounded-xl border border-slate-300 bg-white p-2">
              <span className="block truncate text-[11px] font-black uppercase text-ink">Progress</span>
              <strong className="block text-lg leading-tight text-ink">{progress}%</strong>
            </div>
            <div className="rounded-xl border border-slate-300 bg-white p-2">
              <span className="block truncate text-[11px] font-black uppercase text-ink">Details</span>
              <strong className="block text-sm leading-tight text-ink">{details}</strong>
            </div>
          </div>
        )}
        {countHistory.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs font-bold text-ink">
            {countHistory
              .slice(-3)
              .reverse()
              .map((entry) => (
                <span key={entry.id} className="rounded-full border border-slate-300 bg-white px-2 py-1">
                  {entry.date}: {entry.count}
                </span>
              ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-black uppercase text-field">Training Timer</h3>
      <label className="mt-4 grid max-w-40 gap-1 text-sm font-black text-ink">
        Countdown
        <select
          value={duration}
          onChange={(event) => onChooseDuration(Number(event.target.value))}
          className="focus-ring min-h-11 rounded-md border border-slate-400 bg-white px-3 py-2 font-bold text-ink"
        >
          <option value={60}>1:00</option>
          <option value={45}>0:45</option>
          <option value={30}>0:30</option>
        </select>
      </label>
      <div className="my-10 text-7xl font-black tracking-wider tabular-nums text-ink sm:text-8xl">{formatTimeHms(seconds)}</div>
      <div className="mb-4 h-4 overflow-hidden rounded-full border border-slate-400 bg-slate-100" aria-label="Countdown time left">
        <div className="h-full rounded-full bg-progress transition-[width] duration-200 ease-linear" style={{ width: `${timeLeftPercent}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <ActionButton onClick={onStart} icon={Play} disabled={running}>
          Start
        </ActionButton>
        <ActionButton onClick={onPause} icon={Clock3} disabled={!running}>
          Pause
        </ActionButton>
        <ActionButton onClick={onReset} icon={RotateCcw} variant="light">
          Reset
        </ActionButton>
      </div>
    </div>
  );
}

function DrillRow({ drill, onSave, onDelete }: { drill: Drill; onSave: (drill: Drill) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(drill);

  useEffect(() => setDraft(drill), [drill]);

  if (editing) {
    return (
      <div className="grid gap-2 border-b border-slate-300 p-2 md:grid-cols-6">
        <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="focus-ring rounded-md border border-slate-300 px-2 py-1.5 text-xs md:col-span-2" />
        <input value={draft.videoLink} onChange={(event) => setDraft({ ...draft, videoLink: event.target.value })} className="focus-ring rounded-md border border-slate-300 px-2 py-1.5 text-xs md:col-span-2" />
        <input type="number" min={1} max={5} value={draft.rating} onChange={(event) => setDraft({ ...draft, rating: Number(event.target.value) })} className="focus-ring rounded-md border border-slate-300 px-2 py-1.5 text-xs" />
        <div className="flex gap-2">
          <IconButton label="Save" icon={Save} onClick={() => { onSave(draft); setEditing(false); }} />
          <IconButton label="Delete" icon={Trash2} onClick={onDelete} danger />
        </div>
        <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} className="focus-ring rounded-md border border-slate-300 px-2 py-1.5 text-xs md:col-span-6" />
      </div>
    );
  }

  return (
    <div className="grid gap-2 border-b border-slate-300 p-2 text-xs md:grid-cols-[auto_1fr_auto_auto_auto] md:items-center">
      <input type="checkbox" checked={drill.completed} onChange={(event) => onSave({ ...drill, completed: event.target.checked })} className="h-4 w-4 accent-field" />
      <div className="min-w-0">
        <div className="truncate font-semibold">{drill.name}</div>
        <div className="truncate text-ink">{drill.notes}</div>
      </div>
      <span className="text-ink">{drill.timer ? `${drill.timer} min` : "No timer"}</span>
      <span className="font-semibold text-field">{drill.rating}/5</span>
      <div className="flex gap-2">
        {drill.videoLink && (
          <a href={drill.videoLink} target="_blank" rel="noreferrer" className="focus-ring rounded-md border border-slate-300 p-2 text-ink hover:bg-slate-100" aria-label="Open video">
            <Video size={16} />
          </a>
        )}
        <IconButton label="Edit" icon={Edit3} onClick={() => setEditing(true)} />
        <IconButton label="Delete" icon={Trash2} onClick={onDelete} danger />
      </div>
    </div>
  );
}

function EditablePlayerCard({
  player,
  selected,
  onSelect,
  onSave,
  onDelete,
  allDrills,
}: {
  player: Player;
  selected: boolean;
  onSelect: () => void;
  onSave: (player: Player) => void;
  onDelete: () => void;
  allDrills: Drill[];
}) {
  const [draft, setDraft] = useState(player);

  useEffect(() => setDraft(player), [player]);

  const toggleDrill = (drillId: string) => {
    setDraft((current) => ({
      ...current,
      drillIds: current.drillIds.includes(drillId) ? current.drillIds.filter((id) => id !== drillId) : [...current.drillIds, drillId],
    }));
  };

  return (
    <section className={`rounded-lg border bg-white p-4 shadow-soft ${selected ? "border-field" : "border-slate-300"}`}>
      <div className="flex items-center justify-between gap-3">
        <button onClick={onSelect} className="text-left text-lg font-bold">
          {player.name}
        </button>
        <IconButton label="Delete player" icon={Trash2} onClick={onDelete} danger />
      </div>
      <div className="mt-3 grid gap-2">
        <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <div className="max-h-56 space-y-2 overflow-auto rounded-md border border-slate-300 p-3">
          <div className="text-sm font-semibold text-ink">Assigned drills</div>
          {allDrills.map((drill) => (
            <label key={drill.id} className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={draft.drillIds.includes(drill.id)} onChange={() => toggleDrill(drill.id)} className="h-4 w-4 accent-field" />
              {drill.name}
            </label>
          ))}
        </div>
        <ActionButton onClick={() => onSave(draft)} icon={Save} variant="light">
          Save Player
        </ActionButton>
      </div>
    </section>
  );
}

function VideoFrame({ url, playing = false, playRequest = 0, seconds = 0, duration = 60, onVideoPause }: { url: string; playing?: boolean; playRequest?: number; seconds?: number; duration?: number; onVideoPause?: () => void }) {
  const id = youtubeId(url);
  const [playerReady, setPlayerReady] = useState(false);
  const [tapPlaying, setTapPlaying] = useState(false);
  const lastVideoStartAtRef = useRef(0);
  const shouldPlay = playing || tapPlaying;
  const runnerProgress = duration > 0 ? Math.max(0, Math.min(1, 1 - seconds / duration)) : 0;

  useEffect(() => {
    setTapPlaying(false);
    setPlayerReady(false);
  }, [id]);

  useEffect(() => {
    if (!playRequest) return;
    lastVideoStartAtRef.current = Date.now();
    setTapPlaying(true);
    commandYouTubeFrame("playVideo");
    window.setTimeout(() => commandYouTubeFrame("playVideo"), 50);
    window.setTimeout(() => commandYouTubeFrame("playVideo"), 350);
    window.setTimeout(() => commandYouTubeFrame("playVideo"), 900);
  }, [playRequest]);

  useEffect(() => {
    if (!id) return;
    if (!shouldPlay) {
      commandYouTubeFrame("pauseVideo");
      setPlayerReady(false);
      return;
    }
    lastVideoStartAtRef.current = Date.now();
    window.setTimeout(() => commandYouTubeFrame("playVideo"), 250);
    window.setTimeout(() => commandYouTubeFrame("playVideo"), 800);
    window.setTimeout(() => commandYouTubeFrame("playVideo"), 1500);
  }, [id, shouldPlay]);

  useEffect(() => {
    if (!playing) {
      setTapPlaying(false);
      commandYouTubeFrame("pauseVideo");
    }
  }, [playing]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      let data = event.data;
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch {
          return;
        }
      }
      if (!data || data.event !== "infoDelivery") return;
      if (data.info?.playerState === 2 && playing) {
        if (Date.now() - lastVideoStartAtRef.current < 1600) return;
        onVideoPause?.();
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onVideoPause, playing]);

  if (!id) {
    return <div className="grid aspect-video place-items-center rounded-lg border border-dashed border-slate-300 bg-white text-sm text-ink">Add a YouTube video link to show it here.</div>;
  }
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-300 bg-slate-950">
      <iframe
        title="Tutorial video"
        src={youtubeEmbedUrl(id, shouldPlay)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        onLoad={() => {
          setPlayerReady(true);
          if (shouldPlay) lastVideoStartAtRef.current = Date.now();
          commandYouTubeFrame("playVideo");
          window.setTimeout(() => commandYouTubeFrame("playVideo"), 200);
        }}
        className={`absolute inset-0 h-full w-full border-0 ${playerReady ? "z-30" : "z-0"}`}
      />
      {id && !playerReady && <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" className="absolute inset-0 z-10 h-full w-full object-cover" />}
      {playing && (
        <div className="pointer-events-none absolute right-4 top-4 z-50 rounded-full border border-white/30 bg-slate-950/85 px-4 py-2 text-center text-white shadow-xl">
          <span className="block text-[10px] font-black uppercase tracking-[0.08em] text-green-200">Time left</span>
          <strong className="mt-1 block text-2xl font-black tabular-nums leading-none">{formatTimeHms(seconds)}</strong>
        </div>
      )}
      {playing && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 z-50">
          <div className="relative h-9 overflow-hidden rounded-full border border-white/30 bg-slate-950/75 shadow-xl">
            <div className="absolute left-3 right-[78px] top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/35" />
            <div
              className="absolute left-3 top-1/2 h-1 -translate-y-1/2 rounded-full bg-green-400 transition-[width] duration-200 ease-linear"
              style={{ width: `calc((100% - 90px) * ${runnerProgress})` }}
            />
            <div
              className="absolute top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center drop-shadow-md transition-[left] duration-200 ease-linear"
              style={{ left: `calc(12px + (100% - 90px) * ${runnerProgress})` }}
              aria-hidden="true"
            >
              <RunningKidBallIcon compact />
            </div>
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-black/35 px-2 py-1 text-xs font-black tabular-nums text-white">
              {formatTimeHms(seconds)}
            </div>
          </div>
        </div>
      )}
      {(!playerReady || (shouldPlay && isInAppPreviewBrowser())) && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => {
            event.preventDefault();
            lastVideoStartAtRef.current = Date.now();
            setTapPlaying(true);
            openCompanionVideoIfNeeded(url);
            commandYouTubeFrame("playVideo");
            window.setTimeout(() => commandYouTubeFrame("playVideo"), 100);
            window.setTimeout(() => commandYouTubeFrame("playVideo"), 500);
            window.setTimeout(() => commandYouTubeFrame("playVideo"), 1000);
          }}
          className="absolute inset-0 z-40 grid place-items-center bg-black/10 text-center text-sm font-black text-white"
        >
          <span className="grid justify-items-center gap-2">
            <RunningKidBallIcon />
            <span className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-white/95 text-field">
              <Play className="h-10 w-10 fill-current" />
            </span>
            {shouldPlay ? "Open video if this display blocks YouTube" : "Tap to play video"}
          </span>
        </a>
      )}
    </div>
  );
}

function RunningKidBallIcon({ compact = false }: { compact?: boolean }) {
  return (
    <svg className={compact ? "h-8 w-12" : "h-16 w-24 drop-shadow-lg"} viewBox="0 0 110 78" aria-hidden="true">
      <path d="M8 66h35M61 66h39" stroke="#d9fbe4" strokeWidth="4" strokeLinecap="round" opacity=".75" />
      <g transform="translate(76 0) scale(-1 1)">
        <circle cx="38" cy="17" r="10" fill="#fff" stroke="#0f5132" strokeWidth="4" />
        <path
          d="M37 29l-8 16 18-2 12-10M31 46l-15 14M47 43l7 19M31 36l-15-7M44 35l19 7"
          fill="none"
          stroke="#fff"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <circle cx="88" cy="58" r="13" fill="#fff" stroke="#0f5132" strokeWidth="4" />
      <path d="M88 49l5 4-2 7h-8l-2-7zM77 58l6-2M93 56l7-2M85 69l2-6M94 67l-4-5" fill="#0f5132" />
    </svg>
  );
}

function PageShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm font-semibold text-ink">{description}</p>
      </div>
      {children}
    </section>
  );
}

function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 rounded-lg border border-slate-300 bg-white p-4 md:grid-cols-4">{children}</div>;
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-black text-ink">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="focus-ring min-h-11 rounded-md border border-slate-400 bg-white px-3 py-2 text-sm font-bold text-ink" />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
      <div className="text-sm font-black text-ink">{label}</div>
      <div className="mt-1 text-2xl font-black text-ink">{value}</div>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  icon: Icon,
  disabled,
  variant = "solid",
  compact = false,
}: {
  children: ReactNode;
  onClick: () => void;
  icon: LucideIcon;
  disabled?: boolean;
  variant?: "solid" | "light";
  compact?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`focus-ring flex items-center justify-center gap-2 rounded-xl font-black shadow-sm disabled:cursor-not-allowed disabled:opacity-45 ${compact ? "min-h-14 px-5 py-3 text-base" : "min-h-14 px-5 py-3 text-base"} ${
        variant === "solid" ? "bg-field text-white hover:bg-green-700" : "border-2 border-slate-300 bg-white text-ink hover:bg-slate-100"
      }`}
    >
      <Icon size={compact ? 18 : 20} />
      {children}
    </button>
  );
}


function IconButton({ label, icon: Icon, onClick, danger = false }: { label: string; icon: LucideIcon; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className={`focus-ring min-h-11 min-w-11 rounded-md border p-2 font-black shadow-sm ${danger ? "border-danger bg-red-50 text-danger hover:bg-red-100" : "border-slate-400 bg-white text-ink hover:bg-slate-100"}`}>
      <Icon size={16} />
    </button>
  );
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function formatTimeHms(seconds: number) {
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}:${remainder}`;
}

function parseDurationLabel(value: string) {
  const text = String(value || "").toLowerCase();
  if (text.includes("30")) return 30;
  const numeric = Number(text.match(/\d+/)?.[0] || 1);
  return Math.max(1, numeric) * (text.includes("sec") ? 1 : 60);
}

function formatDuration(seconds = 60) {
  if (seconds < 60) return `${seconds} sec`;
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

function starText(rating: number) {
  return "★★★★★".slice(0, rating) + "☆☆☆☆☆".slice(0, Math.max(0, 5 - rating));
}

function averageRating(drills: Drill[]) {
  if (!drills.length) return 0;
  return (drills.reduce((sum, drill) => sum + Number(drill.rating || 0), 0) / drills.length).toFixed(1);
}

function youtubeId(url: string) {
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return match?.[1] ?? "";
}

function youtubeEmbedUrl(id: string, playing: boolean) {
  const params = new URLSearchParams({
    playsinline: "1",
    controls: "1",
    rel: "0",
    enablejsapi: "1",
    playlist: id,
  });
  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    params.set("origin", window.location.origin);
  }
  if (playing) {
    params.set("autoplay", "1");
    params.set("mute", "1");
    params.set("loop", "1");
  }
  const host = "www.youtube.com";
  return `https://${host}/embed/${id}?${params.toString()}`;
}

function commandYouTubeFrame(command: "playVideo" | "pauseVideo") {
  const frame = document.querySelector<HTMLIFrameElement>('iframe[title="Tutorial video"]');
  try {
    frame?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: "mute", args: [] }), "*");
    frame?.contentWindow?.postMessage(JSON.stringify({ event: "command", func: command, args: [] }), "*");
  } catch {
    // YouTube playback control is best-effort.
  }
}

function isInAppPreviewBrowser() {
  const ua = (navigator.userAgent || "").toLowerCase();
  return window.location.protocol === "file:" || ua.includes("electron") || ua.includes("codex") || ua.includes("openai") || window.top !== window.self;
}

function openCompanionVideoIfNeeded(url?: string) {
  if (!url || !isInAppPreviewBrowser()) return;
  window.open(url, "coachTrackerVideoPlayer");
}

type YouTubePlayer = {
  mute: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  loadVideoById: (videoId: string) => void;
};

declare global {
  interface Window {
    YT: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          playerVars: Record<string, string | number>;
          events: {
            onReady: (event: { target: YouTubePlayer }) => void;
            onStateChange: (event: { data: number; target: YouTubePlayer }) => void;
          };
        }
      ) => YouTubePlayer;
      PlayerState: { ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function ensureYouTubeApi(callback: () => void) {
  if (window.YT?.Player) {
    callback();
    return;
  }
  const previous = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = () => {
    previous?.();
    callback();
  };
  if (!document.getElementById("youtube-iframe-api")) {
    const script = document.createElement("script");
    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  }
}

function unlockAudio(audioRef: React.MutableRefObject<AudioContext | null>) {
  try {
    audioRef.current = audioRef.current ?? new AudioContext();
    if (audioRef.current.state === "suspended") void audioRef.current.resume();
  } catch {
    // Browser audio support is best-effort.
  }
}

function playTimerDoneSound(audioRef: React.MutableRefObject<AudioContext | null>) {
  try {
    unlockAudio(audioRef);
    const context = audioRef.current;
    if (!context) return;
    const now = context.currentTime;
    [0, 0.18, 0.36].forEach((offset) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, now + offset);
      gain.gain.setValueAtTime(0.0001, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.75, now + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.18);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + offset);
      oscillator.stop(now + offset + 0.2);
    });
  } catch {
    // Keep the timer working even if sound playback is blocked.
  }
}

export default App;
