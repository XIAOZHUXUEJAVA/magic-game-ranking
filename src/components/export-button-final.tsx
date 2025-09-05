"use client";

import React from "react";
import { Download } from "lucide-react";
import { exportRankingFixed } from "@/lib/export-fix-final";
import { RainbowButton } from "@/components/ui/rainbow-button";

interface ExportButtonFinalProps {
  className?: string;
}

export const ExportButtonFinal: React.FC<ExportButtonFinalProps> = ({
  className,
}) => {
  const handleExport = async () => {
    try {
      await exportRankingFixed("ranking-container", {
        filename: "magic-game-ranking",
        format: "png",
        quality: 0.95,
        scale: 2,
      });
    } catch (error) {
      console.error("导出失败:", error);
      // 错误处理已在 exportRankingFixed 中完成
    }
  };

  return (
    <RainbowButton onClick={handleExport} className={className}>
      <Download className="mr-2 h-4 w-4" />
      导出排行榜
    </RainbowButton>
  );
};
