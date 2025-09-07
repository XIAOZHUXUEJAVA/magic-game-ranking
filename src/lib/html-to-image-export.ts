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

    // 备份所有图片的原始状态
    imageBackup = backupAllImages(element);

    // 添加导出类来隐藏不需要的元素（如+按钮）
    element.classList.add("exporting");

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
        // 确保有足够的边距来包含所有内容
        padding: "20px",
        boxSizing: "content-box",
        // 确保容器有足够的宽度
        minWidth: "100%",
        overflow: "visible",
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
  } catch (error) {
    throw error;
  } finally {
    // 无论成功还是失败，都要恢复图片状态和移除导出类
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove("exporting");
    }
    if (imageBackup.length > 0) {
      restoreAllImages(imageBackup);
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
    } else {
      // 如果已经有 data-original-src，使用它作为真正的原始路径
      trueSrc = originalDataSrc;
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
      }

      // 确保 data-original-src 保持正确（不带时间戳）
      if (backup.originalDataSrc) {
        const cleanOriginalSrc = backup.originalDataSrc.split("?")[0];
        backup.element.setAttribute("data-original-src", cleanOriginalSrc);
      }
    } catch (error) {}
  });
}

/**
 * 预处理图片，确保所有图片都能正确加载
 */
async function preprocessImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll("img");

  const imagePromises = Array.from(images).map(async (img, index) => {
    try {
      // 获取游戏名称和ID用于构造正确路径
      const gameName = img.getAttribute("data-game-name") || img.alt;
      const gameId = img.getAttribute("data-game-id");

      // 检查是否已经有 data-original-src
      let originalSrc = img.getAttribute("data-original-src");

      if (!originalSrc) {
        // 对于新添加的图片，使用当前的 src 作为原始路径
        originalSrc = img.src;
        img.setAttribute("data-original-src", originalSrc);
      }

      // 强制重新构造正确的图片路径，基于游戏名称
      if (gameName && gameName.trim()) {
        const fileName = gameName.endsWith(".jpg")
          ? gameName
          : `${gameName}.jpg`;
        const correctPath = `/covers/${encodeURIComponent(fileName)}`;
        const fullCorrectPath = window.location.origin + correctPath;

        // 测试正确路径是否可用
        if (await testImageLoad(fullCorrectPath)) {
          // 强制刷新图片，添加时间戳避免缓存
          const refreshedPath = `${correctPath}?t=${Date.now()}`;

          await loadImage(img, refreshedPath);
          // 更新 data-original-src 为正确路径（不带时间戳）
          img.setAttribute("data-original-src", correctPath);
        } else {
          // 尝试使用原始路径
          if (originalSrc && (await testImageLoad(originalSrc))) {
            await loadImage(img, originalSrc);
          } else {
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
    } catch (error) {
      img.src = "/covers/placeholder.svg";
    }
  });

  await Promise.all(imagePromises);
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
      cleanup();
      resolve(true);
    };

    testImg.onerror = (error) => {
      cleanup();
      resolve(false);
    };

    testImg.crossOrigin = "anonymous";
    testImg.src = src;

    // 3秒超时
    setTimeout(() => {
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

    // 添加导出类来隐藏不需要的元素（如+按钮）
    element.classList.add("exporting");

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
    // 无论成功还是失败，都要恢复图片状态和移除导出类
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.remove("exporting");
    }
    if (imageBackup.length > 0) {
      restoreAllImages(imageBackup);
    }
  }
}
