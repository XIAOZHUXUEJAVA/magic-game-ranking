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
  let imageBackup: Array<{
    element: HTMLImageElement;
    originalSrc: string;
    originalDataSrc: string | null;
  }> = [];

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`找不到元素: ${elementId}`);
    }

    console.log("🚀 开始导出图片...");

    // 备份所有图片的原始状态
    imageBackup = backupAllImages(element);

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
      cacheBust: true, // 避免图片缓存问题
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
  } finally {
    // 无论成功还是失败，都要恢复图片状态
    if (imageBackup.length > 0) {
      console.log("🔄 恢复图片原始状态...");
      restoreAllImages(imageBackup);
      console.log("✅ 图片状态已恢复!");
    }
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
 * 备份所有图片的原始状态
 */
function backupAllImages(element: HTMLElement): Array<{
  element: HTMLImageElement;
  originalSrc: string;
  originalDataSrc: string | null;
}> {
  const images = element.querySelectorAll("img");
  console.log(`💾 备份 ${images.length} 张图片的原始状态...`);

  return Array.from(images).map((img) => {
    // 获取游戏信息
    const gameName = img.getAttribute("data-game-name") || img.alt;
    const gameId = img.getAttribute("data-game-id");

    // 获取当前的 data-original-src 属性
    let originalDataSrc = img.getAttribute("data-original-src");
    let trueSrc: string;

    // 如果还没有设置过 data-original-src，说明这是新添加的图片
    if (!originalDataSrc) {
      // 对于新添加的图片，构造正确的原始路径
      if (gameName && gameName.trim()) {
        const fileName = gameName.endsWith(".jpg")
          ? gameName
          : `${gameName}.jpg`;
        trueSrc = `/covers/${encodeURIComponent(fileName)}`;
      } else {
        // 如果没有游戏名称，使用当前的 src
        trueSrc = img.src;
      }

      // 设置 data-original-src 属性
      img.setAttribute("data-original-src", trueSrc);
      originalDataSrc = trueSrc;
      console.log(
        `📝 新图片首次备份: ${gameName} (ID: ${gameId}) -> ${trueSrc}`
      );
    } else {
      // 如果已经有 data-original-src，使用它作为真正的原始路径
      trueSrc = originalDataSrc;
      console.log(`📝 已有图片备份: ${gameName} (ID: ${gameId}) -> ${trueSrc}`);
    }

    return {
      element: img,
      originalSrc: trueSrc,
      originalDataSrc: originalDataSrc,
    };
  });
}

/**
 * 恢复所有图片的原始状态
 */
function restoreAllImages(
  imageBackup: Array<{
    element: HTMLImageElement;
    originalSrc: string;
    originalDataSrc: string | null;
  }>
): void {
  imageBackup.forEach((backup, index) => {
    try {
      const gameName =
        backup.element.getAttribute("data-game-name") || backup.element.alt;

      // 移除当前src中的时间戳参数（如果有的话）
      const currentSrcWithoutTimestamp = backup.element.src.split("?")[0];
      const originalSrcWithoutTimestamp = backup.originalSrc.split("?")[0];

      // 只有当原始路径与当前路径不同时才恢复
      // 这样可以避免不必要的图片重新加载
      if (currentSrcWithoutTimestamp !== originalSrcWithoutTimestamp) {
        backup.element.src = backup.originalSrc;
        console.log(
          `🔄 图片 ${index + 1} 路径已恢复: ${gameName} -> ${
            backup.originalSrc
          }`
        );
      }

      // 确保 data-original-src 保持正确（不带时间戳）
      if (backup.originalDataSrc) {
        const cleanOriginalSrc = backup.originalDataSrc.split("?")[0];
        backup.element.setAttribute("data-original-src", cleanOriginalSrc);
      }

      console.log(`✅ 图片 ${index + 1} 状态已确认: ${gameName}`);
    } catch (error) {
      console.warn(`⚠️ 图片 ${index + 1} 状态恢复失败:`, error);
    }
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
      // 获取游戏名称和ID用于构造正确路径
      const gameName = img.getAttribute("data-game-name") || img.alt;
      const gameId = img.getAttribute("data-game-id");

      console.log(`🔍 处理图片 ${index + 1}: ${gameName} (ID: ${gameId})`);

      // 检查是否已经有 data-original-src
      let originalSrc = img.getAttribute("data-original-src");

      if (!originalSrc) {
        // 对于新添加的图片，使用当前的 src 作为原始路径
        originalSrc = img.src;
        img.setAttribute("data-original-src", originalSrc);
        console.log(`📝 新图片保存原始路径: ${gameName} -> ${originalSrc}`);
      }

      // 强制重新构造正确的图片路径，基于游戏名称
      if (gameName && gameName.trim()) {
        const fileName = gameName.endsWith(".jpg")
          ? gameName
          : `${gameName}.jpg`;
        const correctPath = `/covers/${encodeURIComponent(fileName)}`;
        const fullCorrectPath = window.location.origin + correctPath;

        console.log(`🔄 验证图片路径: ${gameName} -> ${correctPath}`);

        // 测试正确路径是否可用
        if (await testImageLoad(fullCorrectPath)) {
          // 强制刷新图片，添加时间戳避免缓存
          const refreshedPath = `${correctPath}?t=${Date.now()}`;
          console.log(`✅ 更新图片路径: ${gameName} -> ${refreshedPath}`);
          await loadImage(img, refreshedPath);
          // 更新 data-original-src 为正确路径（不带时间戳）
          img.setAttribute("data-original-src", correctPath);
        } else {
          console.warn(`⚠️ 图片路径不可用: ${gameName} -> ${correctPath}`);
          // 尝试使用原始路径
          if (originalSrc && (await testImageLoad(originalSrc))) {
            console.log(`🔄 使用原始路径: ${gameName} -> ${originalSrc}`);
            await loadImage(img, originalSrc);
          } else {
            console.warn(`⚠️ 使用占位符: ${gameName}`);
            img.src = "/covers/placeholder.svg";
          }
        }
      } else {
        // 没有游戏名称，使用原始路径
        if (originalSrc && (await testImageLoad(originalSrc))) {
          await loadImage(img, originalSrc);
        } else {
          await waitForImageLoad(img);
        }
      }

      console.log(`✅ 图片 ${index + 1} 预处理完成: ${gameName}`);
    } catch (error) {
      console.warn(`⚠️ 图片 ${index + 1} 预处理失败: ${img.alt}`, error);
      img.src = "/covers/placeholder.svg";
    }
  });

  await Promise.all(imagePromises);
  console.log("🎉 所有图片预处理完成!");
}

