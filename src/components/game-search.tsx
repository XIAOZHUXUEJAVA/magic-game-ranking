"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Sparkles } from "lucide-react";
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
      <div className="relative group">
        {/* 彩虹边框效果 */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse blur-sm"></div>

        {/* 主输入框容器 */}
        <div className="relative bg-black/40 rounded-lg border border-white/10 backdrop-blur-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors duration-200" />
          <input
            type="text"
            placeholder="🎮 搜索你的游戏..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="w-full rounded-lg bg-transparent py-4 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:placeholder-gray-500 transition-all duration-200"
          />

          {/* 搜索状态指示器 */}
          {query && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Sparkles className="h-4 w-4 text-yellow-400 animate-pulse" />
            </div>
          )}

          {/* 底部发光效果 */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
        </div>
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
          <div className="absolute top-full left-0 right-0 z-20 mt-3">
            {/* 彩虹边框容器 */}
            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl opacity-20 blur-sm animate-pulse"></div>

              <div className="relative max-h-96 overflow-y-auto rounded-xl border border-white/20 bg-black/90 backdrop-blur-xl shadow-2xl">
                {results.length > 0 ? (
                  <div className="p-3 space-y-1">
                    {results.map((game, index) => (
                      <div
                        key={game.id}
                        className="group relative cursor-pointer rounded-lg p-3 hover:bg-gradient-to-r hover:from-white/5 hover:to-white/10 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg"
                        onClick={() => handleAddGame(game)}
                        style={{
                          animationDelay: `${index * 50}ms`,
                        }}
                      >
                        {/* 悬停时的发光边框 */}
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        <div className="relative flex items-center gap-4">
                          {/* 游戏封面 */}
                          <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg ring-2 ring-white/10 group-hover:ring-white/30 transition-all duration-200">
                            <img
                              src={game.image}
                              alt={game.name}
                              className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>

                          {/* 游戏信息 */}
                          <div className="flex-1 min-w-0">
                            <h4 className="truncate text-sm font-semibold text-white group-hover:text-blue-200 transition-colors duration-200">
                              {game.name}
                            </h4>
                            {game.genre && (
                              <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors duration-200">
                                {game.genre}
                              </p>
                            )}
                          </div>

                          {/* 添加按钮 */}
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-110">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 shadow-lg">
                              <Plus className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <div className="text-gray-400 mb-2">
                      {query ? (
                        <>
                          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>未找到相关游戏</p>
                          <p className="text-xs mt-1">尝试使用不同的关键词</p>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-8 w-8 mx-auto mb-2 text-yellow-400 animate-pulse" />
                          <p>输入游戏名称开始搜索</p>
                          <p className="text-xs mt-1">发现你的下一个最爱游戏</p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
