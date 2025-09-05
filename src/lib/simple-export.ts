import domtoimage from "dom-to-image";

// 简化版导出函数，专门用于测试
export async function simpleExport(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`找不到元素: ${elementId}`);
    return;
  }

  console.log("开始简单导出测试...");

  try {
    // 先转换图片为 base64
    await convertImagesToBase64Simple(element);

    // 等待一下让图片渲染
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 使用最简单的 dom-to-image 配置
    const dataUrl = await domtoimage.toPng(element, {
      bgcolor: "#000000",
      filter: (node: Node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          return element.tagName !== "SCRIPT" && element.tagName !== "STYLE";
        }
        return true;
      },
    });

    // 下载图片
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `test-export-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("导出成功！");
  } catch (error) {
    console.error("导出失败:", error);
  }
}

// 简化的图片转换函数
async function convertImagesToBase64Simple(
  element: HTMLElement
): Promise<void> {
  const images = element.querySelectorAll("img");
  console.log(`转换 ${images.length} 张图片...`);

  for (const img of images) {
    const imgElement = img as HTMLImageElement;

    try {
      // 如果已经是 base64，跳过
      if (imgElement.src.startsWith("data:")) {
        continue;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) continue;

      // 等待图片加载
      if (!imgElement.complete) {
        await new Promise((resolve, reject) => {
          imgElement.onload = resolve;
          imgElement.onerror = reject;
          setTimeout(reject, 5000); // 5秒超时
        });
      }

      canvas.width = imgElement.naturalWidth || 64;
      canvas.height = imgElement.naturalHeight || 64;

      ctx.drawImage(imgElement, 0, 0);
      const base64 = canvas.toDataURL("image/png");

      imgElement.src = base64;
      console.log("图片转换成功");
    } catch (error) {
      console.warn("图片转换失败，使用占位符:", error);
      imgElement.src = createSimplePlaceholder();
    }
  }
}

// 创建简单的占位符
function createSimplePlaceholder(): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx)
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

  canvas.width = 64;
  canvas.height = 64;

  ctx.fillStyle = "#374151";
  ctx.fillRect(0, 0, 64, 64);

  ctx.fillStyle = "#9ca3af";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("游戏", 32, 30);
  ctx.fillText("封面", 32, 45);

  return canvas.toDataURL("image/png");
}

// 在控制台使用：
// import { simpleExport } from './lib/simple-export';
// simpleExport('ranking-container');
