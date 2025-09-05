"use client";

import React from "react";
import { ImageTest } from "@/components/image-test";
import { debugExportImages } from "@/lib/export-debug";

export default function DebugPage() {
  const handleDebugExport = () => {
    // 检查是否在主页面
    if (window.location.pathname === "/debug") {
      alert(
        "请先回到主页面添加游戏到排行榜，然后在主页面的浏览器控制台中运行 quickDebug() 函数"
      );
      return;
    }
    debugExportImages("ranking-container");
  };

  const handleOpenMainPage = () => {
    window.open("/", "_blank");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">图片调试页面</h1>

        <div className="mb-8 space-y-4">
          <div>
            <button
              onClick={handleOpenMainPage}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold mr-4"
            >
              打开主页面
            </button>
            <button
              onClick={handleDebugExport}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold"
            >
              调试导出图片问题
            </button>
          </div>
          <div className="p-4 bg-yellow-900/50 border border-yellow-600 rounded-lg">
            <p className="text-yellow-200 font-semibold mb-2">重要提示：</p>
            <p className="text-sm text-yellow-100">
              调试功能需要在主页面使用。请按以下步骤操作：
            </p>
            <ol className="list-decimal list-inside text-sm text-yellow-100 mt-2 space-y-1">
              <li>点击"打开主页面"按钮</li>
              <li>在主页面添加一些游戏到排行榜</li>
              <li>按 F12 打开开发者工具</li>
              <li>
                在控制台中输入：
                <code className="bg-gray-800 px-1 rounded">quickDebug()</code>
              </li>
              <li>查看详细的调试信息</li>
            </ol>
          </div>
        </div>

        <ImageTest />

        <div className="mt-8 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">调试步骤</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
            <li>点击上方"打开主页面"按钮</li>
            <li>在主页面添加一些游戏到排行榜</li>
            <li>按 F12 打开浏览器开发者工具</li>
            <li>
              在控制台中输入：
              <code className="bg-gray-700 px-1 rounded">quickDebug()</code>{" "}
              并按回车
            </li>
            <li>查看详细的图片加载日志</li>
            <li>找出哪些图片加载失败以及失败原因</li>
          </ol>
        </div>

        <div className="mt-6 p-6 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">常见问题</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
            <li>
              <strong>文件名特殊字符:</strong> 包含 %、!、&、+
              等字符的文件名需要URL编码
            </li>
            <li>
              <strong>文件不存在:</strong> 检查 public/covers/
              目录下是否真的有对应的图片文件
            </li>
            <li>
              <strong>路径大小写:</strong> 确保文件名大小写完全匹配
            </li>
            <li>
              <strong>文件格式:</strong> 确保图片文件是有效的 JPG 格式
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
