import { encodeImagePath } from "./image-utils";

/**
 * 简化版导出函数，专门用于测试图片加载问题
 */
export async function testExportImages(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`找不到元素: ${elementId}`);
    return;
  }

  const images = element.querySelectorAll("img");
  console.log(`=== 测试导出 ${images.length} 张图片 ===`);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    console.log(`\n--- 测试图片 ${i + 1}: ${img.alt} ---`);

    // 获取原始路径
    const originalSrc =
      img.getAttribute("data-original-src") || img.alt + ".jpg";
    const fullPath = originalSrc.startsWith("/")
      ? originalSrc
      : `/covers/${originalSrc}`;

    console.log(`原始路径: ${fullPath}`);

    // 编码路径
    const encodedPath = encodeImagePath(fullPath);
    const fullUrl = window.location.origin + encodedPath;

    console.log(`编码后URL: ${fullUrl}`);

    // 测试加载
    try {
      const success = await testImageLoad(fullUrl);
      console.log(`加载结果: ${success ? "✅ 成功" : "❌ 失败"}`);

      if (success) {
        // 尝试转换为base64
        const base64 = await convertToBase64(fullUrl);
        console.log(`Base64转换: ${base64 ? "✅ 成功" : "❌ 失败"}`);
      }
    } catch (error) {
      console.error(`测试失败:`, error);
    }
  }

  console.log(`\n=== 测试完成 ===`);
}

/**
 * 测试图片是否能加载
 */
function testImageLoad(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.crossOrigin = "anonymous";
    img.src = url;

    // 5秒超时
    setTimeout(() => resolve(false), 5000);
  });
}

/**
 * 将图片转换为base64
 */
function convertToBase64(url: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(null);
          return;
        }

        canvas.width = img.naturalWidth || 64;
        canvas.height = img.naturalHeight || 64;

        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      } catch (error) {
        console.error("Base64转换失败:", error);
        resolve(null);
      }
    };

    img.onerror = () => resolve(null);
    img.crossOrigin = "anonymous";
    img.src = url;

    // 5秒超时
    setTimeout(() => resolve(null), 5000);
  });
}

// 添加到全局对象
if (typeof window !== "undefined") {
  (window as any).testExportImages = testExportImages;
}
