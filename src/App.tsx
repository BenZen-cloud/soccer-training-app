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
            <div className="grid h-12 w-12 place-items-center rounded-b-2xl rounded-t-lg border-4 border-field text-sm font-black text-field">
              CT
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wide">
                SOCCER <span className="text-field">TRAINING</span>
              </h1>
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-slate-500">Train Now. Every Touch Counts.</p>
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
  const visibleDrills = props.drills.filter((drill) => drill.name.toLowerCase().includes(drillSearch.trim().toLowerCase()));
  const uploadPlayerPhoto = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => props.onUpdatePlayerPhoto(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

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
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-black uppercase text-field">Tutorial Video</h3>
        </div>
        <div className="mb-4 grid items-start gap-3 md:grid-cols-[300px_0.8fr_1.2fr]">
          <label className="grid gap-1 text-sm font-bold text-slate-700 md:row-span-2">
            Player photo
            <div className="grid aspect-square cursor-pointer place-items-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 text-center text-xs font-black text-slate-500">
              {props.player.photoDataUrl ? (
                <img src={props.player.photoDataUrl} alt={`${props.player.name} photo`} className="h-full w-full object-cover" />
              ) : (
                <span>Add<br />player<br />photo</span>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(event) => uploadPlayerPhoto(event.target.files?.[0])} className="sr-only" />
          </label>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:col-span-2">
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
          <label className="grid gap-1 text-sm font-bold text-slate-700 md:col-span-2 md:col-start-2">
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
          <div className="w-full justify-self-center md:col-span-3 md:max-w-[820px]">
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
            <h3 className="text-xl font-black uppercase text-field">Drills</h3>
            <p className="mt-1 text-sm text-slate-500">Select drills here to add them to the playlist.</p>
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
        <div className="max-h-96 overflow-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[620px] border-collapse text-xs">
            <thead>
              <tr className="sticky top-0 border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase text-slate-700">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Playlist</th>
                <th className="px-2 py-2">Drill</th>
                <th className="px-2 py-2">Time</th>
                <th className="px-2 py-2">Count</th>
                <th className="px-2 py-2">Video</th>
              </tr>
            </thead>
            <tbody>
              {visibleDrills.map((drill, index) => (
                <tr key={drill.id} className="border-b border-slate-100">
                  <td className="px-2 py-1.5 font-bold">{index + 1}</td>
                  <td className="px-2 py-1.5">
                    <label className="inline-flex items-center gap-1.5 font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={props.sessionDrillIds.includes(drill.id)}
                        onChange={(event) => props.onToggleSessionDrill(drill.id, event.target.checked)}
                        className="h-4 w-4 accent-field"
                      />
                      Add
                    </label>
                  </td>
                  <td className="px-2 py-1.5">
                    <button
                      onClick={() => props.onActivateDrill(drill)}
                      className="focus-ring w-full rounded border border-slate-300 px-2 py-1.5 text-left font-bold"
                    >
                      {drill.name}
                    </button>
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      value={drill.timer || "1"}
                      onChange={(event) => props.onUpdateDrill({ ...drill, timer: event.target.value, durationSeconds: parseDurationLabel(event.target.value) })}
                      className="w-20 rounded border border-slate-300 px-2 py-1.5"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      value={drill.count ?? ""}
                      onChange={(event) => props.onUpdateDrill({ ...drill, count: event.target.value })}
                      placeholder="Count"
                      className="w-20 rounded border border-slate-300 px-2 py-1.5"
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    {drill.videoLink && (
                      <a href={drill.videoLink} target="_blank" rel="noreferrer" className="focus-ring inline-flex rounded-md border border-blue-600 px-2 py-1.5 font-bold text-blue-700">
                        Video
                      </a>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="pt-3 text-sm text-slate-500">{visibleDrills.length} of {props.drills.length} drills shown from Jordan 2.0 and the All Drills sheet.</div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <div>
            <h3 className="text-xl font-black uppercase text-field">Overall Session Rating</h3>
            <div className="my-5 text-5xl tracking-widest text-slate-400">☆ ☆ ☆ ☆ ☆</div>
            <button onClick={props.onSaveSession} className="focus-ring w-full rounded-md bg-blue-700 px-4 py-3 font-bold uppercase text-white hover:bg-blue-800">
              Save Session
            </button>
        </div>
      </section>
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
      <div className={`${compact ? "mt-2 gap-1.5" : "mt-4 gap-2"} flex flex-wrap`}>
        {[60, 45, 30].map((option) => (
          <button
            key={option}
            onClick={() => onChooseDuration(option)}
            className={`focus-ring rounded-md font-bold ${compact ? "px-2.5 py-1.5 text-xs" : "px-3 py-2 text-sm"} ${duration === option ? "bg-field text-white" : "border border-slate-300 bg-white text-slate-700"}`}
          >
            {formatTime(option)}
          </button>
        ))}
      </div>
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
