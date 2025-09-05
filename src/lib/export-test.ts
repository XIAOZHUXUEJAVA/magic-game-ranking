/**
 * 导出功能测试和诊断工具
 */

export function diagnoseExportIssues(elementId: string): void {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`找不到元素: ${elementId}`);
    return;
  }

  console.log("=== 导出诊断开始 ===");

  // 检查所有图片
  const images = element.querySelectorAll("img");
  const nextImages = element.querySelectorAll("[data-nimg]");

  console.log(`发现 ${images.length} 个 img 元素`);
  console.log(`发现 ${nextImages.length} 个 Next.js Image 组件`);

  // 诊断每个图片
  images.forEach((img, index) => {
    const imgElement = img as HTMLImageElement;
    console.log(`\n图片 ${index + 1}:`);
    console.log(`  - src: ${imgElement.src}`);
    console.log(`  - complete: ${imgElement.complete}`);
    console.log(`  - naturalWidth: ${imgElement.naturalWidth}`);
    console.log(`  - naturalHeight: ${imgElement.naturalHeight}`);
    console.log(`  - crossOrigin: ${imgElement.crossOrigin}`);

    if (!imgElement.complete || imgElement.naturalHeight === 0) {
      console.warn(`  ⚠️ 图片可能有问题`);
    } else {
      console.log(`  ✅ 图片正常`);
    }
  });

  // 检查占位符是否存在
  fetch("/covers/placeholder.svg")
    .then((response) => {
      if (response.ok) {
        console.log("✅ 占位符图片存在");
      } else {
        console.error("❌ 占位符图片不存在");
      }
    })
    .catch(() => {
      console.error("❌ 无法访问占位符图片");
    });

  console.log("=== 导出诊断结束 ===");
}

// 测试 base64 转换功能
export async function testBase64Conversion(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`找不到元素: ${elementId}`);
    return;
  }

  console.log("=== 测试 Base64 转换 ===");

  const images = element.querySelectorAll("img");
  console.log(`准备转换 ${images.length} 张图片`);

  for (let i = 0; i < images.length; i++) {
    const img = images[i] as HTMLImageElement;
    const originalSrc = img.src;

    try {
      const tempImg = new Image();
      tempImg.crossOrigin = "anonymous";

      const base64 = await new Promise<string>((resolve, reject) => {
        tempImg.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("无法创建 Canvas 上下文"));
            return;
          }

          canvas.width = tempImg.naturalWidth || 64;
          canvas.height = tempImg.naturalHeight || 64;

          ctx.drawImage(tempImg, 0, 0);
          resolve(canvas.toDataURL("image/png"));
        };

        tempImg.onerror = () => reject(new Error("图片加载失败"));
        tempImg.src = originalSrc;
      });

      console.log(
        `图片 ${i + 1} 转换成功，大小: ${Math.round(base64.length / 1024)}KB`
      );
    } catch (error) {
      console.error(`图片 ${i + 1} 转换失败:`, error);
    }
  }

  console.log("=== Base64 转换测试完成 ===");
}

// 在浏览器控制台中使用：
// import { diagnoseExportIssues, testBase64Conversion } from './lib/export-test';
// diagnoseExportIssues('ranking-container');
// testBase64Conversion('ranking-container');
