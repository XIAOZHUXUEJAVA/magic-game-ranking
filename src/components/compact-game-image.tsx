"use client";

import React from "react";
import Image from "next/image";
import { Game } from "@/types/game";
import { cn } from "@/lib/utils";
import { encodeImagePath } from "@/lib/image-utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";

interface CompactGameImageProps {
  game: Game;
  isDragging?: boolean;
  showRemove?: boolean;
  onRemove?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const CompactGameImage: React.FC<CompactGameImageProps> = ({
  game,
  isDragging = false,
  showRemove = false,
  onRemove,
  className,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-12 w-12",
    md: "h-16 w-16",
    lg: "h-20 w-20",
  };

  return (
    <div
      className={cn(
        "group relative flex-shrink-0 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95",
        isDragging && "opacity-50 rotate-3 scale-105 z-50",
        className
      )}
    >
      {/* 游戏封面 */}
      <div
        className={cn(
          "relative overflow-hidden rounded-lg bg-gray-800 border border-white/10 hover:border-white/30 transition-colors",
          sizeClasses[size]
        )}
      >
        <Image
          src={encodeImagePath(game.image)}
          alt={game.name}
          width={size === "sm" ? 48 : size === "md" ? 64 : 80}
          height={size === "sm" ? 48 : size === "md" ? 64 : 80}
          className="h-full w-full object-cover game-cover-image"
          loading="lazy"
          crossOrigin="anonymous"
          data-original-src={encodeImagePath(game.image)}
          data-game-id={game.id}
          data-game-name={game.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes("placeholder")) {
              target.src = "/covers/placeholder.svg";
            }
          }}
        />

        {/* 悬停时显示游戏名称 */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center p-1">
          <span className="text-white text-xs font-medium text-center leading-tight">
            {game.name}
          </span>
        </div>
      </div>

      {/* 删除按钮 */}
      {showRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
          aria-label={`删除 ${game.name}`}
        >
          <X className="h-3 w-3 text-white" />
        </button>
      )}
    </div>
  );
};

// 可拖拽版本的紧凑游戏图片
interface DraggableCompactGameImageProps extends CompactGameImageProps {
  id: string;
}

export const DraggableCompactGameImage: React.FC<
  DraggableCompactGameImageProps
> = ({ id, ...props }) => {
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
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <CompactGameImage {...props} isDragging={isDragging} />
    </div>
  );
};
