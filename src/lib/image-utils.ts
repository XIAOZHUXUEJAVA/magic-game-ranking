/**
 * 对图片路径进行URL编码处理
 * 处理文件名中的特殊字符，确保图片能正确加载
 */
export function encodeImagePath(imagePath: string): string {
  if (!imagePath) return imagePath;

  // 分离路径和文件名
  const lastSlashIndex = imagePath.lastIndexOf("/");
  if (lastSlashIndex === -1) return imagePath;

  const basePath = imagePath.substring(0, lastSlashIndex + 1);
  const fileName = imagePath.substring(lastSlashIndex + 1);

  // 对文件名进行编码，但保留路径分隔符
  const encodedFileName = encodeURIComponent(fileName);

  return basePath + encodedFileName;
}

/**
 * 检查图片是否加载完成
 */
export function checkImageLoaded(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

/**
 * 预加载图片
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
