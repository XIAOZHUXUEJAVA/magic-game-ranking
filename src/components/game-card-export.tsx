"use client";

import React from "react";
import { Game } from "@/types/game";
import { MagicCard } from "@/components/ui/magic-card";
import { cn } from "@/lib/utils";
import { encodeImagePath } from "@/lib/image-utils";
import { GripVertical, X } from "lucide-react";

interface GameCardExportProps {
  game: Game;
  isDragging?: boolean;
  showRemove?: boolean;
  onRemove?: () => void;
  className?: string;
  rank?: number;
}

/**
 * 专门用于导出的游戏卡片组件
 * 使用原生 img 标签而不是 Next.js Image 组件，避免导出时的兼容性问题
 */
export const GameCardExport: React.FC<GameCardExportProps> = ({
  game,
  isDragging = false,
  showRemove = false,
  onRemove,
  className,
  rank,
}) => {
  const getImageSrc = () => {
    // 确保图片路径正确
    const imagePath = game.image.startsWith("/")
      ? game.image
      : `/covers/${game.image}`;
    return encodeImagePath(imagePath);
  };

  return (
    <MagicCard
      className={cn(
        "group relative h-24 w-full cursor-pointer transition-all duration-200 hover:scale-105",
        isDragging && "opacity-50 rotate-3 scale-105",
        className
      )}
    >
      <div className="flex h-full w-full items-center gap-3">
        {/* 排名显示 */}
        {rank && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 text-sm font-bold text-white">
            {rank}
          </div>
        )}

        {/* 游戏封面 - 使用原生 img 标签 */}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-800">
          <img
            src={getImageSrc()}
            alt={game.name}
            width={64}
            height={64}
            className="h-full w-full object-cover game-cover-image"
            loading="lazy"
            crossOrigin="anonymous"
            data-original-src={game.image}
            onError={(e) => {
              // 图片加载失败时的处理
              const target = e.target as HTMLImageElement;
              if (!target.src.includes("placeholder")) {
                target.src = "/covers/placeholder.svg";
              }
            }}
            style={{
              // 确保图片在导出时正确显示
              maxWidth: "100%",
              height: "auto",
              objectFit: "cover",
            }}
          />
        </div>

        {/* 游戏信息 */}
        <div className="flex-1 min-w-0">
          <h3 className="truncate text-sm font-semibold text-white">
            {game.name}
          </h3>
          {game.genre && <p className="text-xs text-gray-400">{game.genre}</p>}
        </div>

        {/* 操作按钮 - 在导出时隐藏 */}
        <div className="flex items-center gap-2 export-hidden">
          {showRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
            >
              <X className="h-4 w-4 text-red-400" />
            </button>
          )}

          <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </MagicCard>
  );
};
