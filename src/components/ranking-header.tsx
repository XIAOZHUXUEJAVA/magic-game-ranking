"use client";

import React from "react";
import { Trophy, Grid3X3, Download, RotateCcw } from "lucide-react";
import { useRankingStore } from "@/store/ranking-store";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { exportRankingAsImage } from "@/lib/export";
import { cn } from "@/lib/utils";

interface RankingHeaderProps {
  className?: string;
}

export const RankingHeader: React.FC<RankingHeaderProps> = ({ className }) => {
  const { mode, setMode, title, setTitle, clearRanking } = useRankingStore();

  const handleExport = async () => {
    try {
      await exportRankingAsImage("ranking-container", {
        filename:
          title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "-") || "game-ranking",
        format: "png",
        quality: 0.95,
        scale: 2,
      });
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* 标题编辑 */}
      <div className="text-center">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-transparent text-2xl font-bold text-white text-center border-none outline-none focus:bg-white/5 rounded px-2 py-1 transition-colors"
          placeholder="输入排行榜标题"
        />
      </div>

      {/* 模式切换和操作按钮 */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* 模式切换 */}
        <div className="flex rounded-lg border border-white/10 bg-black/20 p-1">
          <button
            onClick={() => setMode("top")}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
              mode === "top"
                ? "bg-white/10 text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Trophy className="h-4 w-4" />
            Top排行
          </button>
          <button
            onClick={() => setMode("tier")}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all",
              mode === "tier"
                ? "bg-white/10 text-white shadow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
          >
            <Grid3X3 className="h-4 w-4" />
            梯队模式
          </button>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={clearRanking}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <RotateCcw className="h-4 w-4" />
            清空
          </button>

          <ShimmerButton
            onClick={handleExport}
            className="flex items-center gap-2"
            shimmerColor="#10b981"
          >
            <Download className="h-4 w-4" />
            导出
          </ShimmerButton>
        </div>
      </div>
    </div>
  );
};
