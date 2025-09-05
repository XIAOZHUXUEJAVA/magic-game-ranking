import html2canvas from "html2canvas";
import domtoimage from "dom-to-image";
import { encodeImagePath } from "./image-utils";

export interface ExportOptions {
  filename?: string;
  format?: "png" | "jpeg";
  quality?: number;
  scale?: number;
}

/**
 * 改进的图片导出函数，专门解决图片破碎问题
 */
export async function exportRankingImproved(
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
    const loadingToast = showLoadingToast("正在准备导出...");

    // 1. 预处理所有图片，确保它们都能正确加载
    await preprocessImages(element);

    // 2. 等待图片加载完成
    await waitForImagesLoad(element);

    // 更新加载状态
    updateLoadingToast(loadingToast, "正在生成图片...");

    // 3. 添加导出样式类
    element.classList.add("exporting");

    // 4. 使用改进的导出方法
    const success = await tryExportWithMultipleMethods(element, {
      filename,
      format,
      quality,
      scale,
    });

    if (success) {
      hideLoadingToast(loadingToast);
      showSuccessToast("排行榜已导出成功！");
    } else {
      hideLoadingToast(loadingToast);
      showErrorToast("导出失败，请检查图片是否正确加载");
    }
  } catch (error) {
    console.error("Export failed:", error);
    showErrorToast("导出失败: " + (error as Error).message);
  } finally {
    // 移除导出状态类
    element.classList.remove("exporting");
  }
}

/**
 * 预处理图片，确保路径正确且可访问
 */
async function preprocessImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll("img");
  console.log(`开始预处理 ${images.length} 张图片...`);

  const preprocessPromises = Array.from(images).map(async (img, index) => {
    try {
      // 获取原始图片路径
      let originalSrc = img.getAttribute("data-original-src") || img.alt;

      if (!originalSrc) {
        console.warn(`图片 ${index + 1} 没有原始路径信息`);
        return;
      }

      // 确保路径格式正确
      if (
        !originalSrc.endsWith(".jpg") &&
        !originalSrc.endsWith(".png") &&
        !originalSrc.endsWith(".svg")
      ) {
        originalSrc = originalSrc + ".jpg";
      }

      // 构建完整路径
      const fullPath = originalSrc.startsWith("/")
        ? originalSrc
        : `/covers/${originalSrc}`;

      // 编码路径
      const encodedPath = encodeImagePath(fullPath);
      const fullUrl = window.location.origin + encodedPath;

      console.log(`预处理图片 ${index + 1}: ${originalSrc} -> ${fullUrl}`);

      // 测试图片是否可以加载
      const canLoad = await testImageLoad(fullUrl);

      if (canLoad) {
        // 更新图片源
        img.src = fullUrl;
        img.setAttribute("data-processed", "true");
        console.log(`图片 ${index + 1} 预处理成功`);
      } else {
        // 使用占位符
        img.src = "/covers/placeholder.svg";
        img.setAttribute("data-processed", "fallback");
        console.warn(`图片 ${index + 1} 加载失败，使用占位符`);
      }
    } catch (error) {
      console.error(`预处理图片 ${index + 1} 失败:`, error);
      img.src = "/covers/placeholder.svg";
      img.setAttribute("data-processed", "error");
    }
  });

  await Promise.allSettled(preprocessPromises);
  console.log("图片预处理完成");
}

/**
 * 等待所有图片加载完成
 */
async function waitForImagesLoad(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll("img");
  console.log(`等待 ${images.length} 张图片加载完成...`);

  const loadPromises = Array.from(images).map((img, index) => {
    return new Promise<void>((resolve) => {
      if (img.complete && img.naturalHeight !== 0) {
        console.log(`图片 ${index + 1} 已加载`);
        resolve();
      } else {
        const onLoad = () => {
          console.log(`图片 ${index + 1} 加载完成`);
          img.removeEventListener("load", onLoad);
          img.removeEventListener("error", onError);
          resolve();
        };

        const onError = () => {
          console.warn(`图片 ${index + 1} 加载失败`);
          img.removeEventListener("load", onLoad);
          img.removeEventListener("error", onError);
          resolve(); // 即使失败也继续
        };

        img.addEventListener("load", onLoad);
        img.addEventListener("error", onError);

        // 5秒超时
        setTimeout(() => {
          img.removeEventListener("load", onLoad);
          img.removeEventListener("error", onError);
          console.warn(`图片 ${index + 1} 加载超时`);
          resolve();
        }, 5000);
      }
    });
  });

  await Promise.all(loadPromises);
  console.log("所有图片加载完成");
}

/**
 * 尝试多种导出方法
 */
async function tryExportWithMultipleMethods(
  element: HTMLElement,
  options: ExportOptions
): Promise<boolean> {
  const {
    filename = "game-ranking",
    format = "png",
    quality = 0.95,
    scale = 2,
  } = options;

  // 方法1: 使用 html2canvas
  try {
    console.log("尝试使用 html2canvas 导出...");

    const canvas = await html2canvas(element, {
      scale: scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#000000",
      width: element.scrollWidth,
      height: element.scrollHeight,
      logging: false,
      imageTimeout: 10000, // 增加超时时间
      onclone: (clonedDoc) => {
        // 在克隆的文档中确保图片路径正确
        const clonedImages = clonedDoc.querySelectorAll("img");
        clonedImages.forEach((img) => {
          // 确保使用绝对路径
          if (
            img.src &&
            !img.src.startsWith("http") &&
            !img.src.startsWith("data:")
          ) {
            img.src = window.location.origin + img.src;
          }
        });
      },
      ignoreElements: (el) => {
        return (
          el.tagName === "STYLE" ||
          el.tagName === "SCRIPT" ||
          el.classList?.contains("export-hidden")
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
        }
      },
      `image/${format}`,
      quality
    );

    return true;
  } catch (error) {
    console.error("html2canvas 导出失败:", error);
  }

  // 方法2: 使用 dom-to-image 作为备用
  try {
    console.log("尝试使用 dom-to-image 导出...");

    const dataUrl = await domtoimage.toPng(element, {
      quality: quality,
      width: element.scrollWidth * scale,
      height: element.scrollHeight * scale,
      bgcolor: "#000000",
      style: {
        transform: `scale(${scale})`,
        transformOrigin: "top left",
        width: element.scrollWidth + "px",
        height: element.scrollHeight + "px",
      },
      filter: (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (
            element.tagName === "SCRIPT" ||
            element.tagName === "STYLE" ||
            element.classList?.contains("export-hidden")
          ) {
            return false;
          }
        }
        return true;
      },
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

    return true;
  } catch (error) {
    console.error("dom-to-image 导出失败:", error);
  }

  return false;
}

/**
 * 测试图片是否可以加载
 */
function testImageLoad(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.crossOrigin = "anonymous";
    img.src = src;

    // 5秒超时
    setTimeout(() => resolve(false), 5000);
  });
}

// Toast 通知系统
function showLoadingToast(message: string): HTMLElement {
  const toast = document.createElement("div");
  toast.className =
    "fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2";
  toast.innerHTML = `
    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
    <span class="loading-message">${message}</span>
  `;
  document.body.appendChild(toast);
  return toast;
}

function updateLoadingToast(toast: HTMLElement, message: string): void {
  const messageEl = toast.querySelector(".loading-message");
  if (messageEl) {
    messageEl.textContent = message;
  }
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

// 添加到全局对象，方便调试
if (typeof window !== "undefined") {
  (window as any).exportRankingImproved = exportRankingImproved;
}
