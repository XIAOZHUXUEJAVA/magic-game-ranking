import html2canvas from "html2canvas";
import domtoimage from "dom-to-image";
import { encodeImagePath } from "./image-utils";
import {
  getExportImageSrc,
  getEncodedImageUrl,
  prepareImagesForExport,
  testImageLoad,
} from "./export-image-utils";

export interface ExportOptions {
  filename?: string;
  format?: "png" | "jpeg";
  quality?: number;
  scale?: number;
}

// 将图片转换为 base64 以确保导出兼容性
async function convertImagesToBase64(element: HTMLElement): Promise<void> {
  // 首先准备所有图片的原始路径属性
  prepareImagesForExport(element);

  const images = element.querySelectorAll("img");
  const nextImages = element.querySelectorAll("[data-nimg]");

  const allImages = [
    ...images,
    ...Array.from(nextImages),
  ] as HTMLImageElement[];

  console.log(`开始转换 ${allImages.length} 张图片为 base64...`);

  const conversionPromises = allImages.map(async (img, index) => {
    try {
      // 创建一个新的图片元素来加载原始图片
      const tempImg = new Image();
      tempImg.crossOrigin = "anonymous";

      const base64 = await new Promise<string>((resolve, reject) => {
        tempImg.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            if (!ctx) {
              throw new Error("无法创建 Canvas 上下文");
            }

            canvas.width = tempImg.naturalWidth || 64;
            canvas.height = tempImg.naturalHeight || 64;

            ctx.drawImage(tempImg, 0, 0);
            const dataUrl = canvas.toDataURL("image/png");
            resolve(dataUrl);
          } catch (error) {
            console.warn(`图片 ${index + 1} 转换失败:`, error);
            reject(error);
          }
        };

        tempImg.onerror = () => {
          console.warn(`图片 ${index + 1} 加载失败:`, img.src);
          reject(new Error("图片加载失败"));
        };

        // 获取原始图片路径
        const originalSrc = getExportImageSrc(img);

        // 获取编码后的完整URL
        const encodedUrl = getEncodedImageUrl(originalSrc);

        console.log(
          `处理图片 ${index + 1}: 原始=${originalSrc}, 编码后=${encodedUrl}`
        );

        // 直接使用编码后的URL，如果失败会在onerror中处理
        tempImg.src = encodedUrl;
      });

      // 将原图片的 src 替换为 base64
      img.src = base64;
      img.setAttribute("data-original-src", img.src);
      console.log(`图片 ${index + 1} 转换成功`);
    } catch (error) {
      console.warn(`图片 ${index + 1} 转换失败，使用占位符:`, error);
      // 创建占位符 base64
      const placeholderBase64 = createPlaceholderBase64();
      img.src = placeholderBase64;
    }
  });

  await Promise.allSettled(conversionPromises);
  console.log("所有图片转换完成");
}

// 创建占位符的 base64 图片
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
  ctx.strokeRect(8, 8, 48, 48);

  ctx.fillStyle = "#9ca3af";
  ctx.font = "8px Arial";
  ctx.textAlign = "center";
  ctx.fillText("游戏", 32, 35);
  ctx.fillText("封面", 32, 45);

  return canvas.toDataURL("image/png");
}

export async function exportRankingAsImage(
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
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    // 显示加载状态
    const loadingToast = showLoadingToast("正在生成图片...");

    // 添加导出状态类来隐藏不需要的元素
    element.classList.add("exporting");

    // 将所有图片转换为 base64 格式以确保导出兼容性
    await convertImagesToBase64(element);

    // 给转换后的图片一些时间来渲染
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 使用 dom-to-image 进行导出（图片已转换为 base64，兼容性更好）
    console.log("使用 dom-to-image 导出...");

    try {
      const dataUrl = await domtoimage.toPng(element, {
        quality: quality,
        width: element.scrollWidth * scale,
        height: element.scrollHeight * scale,
        bgcolor: "#000000", // 设置背景色
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: element.scrollWidth + "px",
          height: element.scrollHeight + "px",
        },
        filter: (node: Node) => {
          // 过滤掉可能导致问题的元素
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            // 跳过 script 和 style 标签
            if (element.tagName === "SCRIPT" || element.tagName === "STYLE") {
              return false;
            }
            // 跳过隐藏元素
            if (
              element.classList?.contains("hidden") ||
              element.classList?.contains("export-hidden")
            ) {
              return false;
            }
          }
          return true;
        },
        // 由于图片已经转换为 base64，不需要处理跨域
        cacheBust: false,
        // 提高兼容性
        skipFonts: false,
      });

      // 下载图片
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${filename}-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      hideLoadingToast(loadingToast);
      showSuccessToast("排行榜已导出成功！");
    } catch (domError) {
      console.error("dom-to-image 导出失败:", domError);

      // 备用方案：尝试使用 html2canvas（但先处理 lab 颜色问题）
      console.log("尝试 html2canvas 备用方案...");

      try {
        // 临时移除可能包含 lab 颜色的样式
        const problematicElements = element.querySelectorAll("*");
        const originalStyles: Map<Element, string> = new Map();

        problematicElements.forEach((el) => {
          const htmlEl = el as HTMLElement;
          const computedStyle = window.getComputedStyle(htmlEl);

          // 检查是否有 lab 颜色
          const hasLabColor =
            computedStyle.cssText.includes("lab(") ||
            computedStyle.backgroundColor.includes("lab(") ||
            computedStyle.color.includes("lab(");

          if (hasLabColor) {
            originalStyles.set(el, htmlEl.style.cssText);
            // 替换为安全的颜色
            htmlEl.style.backgroundColor = "#000000";
            htmlEl.style.color = "#ffffff";
          }
        });

        const canvas = await html2canvas(element, {
          scale,
          useCORS: false,
          allowTaint: false,
          backgroundColor: "#000000",
          width: element.scrollWidth,
          height: element.scrollHeight,
          logging: false,
          imageTimeout: 0,
          ignoreElements: (el) => {
            return (
              el.tagName === "STYLE" ||
              el.tagName === "SCRIPT" ||
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

              hideLoadingToast(loadingToast);
              showSuccessToast("排行榜已导出成功！");
            } else {
              hideLoadingToast(loadingToast);
              showErrorToast("导出失败，请重试");
            }
          },
          `image/${format}`,
          quality
        );
      } catch (canvasError) {
        console.error("html2canvas 备用方案也失败:", canvasError);
        hideLoadingToast(loadingToast);
        showErrorToast("导出失败: " + (canvasError as Error).message);
      }
    }
  } catch (error) {
    console.error("Export failed:", error);
    showErrorToast("导出失败: " + (error as Error).message);
  } finally {
    // 移除导出状态类，恢复元素显示
    element.classList.remove("exporting");
  }
}

// 简单的toast通知系统
function showLoadingToast(message: string): HTMLElement {
  const toast = document.createElement("div");
  toast.className =
    "fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2";
  toast.innerHTML = `
    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  return toast;
}

function hideLoadingToast(toast: HTMLElement): void {
  if (toast && toast.parentNode) {
    toast.parentNode.removeChild(toast);
  }
}

function showSuccessToast(message: string): void {
  const toast = document.createElement("div");
  toast.className =
    "fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

function showErrorToast(message: string): void {
  const toast = document.createElement("div");
  toast.className =
    "fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 5000);
}
