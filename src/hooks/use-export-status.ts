"use client";

import { useState, useCallback } from "react";

export type ExportStatus =
  | "idle"
  | "preparing"
  | "processing"
  | "success"
  | "error";

export interface ExportState {
  status: ExportStatus;
  progress: number;
  message: string;
  error?: string;
}

export const useExportStatus = () => {
  const [exportState, setExportState] = useState<ExportState>({
    status: "idle",
    progress: 0,
    message: "",
  });

  const setStatus = useCallback(
    (status: ExportStatus, message: string, progress: number = 0) => {
      setExportState((prev) => ({
        ...prev,
        status,
        message,
        progress,
        error: undefined,
      }));
    },
    []
  );

  const setError = useCallback((error: string) => {
    setExportState((prev) => ({
      ...prev,
      status: "error",
      error,
      message: "导出失败",
    }));
  }, []);

  const setProgress = useCallback((progress: number, message?: string) => {
    setExportState((prev) => ({
      ...prev,
      progress,
      message: message || prev.message,
    }));
  }, []);

  const reset = useCallback(() => {
    setExportState({
      status: "idle",
      progress: 0,
      message: "",
    });
  }, []);

  const startExport = useCallback(
    (message: string) => {
      setStatus("preparing", message, 0);
    },
    [setStatus]
  );

  const setSuccess = useCallback(
    (message: string) => {
      setStatus("success", message, 100);
    },
    [setStatus]
  );

  return {
    status: exportState.status,
    progress: exportState.progress,
    message: exportState.message,
    error: exportState.error || null,
    startExport,
    setProgress,
    setSuccess,
    setError,
    reset,
  };
};
