import * as htmlToImage from "html-to-image";

/**
 * 使用 html-to-image 库的导出功能
 * 提供更稳定和可靠的图片导出体验
 */

export interface ExportOptions {
  format?: "png" | "jpeg" | "svg";
  quality?: number;
  width?: number;
  height?: number;
  backgroundColor?: string;
  pixelRatio?: number;
  skipFonts?: boolean;
  preferredFontFormat?: "woff" | "woff2" | "truetype" | "opentype";
}

/**
 * 导出元素为图片
 */
export async function exportElementAsImage(
  elementId: string,
  filename: string = "ranking",
  options: ExportOptions = {}
): Promise<void> {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`找不到元素: ${elementId}`);
    }

    console.log("🚀 开始导出图片...");

    // 准备导出选项
    const exportOptions = {
      quality: options.quality || 0.95,
      backgroundColor: options.backgroundColor || "#000000",
      pixelRatio: options.pixelRatio || 2,
      skipFonts: options.skipFonts || false,
      preferredFontFormat: options.preferredFontFormat || "woff2",
      width: options.width,
      height: options.height,
      style: {
        transform: "scale(1)",
        transformOrigin: "top left",
      },
    };

    // 预处理图片
    await preprocessImages(element);

    let dataUrl: string;

    // 根据格式选择导出方法
    switch (options.format) {
      case "jpeg":
        dataUrl = await htmlToImage.toJpeg(element, exportOptions);
        break;
      case "svg":
        dataUrl = await htmlToImage.toSvg(element, exportOptions);
        break;
      case "png":
      default:
        dataUrl = await htmlToImage.toPng(element, exportOptions);
        break;
    }

    // 下载图片
    downloadImage(dataUrl, `${filename}.${options.format || "png"}`);

    console.log("✅ 图片导出成功!");
  } catch (error) {
    console.error("❌ 导出失败:", error);
    throw error;
  }
}

/**
 * 导出为 PNG 格式
 */
export async function exportAsPng(
  elementId: string,
  filename: string = "ranking",
  options: Omit<ExportOptions, "format"> = {}
): Promise<void> {
  return exportElementAsImage(elementId, filename, {
    ...options,
    format: "png",
  });
}

/**
 * 导出为 JPEG 格式
 */
export async function exportAsJpeg(
  elementId: string,
  filename: string = "ranking",
  options: Omit<ExportOptions, "format"> = {}
): Promise<void> {
  return exportElementAsImage(elementId, filename, {
    ...options,
    format: "jpeg",
  });
}

/**
 * 导出为 SVG 格式
 */
export async function exportAsSvg(
  elementId: string,
  filename: string = "ranking",
  options: Omit<ExportOptions, "format"> = {}
): Promise<void> {
  return exportElementAsImage(elementId, filename, {
    ...options,
    format: "svg",
  });
}

/**
 * 预处理图片，确保所有图片都能正确加载
 */
async function preprocessImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll("img");
  console.log(`🔍 预处理 ${images.length} 张图片...`);

  const imagePromises = Array.from(images).map(async (img, index) => {
    try {
      // 如果图片已经加载完成，直接返回
      if (img.complete && img.naturalWidth > 0) {
        console.log(`✅ 图片 ${index + 1} 已加载: ${img.alt}`);
        return;
      }

      // 获取正确的图片路径
      const correctSrc = await getCorrectImageSrc(img);

      if (correctSrc && correctSrc !== img.src) {
        console.log(`🔄 更新图片 ${index + 1} 路径: ${img.alt}`);
        await loadImage(img, correctSrc);
      } else {
        // 等待当前图片加载完成
        await waitForImageLoad(img);
      }

      console.log(`✅ 图片 ${index + 1} 预处理完成: ${img.alt}`);
    } catch (error) {
      console.warn(`⚠️ 图片 ${index + 1} 预处理失败: ${img.alt}`, error);
      // 使用占位符
      img.src = "/covers/placeholder.svg";
    }
  });

  await Promise.all(imagePromises);
  console.log("🎉 所有图片预处理完成!");
}

