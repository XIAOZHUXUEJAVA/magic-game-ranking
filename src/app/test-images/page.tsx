"use client";

import React, { useEffect, useState } from "react";
import { GAMES } from "@/lib/games";
import { encodeImagePath } from "@/lib/image-utils";

export default function TestImagesPage() {
  const [imageStatus, setImageStatus] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testImages = async () => {
      const status: Record<string, boolean> = {};
      
      // 测试前10个游戏的图片
      const testGames = GAMES.slice(0, 10);
      
      for (const game of testGames) {
        try {
          const imagePath = game.image;
          const encodedPath = encodeImagePath(imagePath);
          const fullUrl = window.location.origin + encodedPath;
          
          const canLoad = await testImageLoad(fullUrl);
          status[game.id] = canLoad;
        } catch (error) {
          status[game.id] = false;
        }
      }
      
      setImageStatus(status);
      setLoading(false);
    };

    testImages();
  }, []);

  const testImageLoad = (src: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
      
      setTimeout(() => resolve(false), 3000);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent mx-auto mb-4"></div>
          <p>测试图片加载中...</p>
        </div>
      </div>
    );
  }

  const testGames = GAMES.slice(0, 10);
  const successCount = Object.values(imageStatus).filter(Boolean).length;
  const totalCount = testGames.length;

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">图片加载测试</h1>
        
        <div className="mb-8 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">测试结果</h2>
          <p>成功加载: {successCount} / {totalCount}</p>
          <p>成功率: {((successCount / totalCount) * 100).toFixed(1)}%</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {testGames.map((game) => {
            const canLoad = imageStatus[game.id];
            const imagePath = encodeImagePath(game.image);
            
            return (
              <div key={game.id} className="text-center">
                <div className={`p-2 rounded-lg ${canLoad ? 'bg-green-900' : 'bg-red-900'}`}>
                  <img
                    src={canLoad ? imagePath : "/covers/placeholder.svg"}
                    alt={game.name}
                    className="w-16 h-16 mx-auto object-cover rounded"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/covers/placeholder.svg";
                    }}
                  />
                  <p className="text-xs mt-2 truncate">{game.name}</p>
                  <p className={`text-xs ${canLoad ? 'text-green-400' : 'text-red-400'}`}>
                    {canLoad ? '✅' : '❌'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">调试信息</h3>
          <p className="text-sm text-gray-300 mb-2">
            如果有图片加载失败，请检查 public/covers/ 目录下是否有对应的文件。
          </p>
          <p className="text-sm text-gray-300">
            你也可以在浏览器控制台中运行 <code>quickFixImages()</code> 来自动修复图片问题。
          </p>
        </div>
      </div>
    </div>
  );
}