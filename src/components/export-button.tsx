"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Image, FileImage, FileType } from "lucide-react";
import {
  exportAsPng,
  exportAsJpeg,
  exportAsSvg,
  ExportOptions,
} from "@/lib/html-to-image-export";

interface ExportButtonProps {
  className?: string;
  elementId?: string;
}

export function ExportButton({
  className = "",
  elementId = "ranking-container",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const handleExport = async (
    format: "png" | "jpeg" | "svg",
    options: ExportOptions = {}
  ) => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      const filename = `magic-game-ranking-${Date.now()}`;

      switch (format) {
        case "png":
          await exportAsPng(elementId, filename, options);
          break;
        case "jpeg":
          await exportAsJpeg(elementId, filename, options);
          break;
        case "svg":
          await exportAsSvg(elementId, filename, options);
          break;
      }

      console.log(`✅ ${format.toUpperCase()} 导出成功!`);
    } catch (error) {
      console.error(`❌ ${format.toUpperCase()} 导出失败:`, error);
      alert(`导出失败: ${error}`);
    } finally {
      setIsExporting(false);
      setShowOptions(false);
    }
  };

  const exportOptions: ExportOptions = {
    quality: 0.95,
    backgroundColor: "#000000",
    pixelRatio: 2,
  };

  return (
    <div className={`relative ${className}`}>
      {/* 主导出按钮 */}
      <Button
        onClick={() => handleExport("png", exportOptions)}
        disabled={isExporting}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        {isExporting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
            导出中...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            导出 PNG
          </>
        )}
      </Button>

      {/* 格式选择按钮 */}
      <Button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isExporting}
        variant="outline"
        className="ml-2 px-3 py-2 border-gray-600 text-gray-300 hover:bg-gray-800"
      >
        <FileType className="w-4 h-4" />
      </Button>

      {/* 导出选项菜单 */}
      {showOptions && (
        <div className="absolute top-full left-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 min-w-[200px]">
          <div className="p-2 space-y-1">
            <button
              onClick={() => handleExport("png", exportOptions)}
              disabled={isExporting}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
            >
              <Image className="w-4 h-4 mr-2" />
              导出为 PNG
              <span className="ml-auto text-xs text-gray-500">推荐</span>
            </button>

            <button
              onClick={() => handleExport("jpeg", exportOptions)}
              disabled={isExporting}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
            >
              <FileImage className="w-4 h-4 mr-2" />
              导出为 JPEG
              <span className="ml-auto text-xs text-gray-500">小文件</span>
            </button>

            <button
              onClick={() =>
                handleExport("svg", {
                  ...exportOptions,
                  backgroundColor: "transparent",
                })
              }
              disabled={isExporting}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
            >
              <FileType className="w-4 h-4 mr-2" />
              导出为 SVG
              <span className="ml-auto text-xs text-gray-500">矢量</span>
            </button>
          </div>

          <div className="border-t border-gray-700 p-2">
            <div className="text-xs text-gray-500 px-3 py-1">
              💡 提示: PNG 格式质量最佳，JPEG 文件更小，SVG 可无限缩放
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 简单的导出按钮（只有 PNG 格式）
 */
export function SimpleExportButton({
  className = "",
  elementId = "ranking-container",
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      const filename = `magic-game-ranking-${Date.now()}`;
      await exportAsPng(elementId, filename, {
        quality: 0.95,
        backgroundColor: "#000000",
        pixelRatio: 2,
      });
      console.log("✅ PNG 导出成功!");
    } catch (error) {
      console.error("❌ PNG 导出失败:", error);
      alert(`导出失败: ${error}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl ${className}`}
    >
      {isExporting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
          导出中...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          导出图片
        </>
      )}
    </Button>
  );
}