/**
 * 获取正确的图片源路径
 */
async function getCorrectImageSrc(
  img: HTMLImageElement
): Promise<string | null> {
  // 1. 尝试使用 data-original-src
  const originalSrc = img.getAttribute("data-original-src");
  if (originalSrc) {
    const fullUrl = originalSrc.startsWith("/")
      ? window.location.origin + originalSrc
      : originalSrc;

    if (await testImageLoad(fullUrl)) {
      return fullUrl;
    }
  }

  // 2. 尝试从 alt 属性构造路径
  if (img.alt) {
    const fileName = img.alt.endsWith(".jpg") ? img.alt : `${img.alt}.jpg`;
    const constructedPath = `/covers/${encodeURIComponent(fileName)}`;
    const fullUrl = window.location.origin + constructedPath;

    if (await testImageLoad(fullUrl)) {
      return fullUrl;
    }
  }

  // 3. 尝试当前 src
  if (img.src && !img.src.startsWith("blob:") && !img.src.startsWith("data:")) {
    if (await testImageLoad(img.src)) {
      return img.src;
    }
  }

  return null;
}

/**
 * 测试图片是否可以加载
 */
function testImageLoad(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const testImg = new Image();
    testImg.onload = () => resolve(true);
    testImg.onerror = () => resolve(false);
    testImg.crossOrigin = "anonymous";
    testImg.src = src;

    // 3秒超时
    setTimeout(() => resolve(false), 3000);
  });
}

/**
 * 加载图片到指定的 img 元素
 */
function loadImage(img: HTMLImageElement, src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const onLoad = () => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
      resolve();
    };

    const onError = () => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
      reject(new Error(`Failed to load image: ${src}`));
    };

    img.addEventListener("load", onLoad);
    img.addEventListener("error", onError);
    img.crossOrigin = "anonymous";
    img.src = src;

    // 5秒超时
    setTimeout(() => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
      reject(new Error(`Image load timeout: ${src}`));
    }, 5000);
  });
}

/**
 * 等待图片加载完成
 */
function waitForImageLoad(img: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    if (img.complete && img.naturalWidth > 0) {
      resolve();
      return;
    }

    const onLoad = () => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
      resolve();
    };

    const onError = () => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
      resolve(); // 即使失败也继续
    };

    img.addEventListener("load", onLoad);
    img.addEventListener("error", onError);

    // 3秒超时
    setTimeout(() => {
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
      resolve();
    }, 3000);
  });
}

/**
 * 下载图片
 */
function downloadImage(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 获取元素的 base64 数据（不下载）
 */
export async function getElementAsBase64(
  elementId: string,
  options: ExportOptions = {}
): Promise<string> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`找不到元素: ${elementId}`);
  }

  const exportOptions = {
    quality: options.quality || 0.95,
    backgroundColor: options.backgroundColor || "#000000",
    pixelRatio: options.pixelRatio || 2,
    skipFonts: options.skipFonts || false,
    width: options.width,
    height: options.height,
  };

  await preprocessImages(element);

  switch (options.format) {
    case "jpeg":
      return await htmlToImage.toJpeg(element, exportOptions);
    case "svg":
      return await htmlToImage.toSvg(element, exportOptions);
    case "png":
    default:
      return await htmlToImage.toPng(element, exportOptions);
  }
}

/**
 * 快速导出函数（用于控制台调用）
 */
export function quickExport(format: "png" | "jpeg" | "svg" = "png"): void {
  console.log(`🚀 开始快速导出 ${format.toUpperCase()} 格式...`);
  exportElementAsImage(
    "ranking-container",
    `magic-game-ranking-${Date.now()}`,
    { format }
  );
}

// // 添加到全局对象，方便在控制台调用
// if (typeof window !== "undefined") {
//   (window as any).exportAsPng = exportAsPng;
//   (window as any).exportAsJpeg = exportAsJpeg;
//   (window as any).exportAsSvg = exportAsSvg;
//   (window as any).quickExport = quickExport;
//   (window as any).getElementAsBase64 = getElementAsBase64;
// }
