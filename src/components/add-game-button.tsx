"use client";

import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddGameButtonProps {
  onClick: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const AddGameButton: React.FC<AddGameButtonProps> = ({
  onClick,
  className,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-20 w-20",
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex-shrink-0 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95",
        "rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-400",
        "bg-gray-800/50 hover:bg-blue-500/10",
        "flex items-center justify-center",
        "export-hidden", // 导出时隐藏
        sizeClasses[size],
        className
      )}
      aria-label="添加游戏"
    >
      {/* 背景光效 */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* 加号图标 */}
      <Plus
        className={cn(
          "text-gray-400 group-hover:text-blue-400 transition-colors duration-200 relative z-10",
          iconSizes[size]
        )}
      />

      {/* 悬停提示 */}
      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        点击添加游戏
      </div>
    </button>
  );
};
