/**
 * 快速修复导出图片破损问题的工具
 */

import { encodeImagePath } from "./image-utils";

/**
 * 一键修复图片显示问题
 */
export async function quickFixImages(elementId: string = "ranking-container"): Promise<void> {
  console.log("🚀 开始一键修复图片显示问题...");
  
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`❌ 找不到元素: ${elementId}`);
    return;
  }

  const images = element.querySelectorAll("img");
  console.log(`📸 发现 ${images.length} 张图片，开始修复...`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < images.length; i++) {
    const img = images[i] as HTMLImageElement;
    
    try {
      // 1. 获取游戏名称（从 alt 属性）
      const gameName = img.alt;
      if (!gameName) {
        console.warn(`⚠️ 图片 ${i + 1} 没有 alt 属性，跳过`);
        continue;
      }

      // 2. 构建正确的图片路径
      const imagePath = `/covers/${gameName}.jpg`;
      const encodedPath = encodeImagePath(imagePath);
      const fullUrl = window.location.origin + encodedPath;

      // 3. 测试图片是否可以加载
      const canLoad = await testImageLoad(fullUrl);
      
      if (canLoad) {
        // 4. 更新图片源
        img.src = fullUrl;
        img.setAttribute("data-original-src", imagePath);
        img.crossOrigin = "anonymous";
        
        console.log(`✅ 修复成功 ${i + 1}: ${gameName}`);
        successCount++;
      } else {
        // 5. 尝试其他格式
        const pngPath = `/covers/${gameName}.png`;
        const encodedPngPath = encodeImagePath(pngPath);
        const pngUrl = window.location.origin + encodedPngPath;
        
        const canLoadPng = await testImageLoad(pngUrl);
        
        if (canLoadPng) {
          img.src = pngUrl;
          img.setAttribute("data-original-src", pngPath);
          img.crossOrigin = "anonymous";
          
          console.log(`✅ 修复成功 ${i + 1}: ${gameName} (PNG)`);
          successCount++;
        } else {
          // 6. 使用占位符
          img.src = "/covers/placeholder.svg";
          img.setAttribute("data-original-src", "/covers/placeholder.svg");
          
          console.warn(`⚠️ 图片 ${i + 1} 无法加载，使用占位符: ${gameName}`);
          failCount++;
        }
      }
    } catch (error) {
      console.error(`❌ 修复图片 ${i + 1} 失败:`, error);
      failCount++;
    }
  }

  // 等待所有图片加载完成
  await waitForAllImagesLoad(element);

  console.log(`\n🎉 修复完成！`);
  console.log(`   ✅ 成功: ${successCount} 张`);
  console.log(`   ❌ 失败: ${failCount} 张`);
  
  if (failCount > 0) {
    console.log(`\n💡 如果还有图片显示问题，请检查:`);
    console.log(`   1. public/covers/ 目录下是否有对应的图片文件`);
    console.log(`   2. 文件名是否与游戏名称完全匹配`);
    console.log(`   3. 文件格式是否为 .jpg 或 .png`);
  }
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

    // 3秒超时
    setTimeout(() => resolve(false), 3000);
  });
}

/**
 * 等待所有图片加载完成
 */
function waitForAllImagesLoad(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const images = element.querySelectorAll("img");
    let loadedCount = 0;
    const totalCount = images.length;

    if (totalCount === 0) {
      resolve();
      return;
    }

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount >= totalCount) {
        console.log("📸 所有图片加载完成");
        resolve();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkComplete();
      } else {
        img.addEventListener("load", checkComplete, { once: true });
        img.addEventListener("error", checkComplete, { once: true });
      }
    });

    // 5秒超时
    setTimeout(() => {
      console.log("⏰ 图片加载超时，继续执行");
      resolve();
    }, 5000);
  });
}

/**
 * 简化的导出函数
 */
export async function quickExport(elementId: string = "ranking-container"): Promise<void> {
  console.log("🚀 开始快速导出...");
  
  // 1. 先修复图片
  await quickFixImages(elementId);
  
  // 2. 等待一下让图片渲染
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 3. 导出
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`❌ 找不到元素: ${elementId}`);
    return;
  }

  try {
    // 动态导入 html2canvas
    const html2canvas = (await import("html2canvas")).default;
    
    console.log("📸 正在生成图片...");
    
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#000000",
      logging: false,
      imageTimeout: 10000,
      ignoreElements: (el) => {
        return (
          el.tagName === "STYLE" ||
          el.tagName === "SCRIPT" ||
          el.classList?.contains("export-hidden")
        );
      },
    });

    // 下载图片
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `game-ranking-${new Date().toISOString().split("T")[0]}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log("✅ 导出成功！");
      } else {
        console.error("❌ 生成图片失败");
      }
    }, "image/png", 0.95);
    
  } catch (error) {
    console.error("❌ 导出失败:", error);
  }
}

// 添加到全局对象，方便在控制台调用
if (typeof window !== "undefined") {
  (window as any).quickFixImages = quickFixImages;
  (window as any).quickExport = quickExport;
}