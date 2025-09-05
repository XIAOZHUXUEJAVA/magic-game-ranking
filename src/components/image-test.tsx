"use client";

import React, { useState } from "react";
import Image from "next/image";
import { encodeImagePath } from "@/lib/image-utils";

// 测试有特殊字符的游戏图片
const testGames = [
  { name: "100% Orange Juice", image: "/covers/100% Orange Juice.jpg" },
  { name: "60 Seconds!", image: "/covers/60 Seconds!.jpg" },
  { name: "Ratchet & Clank", image: "/covers/Ratchet & Clank.jpg" },
  { name: "Cave Story+", image: "/covers/Cave Story+.jpg" },
  {
    name: "Mario + Rabbids Kingdom Battle",
    image: "/covers/Mario + Rabbids Kingdom Battle.jpg",
  },
];

export const ImageTest: React.FC = () => {
  const [showEncoded, setShowEncoded] = useState(true);

  return (
    <div className="p-6 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4">图片URL编码测试</h2>

      <div className="mb-4">
        <button
          onClick={() => setShowEncoded(!showEncoded)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          {showEncoded ? "显示原始路径" : "显示编码路径"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testGames.map((game, index) => (
          <div key={index} className="border border-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2">{game.name}</h3>

            <div className="mb-2">
              <p className="text-sm text-gray-400 mb-1">
                {showEncoded ? "编码后路径:" : "原始路径:"}
              </p>
              <code className="text-xs bg-gray-800 p-1 rounded block break-all">
                {showEncoded ? encodeImagePath(game.image) : game.image}
              </code>
            </div>

            <div className="relative w-16 h-16 bg-gray-800 rounded">
              <Image
                src={showEncoded ? encodeImagePath(game.image) : game.image}
                alt={game.name}
                width={64}
                height={64}
                className="w-full h-full object-cover rounded"
                onError={(e) => {
                  console.error(`图片加载失败: ${game.name}`, e);
                }}
                onLoad={() => {
                  console.log(`图片加载成功: ${game.name}`);
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-800 rounded">
        <h3 className="text-lg font-semibold mb-2">说明</h3>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• 编码后的路径会将特殊字符转换为URL安全格式</li>
          <li>
            • 例如: "100% Orange Juice.jpg" → "100%25%20Orange%20Juice.jpg"
          </li>
          <li>• 这样可以确保浏览器正确解析图片路径</li>
          <li>• 如果图片仍然显示破损，请检查文件是否真实存在</li>
        </ul>
      </div>
    </div>
  );
};
