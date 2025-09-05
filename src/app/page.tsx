"use client";

import React, { useEffect } from "react";
import { useRankingStore } from "@/store/ranking-store";
import { RankingHeader } from "@/components/ranking-header";
import { GameSearch } from "@/components/game-search";
import { TopRanking } from "@/components/top-ranking";
import { TierRanking } from "@/components/tier-ranking";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { HyperText } from "@/components/ui/hyper-text";
import { cn } from "@/lib/utils";

// 导入新的 html-to-image 导出功能
import "@/lib/html-to-image-export";

export default function HomePage() {
  const { mode } = useRankingStore();

  // 在组件挂载时添加导出功能提示
  useEffect(() => {
    console.log("🎮 Magic Game Ranking 已启用");
    console.log("📸 使用 html-to-image 库进行图片导出");
    console.log("💡 在控制台中输入 quickExport() 来快速导出 PNG");
    console.log("🔧 或者输入 quickExport('jpeg') 导出 JPEG 格式");
    console.log("🎨 或者输入 quickExport('svg') 导出 SVG 格式");
  }, []);

  return (
    <div className="relative bg-black">
      {/* 背景动画 */}
      <AnimatedGridPattern
        numSquares={30}
        maxOpacity={0.1}
        duration={3}
        repeatDelay={1}
        className={cn(
          "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]",
          "fixed inset-0 skew-y-12"
        )}
      />

      {/* 主要内容 */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* 页面标题 */}
          <div className="text-center mb-8">
            <HyperText
              className="text-4xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-2"
              duration={1000}
              animateOnHover={true}
              startOnView={false}
            >
              Magic Game Ranking
            </HyperText>
            <p className="text-gray-400">
              创建你的专属游戏排行榜，支持Top排行和梯队模式
            </p>
          </div>

          {/* 排行榜头部 */}
          <RankingHeader className="mb-8" />

          {/* 游戏搜索 */}
          <GameSearch className="mb-8" />

          {/* 排行榜内容 */}
          <div id="ranking-container" className="space-y-8">
            {mode === "top" ? <TopRanking /> : <TierRanking />}
          </div>
        </div>
      </div>
    </div>
  );
}
