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
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useRankingStore } from "@/store/ranking-store";
import { DEFAULT_TIERS } from "@/types/game";
import { DraggableCompactGameImage } from "@/components/compact-game-image";
import { AddGameButton } from "@/components/add-game-button";
import { GameSelectionDialog } from "@/components/game-selection-dialog";
import { cn } from "@/lib/utils";

interface TierRankingProps {
  className?: string;
}

export const TierRanking: React.FC<TierRankingProps> = ({ className }) => {
  const { items, reorderItems, removeGame, addGame } = useRankingStore();

  const [dialogState, setDialogState] = React.useState<{
    isOpen: boolean;
    tierName: string;
    tierId: string;
  }>({
    isOpen: false,
    tierName: "",
    tierId: "",
  });

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

  const handleOpenDialog = (tierId: string, tierName: string) => {
    setDialogState({
      isOpen: true,
      tierName,
      tierId,
    });
  };

  const handleCloseDialog = () => {
    setDialogState({
      isOpen: false,
      tierName: "",
      tierId: "",
    });
  };

  const handleSelectGame = (game: any) => {
    addGame(game, dialogState.tierId);
    handleCloseDialog();
  };

  // 获取已添加的游戏ID列表，用于在对话框中排除
  const addedGameIds = items.map((item) => item.game.id);

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
        {/* <p className="text-sm text-gray-400">
          将游戏拖拽到对应梯队，支持网格内拖拽排序
        </p> */}
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
                className="rounded-lg border border-white/10 bg-black/20 p-4 transition-all duration-200"
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
                </div>

                {/* 梯队游戏网格 */}
                <SortableContext
                  items={tierItems.map((item) => item.id)}
                  strategy={horizontalListSortingStrategy}
                >
                  <div className="flex flex-wrap gap-3">
                    {tierItems.map((item) => (
                      <DraggableCompactGameImage
                        key={item.id}
                        id={item.id}
                        game={item.game}
                        showRemove
                        onRemove={() => removeGame(item.game.id)}
                        size="md"
                      />
                    ))}

                    {/* 添加游戏按钮 */}
                    <AddGameButton
                      onClick={() => handleOpenDialog(tier.id, tier.name)}
                      size="md"
                      className="flex-shrink-0"
                    />
                  </div>
                </SortableContext>
              </div>
            );
          })}
        </div>
      </DndContext>

      {/* 游戏选择对话框 */}
      <GameSelectionDialog
        isOpen={dialogState.isOpen}
        onClose={handleCloseDialog}
        onSelectGame={handleSelectGame}
        tierName={dialogState.tierName}
        excludeGameIds={addedGameIds}
      />
    </div>
  );
};
