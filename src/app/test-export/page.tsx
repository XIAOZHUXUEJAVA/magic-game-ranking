"use client";

import React from "react";
import { ExportButtonFinal } from "@/components/export-button-final";
import { GameCard } from "@/components/game-card";
import { Game } from "@/types/game";

// 测试用的游戏数据
const testGames: Game[] = [
  {
    id: "1",
    name: "The Legend of Zelda: Breath of the Wild",
    image: "/covers/The Legend of Zelda Breath of the Wild.jpg",
    genre: "Action Adventure",
  },
  {
    id: "2",
    name: "Super Mario Odyssey",
    image: "/covers/Super Mario Odyssey.jpg",
    genre: "Platformer",
  },
  {
    id: "3",
    name: "Minecraft",
    image: "/covers/Minecraft.jpg",
    genre: "Sandbox",
  },
];

export default function TestExportPage() {
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          图片导出测试页面
        </h1>

        <div className="mb-8 text-center">
          <ExportButtonFinal />
        </div>

        <div
          id="ranking-container"
          className="space-y-4 bg-gray-900 p-6 rounded-lg"
        >
          <h2 className="text-xl font-semibold mb-4">测试游戏列表</h2>

          {testGames.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              rank={index + 1}
              className="mb-2"
            />
          ))}
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">调试工具</h3>
          <p className="text-sm text-gray-300 mb-4">
            打开浏览器控制台，使用以下命令进行调试：
          </p>
          <div className="space-y-2 text-sm font-mono bg-black p-3 rounded">
            <div>
              <span className="text-green-400">quickFixExport()</span> -
              快速修复并导出
            </div>
            <div>
              <span className="text-blue-400">diagnoseImages()</span> -
              诊断图片状态
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
