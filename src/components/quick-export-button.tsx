"use client";

import React, { useState } from "react";
import { Download } from "lucide-react";
import { quickExport } from "@/lib/quick-fix";
import { cn } from "@/lib/utils";

interface QuickExportButtonProps {
  className?: string;
  elementId?: string;
}

export const QuickExportButton: React.FC<QuickExportButtonProps> = ({
  className,
  elementId = "ranking-container",
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      await quickExport(elementId);
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
        "inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      <Download className={cn("h-4 w-4", isExporting && "animate-bounce")} />
      {isExporting ? "修复并导出中..." : "智能导出"}
    </button>
  );
};