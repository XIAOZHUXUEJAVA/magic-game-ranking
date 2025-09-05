"use client";

import React from "react";
import { Download } from "lucide-react";
import { exportRankingSafe } from "@/lib/export-simple-safe";
import { RainbowButton } from "@/components/ui/rainbow-button";

interface ExportButtonSafeProps {
  className?: string;
}

export const ExportButtonSafe: React.FC<ExportButtonSafeProps> = ({
  className,
}) => {
  const handleExport = async () => {
    try {
      await exportRankingSafe("ranking-container", {
        filename: "magic-game-ranking",
        format: "png",
        quality: 0.95,
        scale: 2,
      });
    } catch (error) {
      console.error("导出失败:", error);
      // 错误处理已在 exportRankingSafe 中完成
    }
  };

  return (
    <RainbowButton onClick={handleExport} className={className}>
      <Download className="mr-2 h-4 w-4" />
      安全导出
    </RainbowButton>
  );
};