/**
 * 测试图片是否可以加载
 */
function testImageLoad(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const testImg = new Image();

    const cleanup = () => {
      testImg.onload = null;
      testImg.onerror = null;
    };

    testImg.onload = () => {
      console.log(`✅ 图片加载成功: ${src}`);
      cleanup();
      resolve(true);
    };

    testImg.onerror = (error) => {
      console.log(`❌ 图片加载失败: ${src}`, error);
      cleanup();
      resolve(false);
    };

    testImg.crossOrigin = "anonymous";
    testImg.src = src;

    // 3秒超时
    setTimeout(() => {
      console.log(`⏰ 图片加载超时: ${src}`);
      cleanup();
      resolve(false);
    }, 3000);
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
  let imageBackup: Array<{
    element: HTMLImageElement;
    originalSrc: string;
    originalDataSrc: string | null;
  }> = [];

  try {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`找不到元素: ${elementId}`);
    }

    // 备份所有图片的原始状态
    imageBackup = backupAllImages(element);

    const exportOptions = {
      quality: options.quality || 0.95,
      backgroundColor: options.backgroundColor || "#000000",
      pixelRatio: options.pixelRatio || 2,
      skipFonts: options.skipFonts || false,
      width: options.width,
      height: options.height,
      cacheBust: true, // 避免图片缓存问题
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
  } finally {
    // 无论成功还是失败，都要恢复图片状态
    if (imageBackup.length > 0) {
      console.log("🔄 恢复图片原始状态...");
      restoreAllImages(imageBackup);
      console.log("✅ 图片状态已恢复!");
    }
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
