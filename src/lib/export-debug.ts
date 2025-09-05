import { getExportImageSrc, getEncodedImageUrl, testImageLoad } from "./export-image-utils";

/**
 * 调试导出时的图片问题
 */
export async function debugExportImages(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`找不到元素: ${elementId}`);
    return;
  }

  const images = element.querySelectorAll("img");
  console.log(`=== 导出图片调试 (共 ${images.length} 张图片) ===`);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    console.log(`\n--- 图片 ${i + 1} ---`);
    console.log(`Alt: ${img.alt}`);
    console.log(`当前 src: ${img.src}`);
    console.log(`data-original-src: ${img.getAttribute("data-original-src")}`);
    
    // 获取原始路径
    const originalSrc = getExportImageSrc(img);
    console.log(`解析的原始路径: ${originalSrc}`);
    
    // 获取编码后的URL
    const encodedUrl = getEncodedImageUrl(originalSrc);
    console.log(`编码后的URL: ${encodedUrl}`);
    
    // 测试加载
    console.log(`测试加载编码URL...`);
    const canLoadEncoded = await testImageLoad(encodedUrl);
    console.log(`编码URL加载结果: ${canLoadEncoded ? "成功" : "失败"}`);
    
    if (!canLoadEncoded) {
      // 测试原始URL
      const fallbackUrl = originalSrc.startsWith("/") 
        ? window.location.origin + originalSrc 
        : originalSrc;
      console.log(`测试加载原始URL: ${fallbackUrl}`);
      const canLoadFallback = await testImageLoad(fallbackUrl);
      console.log(`原始URL加载结果: ${canLoadFallback ? "成功" : "失败"}`);
      
      if (!canLoadFallback) {
        // 尝试直接使用文件名构造路径
        const fileName = img.alt + ".jpg";
        const directUrl = window.location.origin + "/covers/" + encodeURIComponent(fileName);
        console.log(`测试直接构造URL: ${directUrl}`);
        const canLoadDirect = await testImageLoad(directUrl);
        console.log(`直接构造URL加载结果: ${canLoadDirect ? "成功" : "失败"}`);
      }
    }
  }
  
  console.log(`\n=== 调试完成 ===`);
}

/**
 * 在浏览器控制台中使用的快捷函数
 */
export function quickDebug(): void {
  console.log("开始调试导出图片...");
  debugExportImages("ranking-container");
}

// 将函数添加到全局对象，方便在控制台调用
if (typeof window !== "undefined") {
  (window as any).debugExportImages = debugExportImages;
  (window as any).quickDebug = quickDebug;
}