"use client";

import React from "react";
import { Download } from "lucide-react";
import { exportRankingImproved } from "@/lib/export-improved";
import { cn } from "@/lib/utils";

interface ExportButtonImprovedProps {
  className?: string;
  elementId?: string;
}

export const ExportButtonImproved: React.FC<ExportButtonImprovedProps> = ({
  className,
  elementId = "ranking-container",
}) => {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      await exportRankingImproved(elementId, {
        filename: "magic-game-ranking",
        format: "png",
        quality: 0.95,
        scale: 2,
      });
    } catch (error) {
      console.error("导出失败:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <Download className={cn("h-4 w-4", isExporting && "animate-bounce")} />
      {isExporting ? "导出中..." : "导出图片"}
    </button>
  );
};
