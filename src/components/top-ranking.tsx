"use client";

import React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useRankingStore } from "@/store/ranking-store";
import { DraggableGameCard } from "@/components/game-card";
import { cn } from "@/lib/utils";

interface TopRankingProps {
  className?: string;
  maxItems?: number;
}

export const TopRanking: React.FC<TopRankingProps> = ({
  className,
  maxItems,
}) => {
  const { items, reorderItems, removeGame } = useRankingStore();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 移动8px后才开始拖拽，避免误触
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 使用实际游戏数量作为 maxItems，如果没有传入 maxItems 的话
  const actualMaxItems = maxItems || items.length;

  const topItems = items
    .sort((a, b) => a.position - b.position)
    .slice(0, actualMaxItems);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = topItems.findIndex((item) => item.id === active.id);
      const newIndex = topItems.findIndex((item) => item.id === over?.id);

      const newItems = arrayMove(topItems, oldIndex, newIndex);

      // 更新位置
      const updatedItems = newItems.map((item, index) => ({
        ...item,
        position: index + 1,
      }));

      reorderItems([
        ...updatedItems,
        ...items.filter((item) => !topItems.some((top) => top.id === item.id)),
      ]);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* 排行榜标题 */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">
          Top {actualMaxItems || "游戏"} 排行榜
        </h2>
        <p className="text-sm text-gray-400 export-hidden">
          拖拽游戏卡片来调整排名顺序
        </p>
      </div>

      {/* 排行榜列表 */}
      {topItems.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={topItems.map((item) => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {topItems.map((item, index) => (
                <div key={item.id} className="relative">
                  {/* 排名背景装饰 */}
                  <div
                    className={cn(
                      "absolute -left-2 top-0 bottom-0 w-1 rounded-full",
                      index === 0 &&
                        "bg-gradient-to-b from-yellow-400 to-yellow-600",
                      index === 1 &&
                        "bg-gradient-to-b from-gray-300 to-gray-500",
                      index === 2 &&
                        "bg-gradient-to-b from-amber-600 to-amber-800",
                      index > 2 && "bg-gradient-to-b from-blue-400 to-blue-600"
                    )}
                  />

                  <DraggableGameCard
                    id={item.id}
                    game={item.game}
                    rank={index + 1}
                    showRemove
                    onRemove={() => removeGame(item.game.id)}
                    className={cn(
                      "transition-all duration-200",
                      index === 0 && "ring-2 ring-yellow-400/50",
                      index === 1 && "ring-2 ring-gray-300/50",
                      index === 2 && "ring-2 ring-amber-600/50"
                    )}
                  />
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-300 mb-1">排行榜为空</p>
          <p className="text-sm text-gray-500">
            使用上方搜索框添加游戏开始创建你的排行榜
          </p>
        </div>
      )}
    </div>
  );
};
