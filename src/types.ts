export type Drill = {
  id: string;
  name: string;
  videoLink: string;
  notes: string;
  completed: boolean;
  rating: number;
  count?: string;
  countHistory?: DrillCountEntry[];
  timer: string;
  durationSeconds?: number;
  assigned: boolean;
  low?: number;
  high?: number;
  average?: number;
  goal?: number;
  latest?: number;
  entries?: number;
};

export type DrillCountEntry = {
  id: string;
  date: string;
  count: number;
  sessionId?: string;
};

export type Player = {
  id: string;
  name: string;
  notes: string;
  drillIds: string[];
  photoDataUrl?: string;
};

export type Session = {
  id: string;
  playerId: string;
  date: string;
  minutes: number;
  completedDrills: number;
  notes: string;
};
