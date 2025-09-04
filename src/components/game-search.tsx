"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import { Game } from "@/types/game";
import { searchGames } from "@/lib/games";
import { useRankingStore } from "@/store/ranking-store";
import { GameCard } from "@/components/game-card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { cn } from "@/lib/utils";

interface GameSearchProps {
  className?: string;
}

export const GameSearch: React.FC<GameSearchProps> = ({ className }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Game[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const { addGame, mode, selectedTier } = useRankingStore();

  useEffect(() => {
    const searchResults = searchGames(query);
    setResults(searchResults);
  }, [query]);

  const handleAddGame = (game: Game) => {
    addGame(game, selectedTier || undefined);
    setQuery("");
    setIsOpen(false);
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* 搜索输入框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="搜索游戏..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="w-full rounded-lg border border-white/10 bg-black/20 py-3 pl-10 pr-4 text-white placeholder-gray-400 backdrop-blur-md focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/10"
        />
      </div>

      {/* 搜索结果下拉框 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* 结果列表 */}
          <div className="absolute top-full left-0 right-0 z-20 mt-2 max-h-96 overflow-y-auto rounded-lg border border-white/10 bg-black/80 backdrop-blur-md">
            {results.length > 0 ? (
              <div className="p-2 space-y-2">
                {results.map((game) => (
                  <div
                    key={game.id}
                    className="group relative cursor-pointer rounded-lg p-2 hover:bg-white/5"
                    onClick={() => handleAddGame(game)}
                  >
                    <div className="flex items-center gap-3">
                      {/* 游戏封面 */}
                      <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                        <img
                          src={game.image}
                          alt={game.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>

                      {/* 游戏信息 */}
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate text-sm font-medium text-white">
                          {game.name}
                        </h4>
                        {game.genre && (
                          <p className="text-xs text-gray-400">{game.genre}</p>
                        )}
                      </div>

                      {/* 添加按钮 */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Plus className="h-4 w-4 text-green-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-gray-400">
                {query ? "未找到相关游戏" : "输入游戏名称开始搜索"}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
