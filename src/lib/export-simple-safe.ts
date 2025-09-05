import html2canvas from "html2canvas";

export interface ExportOptions {
  filename?: string;
  format?: "png" | "jpeg";
  quality?: number;
  scale?: number;
}

/**
 * 简化且安全的图片导出功能
 * 避免所有可能导致 html2canvas 问题的颜色函数
 */

// 创建占位符图片的 base64
function createPlaceholderBase64(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  }

  canvas.width = 64;
  canvas.height = 64;

  // 绘制占位符
  ctx.fillStyle = "#374151";
  ctx.fillRect(0, 0, 64, 64);

  ctx.strokeStyle = "#6b7280";
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, 48, 48);

  ctx.fillStyle = "#9ca3af";
  ctx.font = "10px Arial";
  ctx.textAlign = "center";
  ctx.fillText("游戏", 32, 30);
  ctx.fillText("封面", 32, 42);

  return canvas.toDataURL("image/png");
}

// 将图片转换为 base64
async function convertImageToBase64(
  imgElement: HTMLImageElement
): Promise<string> {
  return new Promise((resolve) => {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve(createPlaceholderBase64());
        return;
      }

      // 创建新的图片元素来加载原始图片
      const img = new Image();
      img.crossOrigin = "anonymous";

      img.onload = () => {
        try {
          canvas.width = img.naturalWidth || 64;
          canvas.height = img.naturalHeight || 64;
          ctx.drawImage(img, 0, 0);
          const base64 = canvas.toDataURL("image/png");
          resolve(base64);
        } catch (error) {
          console.warn("图片转换失败，使用占位符:", error);
          resolve(createPlaceholderBase64());
        }
      };

      img.onerror = () => {
        console.warn("图片加载失败，使用占位符");
        resolve(createPlaceholderBase64());
      };

      // 获取图片的原始路径
      const originalSrc =
        imgElement.getAttribute("data-original-src") || imgElement.src;

      // 如果是相对路径，转换为绝对路径
      if (originalSrc.startsWith("/")) {
        img.src = window.location.origin + originalSrc;
      } else {
        img.src = originalSrc;
      }
    } catch (error) {
      console.warn("图片处理异常，使用占位符:", error);
      resolve(createPlaceholderBase64());
    }
  });
}

// 修复所有图片为 base64 格式
async function fixAllImagesToBase64(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll("img");
  console.log(`开始修复 ${images.length} 张图片...`);

  const promises = Array.from(images).map(async (img, index) => {
    try {
      const base64 = await convertImageToBase64(img);
      img.src = base64;
      console.log(`图片 ${index + 1}/${images.length} 修复完成`);
    } catch (error) {
      console.warn(`图片 ${index + 1} 修复失败:`, error);
      img.src = createPlaceholderBase64();
    }
  });

  await Promise.all(promises);
  console.log("所有图片修复完成");
}

// 加载安全导出样式
function loadExportSafeStyles(): HTMLStyleElement {
  const style = document.createElement("style");
  style.id = "export-safe-styles";
  style.textContent = `
    /* 导出安全样式 - 覆盖所有可能导致问题的样式 */
    .exporting * {
      background: inherit !important;
      color: inherit !important;
      border-color: #374151 !important;
      box-shadow: none !important;
      text-shadow: none !important;
      filter: none !important;
      backdrop-filter: none !important;
      animation: none !important;
      transition: none !important;
      transform: none !important;
    }

    .exporting {
      background: #000000 !important;
      color: #ffffff !important;
    }

    .exporting img {
      display: block !important;
      width: auto !important;
      height: auto !important;
      max-width: 64px !important;
      max-height: 64px !important;
      object-fit: cover !important;
      opacity: 1 !important;
      visibility: visible !important;
      border-radius: 8px !important;
    }

    .exporting button,
    .exporting [role="button"] {
      display: none !important;
    }

    .exporting h1, .exporting h2, .exporting h3 {
      color: #ffffff !important;
    }

    .exporting p, .exporting span, .exporting div {
      color: #e5e7eb !important;
    }
  `;
  document.head.appendChild(style);
  return style;
}

// 移除安全导出样式
function removeExportSafeStyles(): void {
  const style = document.getElementById("export-safe-styles");
  if (style) {
    style.remove();
  }
}

// 简化的导出函数
export async function exportRankingSafe(
  elementId: string,
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = "game-ranking",
    format = "png",
    quality = 0.95,
    scale = 2,
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`找不到元素: ${elementId}`);
  }

  let styleElement: HTMLStyleElement | null = null;

  try {
    // 显示加载提示
    const toast = showToast("正在准备导出...", "loading");

    // 加载安全样式
    styleElement = loadExportSafeStyles();

    // 添加导出样式类
    element.classList.add("exporting");

    // 修复所有图片为 base64 格式
    await fixAllImagesToBase64(element);

    // 等待图片渲染
    await new Promise((resolve) => setTimeout(resolve, 1000));

    updateToast(toast, "正在生成图片...", "loading");

    // 使用最简单的 html2canvas 配置
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: false,
      allowTaint: true,
      backgroundColor: "#000000",
      logging: false,
      imageTimeout: 0,
      removeContainer: false,
      ignoreElements: (el) => {
        return (
          el.tagName === "SCRIPT" ||
          el.tagName === "STYLE" ||
          el.classList?.contains("hidden") ||
          el.classList?.contains("export-hidden") ||
          el.tagName === "BUTTON"
        );
      },
    });

    // 导出图片
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${filename}-${
            new Date().toISOString().split("T")[0]
          }.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          updateToast(toast, "导出成功！", "success");
          setTimeout(() => hideToast(toast), 3000);
        } else {
          updateToast(toast, "导出失败，请重试", "error");
          setTimeout(() => hideToast(toast), 5000);
        }
      },
      `image/${format}`,
      quality
    );
  } catch (error) {
    console.error("导出失败:", error);
    showToast(`导出失败: ${(error as Error).message}`, "error");
  } finally {
    // 清理
    element.classList.remove("exporting");
    if (styleElement) {
      removeExportSafeStyles();
    }
  }
}

// 简单的 Toast 通知系统
function showToast(
  message: string,
  type: "loading" | "success" | "error"
): HTMLElement {
  const toast = document.createElement("div");
  const colors = {
    loading: "bg-blue-600",
    success: "bg-green-600",
    error: "bg-red-600",
  };

  toast.className = `fixed top-4 right-4 z-50 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2`;

  if (type === "loading") {
    toast.innerHTML = `
      <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
      <span>${message}</span>
    `;
  } else {
    toast.textContent = message;
  }

  document.body.appendChild(toast);
  return toast;
}

function updateToast(
  toast: HTMLElement,
  message: string,
  type: "loading" | "success" | "error"
): void {
  const colors = {
    loading: "bg-blue-600",
    success: "bg-green-600",
    error: "bg-red-600",
  };

  toast.className = `fixed top-4 right-4 z-50 ${colors[type]} text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2`;

  if (type === "loading") {
    toast.innerHTML = `
      <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
      <span>${message}</span>
    `;
  } else {
    toast.textContent = message;
  }
}

function hideToast(toast: HTMLElement): void {
  if (toast && toast.parentNode) {
    toast.parentNode.removeChild(toast);
  }
}

// 快速修复函数 - 可以在控制台直接调用
(window as any).quickExportSafe = () => {
  exportRankingSafe("ranking-container");
};

console.log("🔧 安全图片导出工具已加载");
console.log("💡 快速安全导出: quickExportSafe()");
