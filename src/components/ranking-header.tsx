"use client";

import React from "react";
import { Trophy, Grid3X3, Download, RotateCcw } from "lucide-react";
import { useRankingStore } from "@/store/ranking-store";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { exportAsPng } from "@/lib/html-to-image-export";
import { cn } from "@/lib/utils";

interface RankingHeaderProps {
  className?: string;
}

export const RankingHeader: React.FC<RankingHeaderProps> = ({ className }) => {
  const { mode, setMode, clearRanking } = useRankingStore();

  const handleExport = async () => {
    try {
      const filename = `magic-game-ranking-${Date.now()}`;
      await exportAsPng("ranking-container", filename, {
        quality: 0.95,
        backgroundColor: "#000000",
        pixelRatio: 2,
      });
      console.log("✅ 导出成功!");
    } catch (error) {
      console.error("❌ 导出失败:", error);
      alert(`导出失败: ${error}`);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* 模式切换和操作按钮 */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        {/* 模式切换 */}
        <div className="relative">
          {/* 彩虹边框效果 */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl opacity-30 blur-sm animate-pulse"></div>

          <div className="relative flex rounded-xl border border-white/20 bg-black/40 backdrop-blur-xl p-1.5 shadow-2xl">
            {/* 滑动指示器背景 */}
            <div
              className={cn(
                "absolute top-1.5 bottom-1.5 rounded-lg bg-gradient-to-r transition-all duration-300 ease-out shadow-lg",
                mode === "top"
                  ? "left-1.5 w-[calc(50%-0.375rem)] from-yellow-400/80 to-orange-500/80"
                  : "right-1.5 w-[calc(50%-0.375rem)] from-blue-400/80 to-purple-500/80"
              )}
            />

            <button
              onClick={() => setMode("top")}
              className={cn(
                "relative flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 z-10",
                mode === "top"
                  ? "text-white shadow-lg transform scale-105"
                  : "text-gray-300 hover:text-white hover:scale-102"
              )}
            >
              <Trophy
                className={cn(
                  "h-4 w-4 transition-all duration-300",
                  mode === "top" ? "text-white drop-shadow-sm" : "text-gray-400"
                )}
              />
              <span className="font-bold">Top排行</span>
            </button>

            <button
              onClick={() => setMode("tier")}
              className={cn(
                "relative flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all duration-300 z-10",
                mode === "tier"
                  ? "text-white shadow-lg transform scale-105"
                  : "text-gray-300 hover:text-white hover:scale-102"
              )}
            >
              <Grid3X3
                className={cn(
                  "h-4 w-4 transition-all duration-300",
                  mode === "tier"
                    ? "text-white drop-shadow-sm"
                    : "text-gray-400"
                )}
              />
              <span className="font-bold">梯队模式</span>
            </button>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          <RainbowButton
            onClick={clearRanking}
            variant="outline"
            size="default"
            className="flex items-center gap-2 [--color-1:#ef4444] [--color-2:#f97316] [--color-3:#eab308] [--color-4:#22c55e] [--color-5:#3b82f6]"
          >
            <RotateCcw className="h-4 w-4" />
            清空
          </RainbowButton>

          <RainbowButton
            onClick={handleExport}
            variant="default"
            size="default"
            className="flex items-center gap-2 [--color-1:#10b981] [--color-2:#06b6d4] [--color-3:#3b82f6] [--color-4:#8b5cf6] [--color-5:#ec4899]"
          >
            <Download className="h-4 w-4" />
            导出
          </RainbowButton>
        </div>
      </div>
    </div>
  );
};
