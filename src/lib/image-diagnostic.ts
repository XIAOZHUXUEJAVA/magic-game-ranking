/**
 * 图片诊断工具 - 帮助诊断导出时图片显示问题
 */

import { encodeImagePath } from "./image-utils";

export interface ImageDiagnosticResult {
  index: number;
  alt: string;
  currentSrc: string;
  originalSrc: string;
  encodedUrl: string;
  canLoad: boolean;
  naturalWidth: number;
  naturalHeight: number;
  complete: boolean;
  error?: string;
}

/**
 * 诊断所有图片的加载状态
 */
export async function diagnoseAllImages(
  elementId: string = "ranking-container"
): Promise<ImageDiagnosticResult[]> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`找不到元素: ${elementId}`);
    return [];
  }

  const images = element.querySelectorAll("img");
  console.log(`🔍 开始诊断 ${images.length} 张图片...`);

  const results: ImageDiagnosticResult[] = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    console.log(`\n📸 诊断图片 ${i + 1}: ${img.alt}`);

    try {
      // 获取原始路径
      let originalSrc = img.getAttribute("data-original-src") || img.alt;
      if (
        !originalSrc.endsWith(".jpg") &&
        !originalSrc.endsWith(".png") &&
        !originalSrc.endsWith(".svg")
      ) {
        originalSrc = originalSrc + ".jpg";
      }

      const fullPath = originalSrc.startsWith("/")
        ? originalSrc
        : `/covers/${originalSrc}`;

      const encodedPath = encodeImagePath(fullPath);
      const encodedUrl = window.location.origin + encodedPath;

      // 测试图片加载
      const canLoad = await testImageLoad(encodedUrl);

      const result: ImageDiagnosticResult = {
        index: i + 1,
        alt: img.alt,
        currentSrc: img.src,
        originalSrc: fullPath,
        encodedUrl: encodedUrl,
        canLoad: canLoad,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
      };

      results.push(result);

      // 输出诊断结果
      console.log(`   当前src: ${img.src}`);
      console.log(`   原始路径: ${fullPath}`);
      console.log(`   编码URL: ${encodedUrl}`);
      console.log(`   可以加载: ${canLoad ? "✅" : "❌"}`);
      console.log(`   尺寸: ${img.naturalWidth}x${img.naturalHeight}`);
      console.log(`   完成状态: ${img.complete ? "✅" : "❌"}`);

      if (!canLoad) {
        console.warn(`   ⚠️ 图片加载失败，可能的原因:`);
        console.warn(`      - 文件不存在: ${encodedUrl}`);
        console.warn(`      - 路径编码问题`);
        console.warn(`      - 网络问题`);
      }
    } catch (error) {
      console.error(`   ❌ 诊断失败:`, error);
      results.push({
        index: i + 1,
        alt: img.alt,
        currentSrc: img.src,
        originalSrc: "",
        encodedUrl: "",
        canLoad: false,
        naturalWidth: 0,
        naturalHeight: 0,
        complete: false,
        error: (error as Error).message,
      });
    }
  }

  // 输出总结
  console.log(`\n📊 诊断总结:`);
  const successCount = results.filter((r) => r.canLoad).length;
  const failCount = results.length - successCount;
  console.log(`   ✅ 成功: ${successCount} 张`);
  console.log(`   ❌ 失败: ${failCount} 张`);

  if (failCount > 0) {
    console.log(`\n🔧 修复建议:`);
    console.log(`   1. 检查失败的图片文件是否存在于 public/covers/ 目录`);
    console.log(`   2. 确保文件名与游戏名称完全匹配（包括特殊字符）`);
    console.log(`   3. 尝试重新启动开发服务器`);
    console.log(`   4. 检查文件权限和路径编码`);
  }

  return results;
}

/**
 * 测试单个图片是否可以加载
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

/**
 * 修复所有图片路径
 */
export async function fixAllImagePaths(
  elementId: string = "ranking-container"
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`找不到元素: ${elementId}`);
    return;
  }

  const images = element.querySelectorAll("img");
  console.log(`🔧 开始修复 ${images.length} 张图片路径...`);

  for (let i = 0; i < images.length; i++) {
    const img = images[i];

    try {
      // 获取原始路径
      let originalSrc = img.getAttribute("data-original-src") || img.alt;
      if (
        !originalSrc.endsWith(".jpg") &&
        !originalSrc.endsWith(".png") &&
        !originalSrc.endsWith(".svg")
      ) {
        originalSrc = originalSrc + ".jpg";
      }

      const fullPath = originalSrc.startsWith("/")
        ? originalSrc
        : `/covers/${originalSrc}`;

      const encodedPath = encodeImagePath(fullPath);
      const encodedUrl = window.location.origin + encodedPath;

      // 测试新路径
      const canLoad = await testImageLoad(encodedUrl);

      if (canLoad) {
        img.src = encodedUrl;
        img.setAttribute("data-original-src", fullPath);
        console.log(`✅ 修复图片 ${i + 1}: ${img.alt}`);
      } else {
        // 使用占位符
        img.src = "/covers/placeholder.svg";
        console.warn(`⚠️ 图片 ${i + 1} 无法加载，使用占位符: ${img.alt}`);
      }
    } catch (error) {
      console.error(`❌ 修复图片 ${i + 1} 失败:`, error);
      img.src = "/covers/placeholder.svg";
    }
  }

  console.log(`🎉 图片路径修复完成！`);
}

/**
 * 快速诊断函数（用于控制台调用）
 */
export function quickImageDiagnose(): void {
  console.log("🚀 开始快速图片诊断...");
  diagnoseAllImages("ranking-container");
}

/**
 * 快速修复函数（用于控制台调用）
 */
export function quickImageFix(): void {
  console.log("🚀 开始快速图片修复...");
  fixAllImagePaths("ranking-container");
}

// 添加到全局对象，方便在控制台调用
if (typeof window !== "undefined") {
  (window as any).diagnoseAllImages = diagnoseAllImages;
  (window as any).fixAllImagePaths = fixAllImagePaths;
  (window as any).quickImageDiagnose = quickImageDiagnose;
  (window as any).quickImageFix = quickImageFix;
}
