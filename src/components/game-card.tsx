"use client";

import React from "react";
import Image from "next/image";
import { Game } from "@/types/game";
import { MagicCard } from "@/components/ui/magic-card";
import { cn } from "@/lib/utils";
import { encodeImagePath } from "@/lib/image-utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";

interface GameCardProps {
  game: Game;
  isDragging?: boolean;
  showRemove?: boolean;
  onRemove?: () => void;
  className?: string;
  rank?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandleProps?: any;
}

export const GameCard: React.FC<GameCardProps> = ({
  game,
  isDragging = false,
  showRemove = false,
  onRemove,
  className,
  rank,
  dragHandleProps,
}) => {
  return (
    <MagicCard
      className={cn(
        "group relative h-24 w-full cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation",
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

        {/* 游戏封面 */}
        <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-800">
          <Image
            src={encodeImagePath(game.image)}
            alt={game.name}
            width={64}
            height={64}
            className="h-full w-full object-cover game-cover-image"
            loading="lazy"
            crossOrigin="anonymous"
            data-original-src={game.image}
            data-game-id={game.id}
            onError={(e) => {
              // 图片加载失败时的处理
              const target = e.target as HTMLImageElement;
              if (!target.src.includes("placeholder")) {
                target.src = "/covers/placeholder.svg";
              }
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

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          {showRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove?.();
              }}
              className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 hover:bg-red-500/20 rounded-md bg-red-500/10 sm:bg-transparent"
              aria-label="删除游戏"
            >
              <X className="h-4 w-4 text-red-400" />
            </button>
          )}

          <div
            className="sm:opacity-0 sm:group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-2 rounded-md bg-gray-500/10 sm:bg-transparent"
            {...dragHandleProps}
          >
            <GripVertical className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </MagicCard>
  );
};

// 可拖拽版本的游戏卡片
interface DraggableGameCardProps extends GameCardProps {
  id: string;
}

export const DraggableGameCard: React.FC<DraggableGameCardProps> = ({
  id,
  ...props
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <GameCard
        {...props}
        isDragging={isDragging}
        dragHandleProps={listeners}
      />
    </div>
  );
};
