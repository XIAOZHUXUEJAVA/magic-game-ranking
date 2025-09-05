"use client";

import React, { useState, useMemo } from "react";
import { Game } from "@/types/game";
import { GAMES } from "@/lib/games";
import { CompactGameImage } from "@/components/compact-game-image";
import { cn } from "@/lib/utils";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";

interface GameSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectGame: (game: Game) => void;
  tierName: string;
  excludeGameIds?: string[];
}

const GAMES_PER_PAGE = 60; // 每页显示60个游戏

export const GameSelectionDialog: React.FC<GameSelectionDialogProps> = ({
  isOpen,
  onClose,
  onSelectGame,
  tierName,
  excludeGameIds = [],
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 过滤游戏：排除已添加的游戏，并根据搜索查询过滤
  const filteredGames = useMemo(() => {
    let games = GAMES.filter((game) => !excludeGameIds.includes(game.id));

    if (searchQuery.trim()) {
      games = games.filter((game) =>
        game.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return games;
  }, [excludeGameIds, searchQuery]);

  // 分页逻辑
  const totalPages = Math.ceil(filteredGames.length / GAMES_PER_PAGE);
  const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
  const currentGames = filteredGames.slice(
    startIndex,
    startIndex + GAMES_PER_PAGE
  );

  // 重置页面当搜索查询改变时
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleGameSelect = (game: Game) => {
    onSelectGame(game);
    onClose();
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 对话框内容 */}
      <div className="relative w-full max-w-6xl max-h-[90vh] mx-4 bg-gray-900 rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl font-bold text-white">
              选择游戏添加到 {tierName} 梯队
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              共 {filteredGames.length} 个游戏可选择
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="关闭对话框"
          >
            <X className="h-6 w-6 text-gray-400" />
          </button>
        </div>

        {/* 搜索栏 */}
        <div className="p-6 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索游戏名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 游戏网格 */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentGames.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {currentGames.map((game) => (
                <div
                  key={game.id}
                  onClick={() => handleGameSelect(game)}
                  className="cursor-pointer transform transition-all duration-200 hover:scale-110 active:scale-95"
                >
                  <CompactGameImage
                    game={game}
                    size="md"
                    className="hover:ring-2 hover:ring-blue-500 rounded-lg"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-400 text-lg mb-2">没有找到游戏</div>
              <div className="text-gray-500 text-sm">
                {searchQuery ? "尝试修改搜索关键词" : "所有游戏都已添加"}
              </div>
            </div>
          )}
        </div>

        {/* 分页控制 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-6 border-t border-white/10">
            <div className="text-sm text-gray-400">
              第 {currentPage} 页，共 {totalPages} 页
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  currentPage === 1
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-white hover:bg-white/10"
                )}
              >
                <ChevronLeft className="h-4 w-4" />
                上一页
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={cn(
                        "w-10 h-10 rounded-lg transition-colors",
                        currentPage === pageNum
                          ? "bg-blue-500 text-white"
                          : "text-gray-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                  currentPage === totalPages
                    ? "text-gray-500 cursor-not-allowed"
                    : "text-white hover:bg-white/10"
                )}
              >
                下一页
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
