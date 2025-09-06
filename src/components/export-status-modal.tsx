"use client";

import React, { useEffect } from "react";
import { CheckCircle, XCircle, Download, Loader2, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ExportState } from "@/hooks/use-export-status";

interface ExportStatusModalProps {
  status: ExportState["status"];
  progress: number;
  message: string;
  error: string | null;
  onClose: () => void;
}

export const ExportStatusModal: React.FC<ExportStatusModalProps> = ({
  status,
  progress,
  message,
  error,
  onClose,
}) => {
  // 自动关闭成功状态
  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, onClose]);

  if (status === "idle") return null;

  const getStatusIcon = () => {
    switch (status) {
      case "preparing":
        return <Image className="h-8 w-8 text-blue-400 animate-pulse" />;
      case "processing":
        return <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />;
      case "success":
        return <CheckCircle className="h-8 w-8 text-green-400" />;
      case "error":
        return <XCircle className="h-8 w-8 text-red-400" />;
      default:
        return <Download className="h-8 w-8 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "preparing":
      case "processing":
        return "from-blue-500/20 to-purple-500/20";
      case "success":
        return "from-green-500/20 to-emerald-500/20";
      case "error":
        return "from-red-500/20 to-pink-500/20";
      default:
        return "from-gray-500/20 to-gray-600/20";
    }
  };

  const getProgressBarColor = () => {
    switch (status) {
      case "success":
        return "bg-gradient-to-r from-green-400 to-emerald-500";
      case "error":
        return "bg-gradient-to-r from-red-400 to-pink-500";
      default:
        return "bg-gradient-to-r from-blue-400 to-purple-500";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={status === "error" ? onClose : undefined}
      />

      {/* 模态框 */}
      <div className="relative w-full max-w-md">
        {/* 彩虹边框效果 */}
        <div
          className={cn(
            "absolute -inset-0.5 rounded-2xl opacity-75 blur-sm animate-pulse",
            `bg-gradient-to-r ${getStatusColor()}`
          )}
        />

        <div className="relative bg-black/90 backdrop-blur-xl rounded-2xl border border-white/10 p-8 shadow-2xl">
          {/* 状态图标 */}
          <div className="flex justify-center mb-6">
            <div
              className={cn(
                "p-4 rounded-full",
                status === "success" && "bg-green-500/10 animate-bounce",
                status === "error" && "bg-red-500/10",
                (status === "preparing" || status === "processing") &&
                  "bg-blue-500/10"
              )}
            >
              {getStatusIcon()}
            </div>
          </div>

          {/* 状态文本 */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-white mb-2">
              {status === "preparing" && "准备导出"}
              {status === "processing" && "正在导出"}
              {status === "success" && "导出完成"}
              {status === "error" && "导出失败"}
            </h3>
            <p className="text-gray-300 text-sm break-words px-2">
              {error || message}
            </p>
          </div>

          {/* 进度条 */}
          {(status === "preparing" || status === "processing") && (
            <div className="mb-6">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>进度</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all duration-500 ease-out",
                    getProgressBarColor()
                  )}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* 错误时的关闭按钮 */}
          {status === "error" && (
            <div className="text-center">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-red-300 hover:text-red-200 transition-colors duration-200"
              >
                关闭
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
