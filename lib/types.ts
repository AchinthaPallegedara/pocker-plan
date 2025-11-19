export interface Player {
  id: string;
  name: string;
  vote: string | null;
  isSpectator: boolean;
}

export interface Room {
  id: string;
  name: string;
  players: Player[];
  revealed: boolean;
  createdAt: number;
}

export type VoteValue =
  | "0"
  | "1"
  | "2"
  | "3"
  | "5"
  | "8"
  | "13"
  | "21"
  | "34"
  | "55"
  | "89"
  | "?"
  | "☕";

export const VOTE_OPTIONS: VoteValue[] = [
  "0",
  "1",
  "2",
  "3",
  "5",
  "8",
  "13",
  "21",
  "34",
  "55",
  "89",
  "?",
  "☕",
];
