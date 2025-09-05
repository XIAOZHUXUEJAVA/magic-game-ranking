import { create } from "zustand";
import { Game, RankingItem, RankingMode } from "@/types/game";

interface RankingStore {
  // 状态
  mode: RankingMode;
  items: RankingItem[];
  searchQuery: string;
  selectedTier: string | null;

  // 操作
  setMode: (mode: RankingMode) => void;
  addGame: (game: Game, tier?: string) => void;
  removeGame: (gameId: string) => void;
  moveGame: (gameId: string, newPosition: number, newTier?: string) => void;
  reorderItems: (items: RankingItem[]) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTier: (tier: string | null) => void;
  clearRanking: () => void;

  // 辅助方法
  getItemsByTier: (tier: string) => RankingItem[];
  getTopItems: (count: number) => RankingItem[];
}

export const useRankingStore = create<RankingStore>((set, get) => ({
  // 初始状态
  mode: "top",
  items: [],
  searchQuery: "",
  selectedTier: null,

  // 操作实现
  setMode: (mode) => set({ mode, items: [] }), // 切换模式时清空列表

  addGame: (game, tier) => {
    const { items, mode } = get();
    const existingItem = items.find((item) => item.game.id === game.id);

    if (existingItem) return; // 游戏已存在

    // 生成更唯一的ID，包含随机数避免冲突
    const uniqueId = `${game.id}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const newItem: RankingItem = {
      id: uniqueId,
      game,
      position: items.length + 1,
      tier: mode === "tier" ? tier || "t1" : undefined,
    };

    console.log(
      `🎮 添加新游戏: ${game.name} (ID: ${uniqueId}) 到 ${tier || "top"} 模式`
    );
    set({ items: [...items, newItem] });
  },

  removeGame: (gameId) => {
    const { items } = get();
    const filteredItems = items.filter((item) => item.game.id !== gameId);
    // 重新排序位置
    const reorderedItems = filteredItems.map((item, index) => ({
      ...item,
      position: index + 1,
    }));
    set({ items: reorderedItems });
  },

  moveGame: (gameId, newPosition, newTier) => {
    const { items } = get();
    const itemIndex = items.findIndex((item) => item.game.id === gameId);

    if (itemIndex === -1) return;

    const updatedItems = [...items];
    const item = updatedItems[itemIndex];

    // 更新位置和梯队
    updatedItems[itemIndex] = {
      ...item,
      position: newPosition,
      tier: newTier || item.tier,
    };

    set({ items: updatedItems });
  },

  reorderItems: (newItems) => set({ items: newItems }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedTier: (tier) => set({ selectedTier: tier }),

  clearRanking: () => set({ items: [] }),

  // 辅助方法
  getItemsByTier: (tier) => {
    const { items } = get();
    return items
      .filter((item) => item.tier === tier)
      .sort((a, b) => a.position - b.position);
  },

  getTopItems: (count) => {
    const { items } = get();
    return items.sort((a, b) => a.position - b.position).slice(0, count);
  },
}));
