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
    groups.set(category, [...(groups.get(category) ?? []), drill]);
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
    if (!nextDrill) return;
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
          } else {
            saveCurrentCountForSession();
            setResting(false);
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
          saveCurrentCountForSession();
          setResting(false);
          advanceToNextPlaylistDrill(true);
          return restDuration;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [resting, restDuration]);

  return (
    <div className="min-h-screen bg-[#f7faf8] text-ink">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-full border-4 border-field bg-white shadow-sm" aria-label="Soccer ball">
              <div className="h-8 w-8 rounded-full border-2 border-slate-900 bg-white [background:radial-gradient(circle_at_50%_50%,#111_0_16%,transparent_17%),linear-gradient(36deg,transparent_41%,#111_42%_46%,transparent_47%),linear-gradient(108deg,transparent_41%,#111_42%_46%,transparent_47%),linear-gradient(180deg,transparent_41%,#111_42%_46%,transparent_47%),linear-gradient(252deg,transparent_41%,#111_42%_46%,transparent_47%),linear-gradient(324deg,transparent_41%,#111_42%_46%,transparent_47%)]" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wide">
                SOCCER <span className="text-field">TRAINING</span>
              </h1>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Every Move Has A Purpose. Every Touch Counts.</p>
            </div>
          </div>
          <button className="rounded-md p-2 text-3xl leading-none text-slate-800" aria-label="Menu">
            <Menu size={34} />
          </button>
          <nav className="fixed bottom-0 left-1/2 z-20 grid w-full max-w-5xl -translate-x-1/2 grid-cols-5 border-x border-t border-slate-200 bg-white/95 backdrop-blur">
            {pages.map(({ name, icon: Icon }) => (
              <button
                key={name}
                onClick={() => {
                  setPage(name);
                  if (name === "Home") window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`focus-ring flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-semibold ${
                  page === name ? "bg-white text-field shadow-[inset_0_4px_0_#15803d]" : "bg-white text-slate-700 hover:bg-slate-50"
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
            }}
            onStartPlaylist={() => {
              const first = orderedSessionDrills[0] ?? selectedVideoDrill ?? playerDrills.find((drill) => drill.videoLink);
              if (!first) return;
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
            onUpdateDrillDuration={(drill, minutes) => {
              const durationSeconds = Math.max(1, minutes) * 60;
              updateDrill({ ...drill, durationSeconds, timer: String(minutes) });
              if (selectedVideoDrill?.id === drill.id) {
                setDuration(durationSeconds);
                setSeconds(durationSeconds);
                setRunning(false);
                setPendingCountSave(false);
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
            }}
            onRestDurationChange={(nextRestDuration) => {
              const clamped = Math.min(30, Math.max(15, nextRestDuration));
              setRestDuration(clamped);
              if (!resting) setRestSeconds(clamped);
            }}
            onStart={() => {
              unlockAudio(audioRef);
              if (seconds <= 0) setSeconds(duration);
              setResting(false);
              setRunning(true);
            }}
            onPause={() => setRunning(false)}
            onReset={() => {
              setRunning(false);
              setResting(false);
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
          <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
            <h3 className="text-xl font-black uppercase text-field">{restDuration} Second Rest</h3>
            <div className="my-5 text-6xl font-black tabular-nums text-slate-900">{formatTimeHms(restSeconds)}</div>
            <label className="mb-4 grid gap-1 text-left text-sm font-bold text-slate-700">
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
            <p className="mb-5 text-sm text-slate-600">Type the reps now. The next playlist video starts when rest ends.</p>
            <button
              onClick={() => {
                saveCurrentCountForSession();
                setResting(false);
                advanceToNextPlaylistDrill(true);
              }}
              className="focus-ring w-full rounded-md bg-field px-4 py-3 text-sm font-bold text-white hover:bg-green-700"
            >
              Save Reps & Continue
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
  { background: "linear-gradient(135deg, #effaf3 0%, #d7f2e1 100%)", border: "#bbdfc8", accent: "#15803d" },
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
      accent: "#15803d",
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
      title: normalized.includes("turn") ? "Turns & Dribbling" : "Dribbling",
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
  const [selectedCategoryDrills, setSelectedCategoryDrills] = useState<Record<string, string>>({});
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
      <section className="flex items-center gap-6">
        <div className="grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-white">
          {props.player.photoDataUrl ? (
            <img src={props.player.photoDataUrl} alt={`${props.player.name} photo`} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-16 w-16 place-items-center rounded-b-lg rounded-t-2xl bg-field text-2xl font-black text-white [clip-path:polygon(18%_12%,34%_0,66%_0,82%_12%,100%_22%,88%_42%,78%_36%,78%_100%,22%_100%,22%_36%,12%_42%,0_22%)]">
              10
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-4xl font-black">{props.player.name}</h2>
          <div className="mt-3 flex flex-wrap gap-5 text-sm text-slate-600 sm:gap-10">
            <span>Position: Midfielder</span>
            <span>Age: 6</span>
            <span>Foot: Right</span>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-black uppercase text-field">Tutorial Video</h3>
        </div>
        <div className="mb-4 grid items-start gap-3 md:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
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
          <label className="grid gap-1 text-sm font-bold text-slate-700">
            Drill video
            <select
              value={videoDrill?.id || ""}
              onChange={(event) => {
                const drill = props.drills.find((item) => item.id === event.target.value);
                if (drill) props.onActivateDrill(drill);
              }}
              className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal"
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
          <div className="w-full justify-self-center md:col-span-2 md:max-w-[820px]">
            <TrainingInstructions />
            <VideoFrame url={videoDrill?.videoLink || props.featuredVideo} playing={props.running} playRequest={props.playRequest} />
          </div>
          <details className="group rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2">
            <summary className="focus-ring flex cursor-pointer list-none items-center justify-between gap-3 rounded-md px-1 py-1">
              <span>
                <span className="block text-sm font-bold text-slate-700">Training playlist</span>
                <span className="text-xs text-slate-500">
                  {props.sessionDrillIds.length ? `${props.sessionDrillIds.length} selected` : "Select drills below"}
                </span>
              </span>
              <span className="text-sm font-black text-field group-open:rotate-180">⌄</span>
            </summary>
            <div className="mt-3 flex flex-wrap justify-end gap-1.5">
              <button onClick={props.onClearPlaylist} className="focus-ring rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
                Clear All
              </button>
              <button onClick={props.onStartPlaylist} className="focus-ring rounded-md bg-field px-3 py-2 text-sm font-bold text-white hover:bg-green-700">
                Start Playlist
              </button>
            </div>
            <div className="mt-2 grid max-h-72 gap-1.5 overflow-auto">
              {props.sessionDrillIds
                .map((id) => props.drills.find((drill) => drill.id === id))
                .filter((drill): drill is Drill => Boolean(drill))
                .map((drill, index) => (
                <div
                  key={drill.id}
                  className={`grid grid-cols-[1.75rem_minmax(0,1fr)_4.5rem_auto_auto] items-center gap-1.5 rounded-md border bg-white px-2 py-1.5 text-xs ${
                    videoDrill?.id === drill.id ? "border-field shadow-[inset_4px_0_0_#15803d]" : "border-slate-200"
                  }`}
                >
                  <span className="font-black text-slate-500">{index + 1}</span>
                  <button onClick={() => props.onActivateDrill(drill)} className="truncate rounded border border-slate-200 px-2 py-1 text-left font-bold">
                    {drill.name}
                  </button>
                  <label className="grid gap-0.5 text-[11px] font-bold text-slate-600">
                    Min
                    <input
                      type="number"
                      min={1}
                      value={Math.round((drill.durationSeconds || 60) / 60)}
                      onChange={(event) => props.onUpdateDrillDuration(drill, Number(event.target.value))}
                      className="focus-ring w-full rounded border border-slate-300 px-1.5 py-1 text-xs font-normal"
                    />
                  </label>
                  <span className="flex gap-1">
                    <button onClick={() => props.onMoveSessionDrill(drill.id, -1)} className="rounded border border-slate-300 px-2 py-1" aria-label="Move drill up">
                      ↑
                    </button>
                    <button onClick={() => props.onMoveSessionDrill(drill.id, 1)} className="rounded border border-slate-300 px-2 py-1" aria-label="Move drill down">
                      ↓
                    </button>
                  </span>
                  <button
                    onClick={() => props.onToggleSessionDrill(drill.id, false)}
                    className="rounded border border-red-200 px-2 py-1 font-bold text-red-700"
                    aria-label={`Remove ${drill.name} from playlist`}
                  >
                    Remove
                  </button>
                </div>
              ))}
              {props.sessionDrillIds.length === 0 && <div className="rounded-md border border-dashed border-slate-300 px-3 py-2 text-sm text-slate-500">Select drills from the player or drill pages.</div>}
            </div>
          </details>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black uppercase text-field">Playlist Selection</h3>
            <p className="mt-1 text-sm text-slate-500">Choose a category, select a drill, and add it to your training playlist.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-center">
              <span className="block text-[10px] font-black uppercase text-green-700">Selected</span>
              <strong className="block text-lg leading-none text-field">{props.sessionDrillIds.length}</strong>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center">
              <span className="block text-[10px] font-black uppercase text-slate-600">Minutes</span>
              <strong className="block text-lg leading-none text-slate-900">{playlistMinutes}</strong>
            </div>
            <button className="focus-ring rounded-md border border-blue-600 px-3 py-2 text-sm font-bold uppercase text-blue-700 hover:bg-blue-50">
              + Add Drill
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
              <span className="block text-xs font-semibold text-slate-600">
                {playlist.drills.length} drills - {playlist.detail}
              </span>
            </button>
          ))}
        </div>
        <label className="mb-3 grid gap-1 text-sm font-bold text-slate-700">
          Search drills
          <input
            type="search"
            value={drillSearch}
            onChange={(event) => setDrillSearch(event.target.value)}
            placeholder="Type a drill name..."
            className="focus-ring rounded-md border border-slate-300 px-3 py-2 font-normal"
          />
        </label>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {categorizedVisibleDrills.map(([category, drills], index) => {
            const visual = categoryVisual(category, index);
            const selectedId = selectedCategoryDrills[category] ?? "";
            const selectedDrill = drills.find((drill) => drill.id === selectedId);

            return (
              <article
                key={category}
                className="relative overflow-hidden rounded-xl border p-3 shadow-sm"
                style={{ background: visual.background, borderColor: visual.border }}
              >
                <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: visual.pattern }} />
                <div className="relative flex items-start gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-sm font-black text-white shadow-sm" style={{ backgroundColor: visual.accent }}>
                    {visual.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-black text-slate-900">{visual.title}</h4>
                        <p className="mt-0.5 text-xs font-semibold text-slate-600">{visual.subtitle}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/80 px-2 py-1 text-[11px] font-black text-slate-700">{drills.length} drills</span>
                    </div>
                    <div className="mt-3 grid gap-2">
                      <select
                        value={selectedId}
                        onChange={(event) => setSelectedCategoryDrills((current) => ({ ...current, [category]: event.target.value }))}
                        className="focus-ring rounded-md border border-white/70 bg-white px-3 py-2 text-sm font-bold text-slate-800 shadow-sm"
                      >
                        <option value="">Select a drill</option>
                        {drills.map((drill) => (
                          <option key={drill.id} value={drill.id}>
                            {drill.name}
                          </option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          disabled={!selectedDrill}
                          onClick={() => selectedDrill && props.onToggleSessionDrill(selectedDrill.id, true)}
                          className="focus-ring rounded-md px-3 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
                          style={{ backgroundColor: visual.accent }}
                        >
                          Add to Playlist
                        </button>
                        <button
                          type="button"
                          disabled={!selectedDrill}
                          onClick={() => selectedDrill && props.onActivateDrill(selectedDrill)}
                          className="focus-ring rounded-md border border-white/80 bg-white/90 px-3 py-2 text-sm font-black text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
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
            <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-sm font-semibold text-slate-500 md:col-span-2 xl:col-span-3">
              No drill categories match your search.
            </div>
          )}
        </div>
        <div className="pt-3 text-sm text-slate-500">{visibleDrills.length} of {props.drills.length} drills shown from Jordan 2.0 and the All Drills sheet.</div>
      </section>

    </div>
  );
}

function TrainingInstructions() {
  const steps = [
    { icon: "⚽", title: "Choose your drills", detail: "Pick the skills you want to train today." },
    { icon: "+", title: "Add to playlist", detail: "Build a quick practice lineup." },
    { icon: "▶", title: "Press Start", detail: "Train when you're ready." },
  ];

  return (
    <section className="mb-4 overflow-hidden rounded-2xl border-2 border-green-200 bg-[#eefbf2] shadow-[0_12px_30px_rgba(21,128,61,0.12)]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap');`}</style>
      <div className="relative grid gap-4 p-4 font-['Fredoka',ui-sans-serif] text-slate-900 sm:p-5">
        <div className="pointer-events-none absolute inset-x-4 top-1/2 h-px bg-white/80" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-white/80" />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex rounded-full bg-field px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              Instructions
            </div>
            <h4 className="mt-2 text-2xl font-bold leading-tight text-field sm:text-3xl">Ready to train?</h4>
          </div>
          <div className="hidden rounded-full bg-white px-4 py-2 text-sm font-bold text-field shadow-sm sm:block">Every touch counts</div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="relative rounded-xl border border-green-200 bg-white/90 p-3 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-field text-lg font-bold text-white">{step.icon}</span>
                <span className="text-xs font-bold uppercase text-green-700">Step {index + 1}</span>
              </div>
              <div className="text-lg font-bold leading-tight">{step.title}</div>
              <p className="mt-1 text-sm font-medium leading-snug text-slate-600">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
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

  const addPlayer = () => {
    if (!draft.name.trim()) return;
    const player: Player = { id: crypto.randomUUID(), name: draft.name.trim(), notes: draft.notes.trim(), drillIds: [] };
    setState((current) => ({ ...current, players: [...current.players, player] }));
    setSelectedPlayerId(player.id);
    setDraft({ name: "", notes: "" });
  };

  return (
    <PageShell title="Players" description="Add, edit, and delete players. Assign drills from the drill page.">
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
      <div className="mt-5 max-h-[520px] overflow-auto rounded-lg border border-slate-200 bg-white">
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
      <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
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
          <div key={session.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <strong>{state.players.find((player) => player.id === session.playerId)?.name ?? "Player"}</strong>
              <span className="text-sm text-slate-500">{session.date}</span>
            </div>
            <p className="mt-2 text-sm text-slate-700">
              {session.minutes} minutes, {session.completedDrills} completed drills
            </p>
            <p className="mt-1 text-sm text-slate-600">{session.notes}</p>
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
            <section key={player.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
              <h3 className="text-xl font-bold">{player.name}</h3>
              <div className="mt-4 h-3 rounded-full bg-slate-100">
                <div className="h-3 rounded-full bg-field" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-3 text-sm text-slate-700">{percent}% complete</p>
              <p className="text-sm text-slate-600">{playerSessions.reduce((sum, session) => sum + session.minutes, 0)} total training minutes</p>
              <div className="mt-4 space-y-2">
                {playerDrills.slice(0, 5).map((drill) => (
                  <div key={drill.id} className="flex justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
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
        className="focus-ring mt-5 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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

  return (
    <div className={compact ? "relative" : ""}>
      <h3 className={`${compact ? "text-sm" : "text-lg"} font-black uppercase text-field`}>Training Timer</h3>
      <label className={`${compact ? "mt-2 max-w-32 text-xs" : "mt-4 max-w-40 text-sm"} grid gap-1 font-bold text-slate-700`}>
        Countdown
        <select
          value={duration}
          onChange={(event) => onChooseDuration(Number(event.target.value))}
          className="focus-ring rounded-md border border-slate-300 bg-white px-2 py-1.5 font-normal"
        >
          <option value={60}>1:00</option>
          <option value={45}>0:45</option>
          <option value={30}>0:30</option>
        </select>
      </label>
      {compact && (
        <label className="mt-2 grid max-w-32 gap-1 text-xs font-bold text-slate-700">
          Rest seconds
          <input
            type="number"
            min={15}
            max={30}
            value={restDuration}
            onChange={(event) => onRestDurationChange(Number(event.target.value))}
            className="focus-ring rounded-md border border-slate-300 px-2 py-1.5 text-sm font-normal"
          />
        </label>
      )}
      <div className={`${compact ? "my-2 text-3xl" : "my-10 text-6xl sm:text-7xl"} font-black tracking-wider tabular-nums text-slate-900`}>{formatTimeHms(seconds)}</div>
      <div className={`${compact ? "mb-2 h-3" : "mb-4 h-4"} overflow-hidden rounded-full border border-slate-300 bg-slate-200`} aria-label="Countdown time left">
        <div className="h-full rounded-full bg-field transition-[width] duration-200 ease-linear" style={{ width: `${timeLeftPercent}%` }} />
      </div>
      <div className={`grid grid-cols-3 ${compact ? "gap-1.5" : "gap-2"}`}>
        <ActionButton onClick={onStart} icon={Play} disabled={running} compact={compact}>
          Start
        </ActionButton>
        <ActionButton onClick={onPause} icon={Clock3} disabled={!running} compact={compact}>
          Pause
        </ActionButton>
        <ActionButton onClick={onReset} icon={RotateCcw} variant="light" compact={compact}>
          Reset
        </ActionButton>
      </div>
      {compact && pendingCountSave && onSaveCountForSession && (
        <button onClick={onSaveCountForSession} className="focus-ring mt-2 w-full rounded-md bg-field px-3 py-2 text-sm font-bold text-white hover:bg-green-700">
          End Count & Save
        </button>
      )}
      {compact && totalDrills !== undefined && progress !== undefined && (
        <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-slate-200 pt-2">
          <div className="rounded-md border border-slate-200 bg-white p-1.5">
            <span className="block truncate text-[10px] font-black uppercase text-slate-500">Completed</span>
            <strong className="block text-base leading-tight text-slate-900">{completedCount ?? 0}/{totalDrills}</strong>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-1.5">
            <span className="block truncate text-[10px] font-black uppercase text-slate-500">Progress</span>
            <strong className="block text-base leading-tight text-slate-900">{progress}%</strong>
          </div>
          <div className="rounded-md border border-slate-200 bg-white p-1.5">
            <span className="block truncate text-[10px] font-black uppercase text-slate-500">Details</span>
            <strong className="block text-xs leading-tight text-slate-900">{details}</strong>
          </div>
          <div className="col-span-3 h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-field" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
      {compact && countHistory.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-slate-600">
          {countHistory
            .slice(-3)
            .reverse()
            .map((entry) => (
              <span key={entry.id} className="rounded-full border border-slate-200 bg-white px-2 py-1">
                {entry.date}: {entry.count}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

function DrillRow({ drill, onSave, onDelete }: { drill: Drill; onSave: (drill: Drill) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(drill);

  useEffect(() => setDraft(drill), [drill]);

  if (editing) {
    return (
      <div className="grid gap-2 border-b border-slate-200 p-2 md:grid-cols-6">
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
    <div className="grid gap-2 border-b border-slate-200 p-2 text-xs md:grid-cols-[auto_1fr_auto_auto_auto] md:items-center">
      <input type="checkbox" checked={drill.completed} onChange={(event) => onSave({ ...drill, completed: event.target.checked })} className="h-4 w-4 accent-field" />
      <div className="min-w-0">
        <div className="truncate font-semibold">{drill.name}</div>
        <div className="truncate text-slate-600">{drill.notes}</div>
      </div>
      <span className="text-slate-600">{drill.timer ? `${drill.timer} min` : "No timer"}</span>
      <span className="font-semibold text-field">{drill.rating}/5</span>
      <div className="flex gap-2">
        {drill.videoLink && (
          <a href={drill.videoLink} target="_blank" rel="noreferrer" className="focus-ring rounded-md border border-slate-300 p-2 text-slate-700 hover:bg-slate-50" aria-label="Open video">
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
    <section className={`rounded-lg border bg-white p-4 shadow-soft ${selected ? "border-field" : "border-slate-200"}`}>
      <div className="flex items-center justify-between gap-3">
        <button onClick={onSelect} className="text-left text-lg font-bold">
          {player.name}
        </button>
        <IconButton label="Delete player" icon={Trash2} onClick={onDelete} danger />
      </div>
      <div className="mt-3 grid gap-2">
        <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <div className="max-h-56 space-y-2 overflow-auto rounded-md border border-slate-200 p-3">
          <div className="text-sm font-semibold text-slate-700">Assigned drills</div>
          {allDrills.map((drill) => (
            <label key={drill.id} className="flex items-center gap-2 text-sm text-slate-700">
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

function VideoFrame({ url, playing = false, playRequest = 0 }: { url: string; playing?: boolean; playRequest?: number }) {
  const id = youtubeId(url);
  const [playerReady, setPlayerReady] = useState(false);
  const [tapPlaying, setTapPlaying] = useState(false);
  const shouldPlay = playing || tapPlaying;

  useEffect(() => {
    setTapPlaying(false);
    setPlayerReady(false);
  }, [id]);

  useEffect(() => {
    if (!playRequest) return;
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
    window.setTimeout(() => commandYouTubeFrame("playVideo"), 250);
    window.setTimeout(() => commandYouTubeFrame("playVideo"), 800);
    window.setTimeout(() => commandYouTubeFrame("playVideo"), 1500);
  }, [id, shouldPlay]);

  if (!id) {
    return <div className="grid aspect-video place-items-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">Add a YouTube video link to show it here.</div>;
  }
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
      <iframe
        title="Tutorial video"
        src={youtubeEmbedUrl(id, shouldPlay)}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        onLoad={() => {
          setPlayerReady(true);
          commandYouTubeFrame("playVideo");
          window.setTimeout(() => commandYouTubeFrame("playVideo"), 200);
        }}
        className={`absolute inset-0 h-full w-full border-0 ${playerReady ? "z-30" : "z-0"}`}
      />
      {id && !playerReady && <img src={`https://img.youtube.com/vi/${id}/hqdefault.jpg`} alt="" className="absolute inset-0 z-10 h-full w-full object-cover" />}
      {(!playerReady || (shouldPlay && isInAppPreviewBrowser())) && (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => {
            event.preventDefault();
            setTapPlaying(true);
            openCompanionVideoIfNeeded(url);
            commandYouTubeFrame("playVideo");
            window.setTimeout(() => commandYouTubeFrame("playVideo"), 100);
            window.setTimeout(() => commandYouTubeFrame("playVideo"), 500);
            window.setTimeout(() => commandYouTubeFrame("playVideo"), 1000);
          }}
          className="absolute inset-0 z-40 grid place-items-center bg-black/10 text-center text-sm font-black text-white"
        >
          <span>
            <span className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-white/95 text-4xl text-field">▶</span>
            {shouldPlay ? "Open video if this display blocks YouTube" : "Tap to play video"}
          </span>
        </a>
      )}
    </div>
  );
}

function PageShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-5">
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      {children}
    </section>
  );
}

function FormGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">{children}</div>;
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-1 text-sm font-medium text-slate-700">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm font-normal" />
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
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
      className={`focus-ring flex items-center justify-center gap-2 rounded-md font-semibold disabled:cursor-not-allowed disabled:opacity-45 ${compact ? "px-2 py-1.5 text-xs" : "px-3 py-2 text-sm"} ${
        variant === "solid" ? "bg-field text-white hover:bg-green-700" : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon size={16} />
      {children}
    </button>
  );
}


function IconButton({ label, icon: Icon, onClick, danger = false }: { label: string; icon: LucideIcon; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick} aria-label={label} title={label} className={`focus-ring rounded-md border p-2 ${danger ? "border-red-200 text-red-600 hover:bg-red-50" : "border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
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
