export interface Game {
  id: string;
  name: string;
  image: string;
  genre?: string;
  year?: number;
  rating?: number;
}

export interface RankingItem {
  id: string;
  game: Game;
  position: number;
  tier?: string;
}

export type RankingMode = "top" | "tier";

export interface Ranking {
  id: string;
  title: string;
  mode: RankingMode;
  items: RankingItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TierConfig {
  id: string;
  name: string;
  color: string;
  maxItems?: number;
}

export const DEFAULT_TIERS: TierConfig[] = [
  { id: "t1", name: "T1", color: "from-red-500 to-red-600" },
  { id: "t2", name: "T2", color: "from-orange-500 to-orange-600" },
  { id: "t3", name: "T3", color: "from-yellow-500 to-yellow-600" },
  { id: "t4", name: "T4", color: "from-green-500 to-green-600" },
  { id: "t5", name: "T5", color: "from-blue-500 to-blue-600" },
];
