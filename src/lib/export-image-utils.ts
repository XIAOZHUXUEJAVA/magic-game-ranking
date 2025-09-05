import { encodeImagePath } from "./image-utils";

/**
 * 专门用于导出时的图片路径处理
 */
export function getExportImageSrc(img: HTMLImageElement): string {
  // 1. 优先使用 data-original-src 属性
  let originalSrc = img.getAttribute("data-original-src");

  if (originalSrc) {
    console.log(`使用 data-original-src: ${originalSrc}`);
    return originalSrc;
  }

  // 2. 从当前 src 中提取原始路径
  const currentSrc = img.src;

  // 如果是 blob 或 data URL，尝试从 alt 属性重构路径
  if (currentSrc.startsWith("blob:") || currentSrc.startsWith("data:")) {
    const altText = img.alt;
    if (altText) {
      originalSrc = `/covers/${altText}.jpg`;
      console.log(`从 alt 属性重构路径: ${originalSrc}`);
      return originalSrc;
    }
  }

  // 3. 如果是完整URL，提取路径部分
  if (currentSrc.includes("/covers/")) {
    const pathStart = currentSrc.indexOf("/covers/");
    originalSrc = currentSrc.substring(pathStart);
    console.log(`从完整URL提取路径: ${originalSrc}`);
    return originalSrc;
  }

  // 4. 直接返回当前src作为fallback
  console.log(`使用当前src作为fallback: ${currentSrc}`);
  return currentSrc;
}

/**
 * 为导出准备图片元素，确保所有图片都有正确的原始路径属性
 */
export function prepareImagesForExport(element: HTMLElement): void {
  const images = element.querySelectorAll("img");

  images.forEach((img, index) => {
    // 如果没有 data-original-src，尝试设置一个
    if (!img.getAttribute("data-original-src")) {
      const originalSrc = getExportImageSrc(img);
      img.setAttribute("data-original-src", originalSrc);
      console.log(`为图片 ${index + 1} 设置原始路径: ${originalSrc}`);
    }
  });
}

/**
 * 检查图片是否可以加载
 */
export function testImageLoad(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      console.log(`图片加载成功: ${src}`);
      resolve(true);
    };
    img.onerror = () => {
      console.warn(`图片加载失败: ${src}`);
      resolve(false);
    };

    // 设置超时
    setTimeout(() => {
      console.warn(`图片加载超时: ${src}`);
      resolve(false);
    }, 5000);

    img.src = src;
  });
}

/**
 * 获取编码后的完整URL用于加载
 */
export function getEncodedImageUrl(originalPath: string): string {
  // 确保是绝对路径
  const absolutePath = originalPath.startsWith("/")
    ? window.location.origin + originalPath
    : originalPath;

  // 对路径进行编码
  if (absolutePath.includes("/covers/")) {
    const pathPart = absolutePath.substring(absolutePath.indexOf("/covers/"));
    const encodedPath = encodeImagePath(pathPart);
    return absolutePath.replace(pathPart, encodedPath);
  }

  return absolutePath;
}
