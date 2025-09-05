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
import { DEFAULT_TIERS } from "@/types/game";
import { DraggableGameCard } from "@/components/game-card";
import { cn } from "@/lib/utils";

interface TierRankingProps {
  className?: string;
}

export const TierRanking: React.FC<TierRankingProps> = ({ className }) => {
  const { items, reorderItems, removeGame, setSelectedTier, selectedTier } =
    useRankingStore();

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

  const getItemsByTier = (tierId: string) => {
    return items
      .filter((item) => item.tier === tierId)
      .sort((a, b) => a.position - b.position);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // 找到被拖拽的项目
    const activeItem = items.find((item) => item.id === activeId);
    if (!activeItem) return;

    // 检查是否拖拽到梯队容器
    const targetTier = DEFAULT_TIERS.find((tier) => tier.id === overId);
    if (targetTier) {
      // 移动到新梯队
      const updatedItems = items.map((item) =>
        item.id === activeId ? { ...item, tier: targetTier.id } : item
      );
      reorderItems(updatedItems);
      return;
    }

    // 在同一梯队内重新排序
    const overItem = items.find((item) => item.id === overId);
    if (overItem && activeItem.tier === overItem.tier) {
      const tierItems = getItemsByTier(activeItem.tier!);
      const oldIndex = tierItems.findIndex((item) => item.id === activeId);
      const newIndex = tierItems.findIndex((item) => item.id === overId);

      if (oldIndex !== newIndex) {
        const newTierItems = arrayMove(tierItems, oldIndex, newIndex);

        // 更新位置
        const updatedTierItems = newTierItems.map((item, index) => ({
          ...item,
          position: index + 1,
        }));

        // 合并所有项目
        const otherItems = items.filter(
          (item) => item.tier !== activeItem.tier
        );
        reorderItems([...otherItems, ...updatedTierItems]);
      }
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* 梯队排行榜标题 */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">梯队排行榜</h2>
        <p className="text-sm text-gray-400">
          将游戏拖拽到对应梯队，或在梯队内调整顺序
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          {DEFAULT_TIERS.map((tier) => {
            const tierItems = getItemsByTier(tier.id);

            return (
              <div
                key={tier.id}
                className={cn(
                  "rounded-lg border border-white/10 bg-black/20 p-4 transition-all duration-200",
                  selectedTier === tier.id && "ring-2 ring-white/20"
                )}
                onClick={() =>
                  setSelectedTier(selectedTier === tier.id ? null : tier.id)
                }
              >
                {/* 梯队标题 */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r text-white font-bold",
                        tier.color
                      )}
                    >
                      {tier.name}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {tier.name} 梯队
                      </h3>
                      <p className="text-xs text-gray-400">
                        {tierItems.length} 个游戏
                      </p>
                    </div>
                  </div>

                  {selectedTier === tier.id && (
                    <div className="text-xs text-green-400">
                      已选中 - 搜索的游戏将添加到此梯队
                    </div>
                  )}
                </div>

                {/* 梯队游戏列表 */}
                {tierItems.length > 0 ? (
                  <SortableContext
                    items={tierItems.map((item) => item.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-2">
                      {tierItems.map((item, index) => (
                        <DraggableGameCard
                          key={item.id}
                          id={item.id}
                          game={item.game}
                          rank={index + 1}
                          showRemove
                          onRemove={() => removeGame(item.game.id)}
                          className="bg-white/5"
                        />
                      ))}
                    </div>
                  </SortableContext>
                ) : (
                  <div
                    className={cn(
                      "rounded-lg border-2 border-dashed border-gray-600 p-8 text-center transition-colors",
                      selectedTier === tier.id && "border-white/40 bg-white/5"
                    )}
                  >
                    <p className="text-sm text-gray-400">
                      {selectedTier === tier.id
                        ? "搜索并添加游戏到此梯队"
                        : "拖拽游戏到此梯队"}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </DndContext>
    </div>
  );
};
