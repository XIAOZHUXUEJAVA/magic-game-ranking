import html2canvas from "html2canvas";

export interface ExportOptions {
  filename?: string;
  format?: "png" | "jpeg";
  quality?: number;
  scale?: number;
}

/**
 * 最终修复版本的图片导出功能
 * 专门解决图片破损问题
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

// 简化的导出函数
export async function exportRankingFixed(
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

  try {
    // 显示加载提示
    const toast = showToast("正在准备导出...", "loading");

    // 添加导出样式类
    element.classList.add("exporting");

    // 修复所有图片为 base64 格式
    await fixAllImagesToBase64(element);

    // 等待图片渲染
    await new Promise((resolve) => setTimeout(resolve, 1000));

    updateToast(toast, "正在生成图片...", "loading");

    // 临时移除可能包含 lab 颜色的样式
    const problematicElements = element.querySelectorAll("*");
    const originalStyles: Map<Element, string> = new Map();

    problematicElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computedStyle = window.getComputedStyle(htmlEl);

      // 检查是否有 lab 颜色或其他不兼容的颜色函数
      const hasProblematicColor =
        computedStyle.cssText.includes("lab(") ||
        computedStyle.backgroundColor.includes("lab(") ||
        computedStyle.color.includes("lab(") ||
        computedStyle.borderColor?.includes("lab(") ||
        computedStyle.cssText.includes("oklch(") ||
        computedStyle.cssText.includes("oklab(");

      if (hasProblematicColor) {
        originalStyles.set(el, htmlEl.style.cssText);
        // 替换为安全的颜色
        if (
          computedStyle.backgroundColor.includes("lab(") ||
          computedStyle.backgroundColor.includes("oklch(")
        ) {
          htmlEl.style.backgroundColor = "#000000";
        }
        if (
          computedStyle.color.includes("lab(") ||
          computedStyle.color.includes("oklch(")
        ) {
          htmlEl.style.color = "#ffffff";
        }
        if (
          computedStyle.borderColor?.includes("lab(") ||
          computedStyle.borderColor?.includes("oklch(")
        ) {
          htmlEl.style.borderColor = "#333333";
        }
      }
    });

    // 使用 html2canvas 导出
    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: false,
      allowTaint: true, // 允许污染，因为我们已经转换为 base64
      backgroundColor: "#000000",
      width: element.scrollWidth,
      height: element.scrollHeight,
      logging: false,
      imageTimeout: 0,
      removeContainer: false,
      ignoreElements: (el) => {
        return (
          el.tagName === "SCRIPT" ||
          el.tagName === "STYLE" ||
          el.classList?.contains("hidden") ||
          el.classList?.contains("export-hidden")
        );
      },
    });

    // 恢复原始样式
    originalStyles.forEach((cssText, el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.cssText = cssText;
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
    // 移除导出样式类
    element.classList.remove("exporting");
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
(window as any).quickFixExport = () => {
  exportRankingFixed("ranking-container");
};

// 诊断函数 - 检查图片状态
(window as any).diagnoseImages = () => {
  const container = document.getElementById("ranking-container");
  if (!container) {
    console.error("找不到排行榜容器");
    return;
  }

  const images = container.querySelectorAll("img");
  console.log(`发现 ${images.length} 张图片:`);

  images.forEach((img, index) => {
    const src = img.src;
    const originalSrc = img.getAttribute("data-original-src");
    const alt = img.alt;

    console.log(`图片 ${index + 1}:`);
    console.log(`  当前 src: ${src}`);
    console.log(`  原始 src: ${originalSrc}`);
    console.log(`  alt 文本: ${alt}`);
    console.log(`  是否加载: ${img.complete}`);
    console.log(`  自然尺寸: ${img.naturalWidth}x${img.naturalHeight}`);
    console.log("---");
  });
};

console.log("🔧 图片导出修复工具已加载");
console.log("💡 快速导出: quickFixExport()");
console.log("🔍 诊断图片: diagnoseImages()");
