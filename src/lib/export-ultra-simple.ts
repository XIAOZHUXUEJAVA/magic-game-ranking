import html2canvas from "html2canvas";

/**
 * 超级简化的导出功能
 * 完全避开所有可能的问题
 */

// 创建最简单的占位符
function createSimplePlaceholder(): string {
  return "data:image/svg+xml;base64," + btoa(`
    <svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
      <rect width="64" height="64" fill="#374151"/>
      <rect x="8" y="8" width="48" height="48" stroke="#6b7280" stroke-width="2" fill="none"/>
      <text x="32" y="30" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="8">游戏</text>
      <text x="32" y="42" text-anchor="middle" fill="#9ca3af" font-family="Arial" font-size="8">封面</text>
    </svg>
  `);
}

// 超简单的图片转换
async function simpleImageFix(img: HTMLImageElement): Promise<void> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    if (!ctx) {
      img.src = createSimplePlaceholder();
      resolve();
      return;
    }

    const newImg = new Image();
    newImg.crossOrigin = "anonymous";
    
    newImg.onload = () => {
      try {
        canvas.width = 64;
        canvas.height = 64;
        ctx.drawImage(newImg, 0, 0, 64, 64);
        img.src = canvas.toDataURL("image/png");
        resolve();
      } catch {
        img.src = createSimplePlaceholder();
        resolve();
      }
    };
    
    newImg.onerror = () => {
      img.src = createSimplePlaceholder();
      resolve();
    };

    // 获取原始路径
    const originalSrc = img.getAttribute("data-original-src") || img.src;
    if (originalSrc.startsWith("/")) {
      newImg.src = window.location.origin + originalSrc;
    } else {
      newImg.src = originalSrc;
    }
  });
}

// 超简单导出
export async function exportUltraSimple(): Promise<void> {
  const element = document.getElementById("ranking-container");
  if (!element) {
    alert("找不到排行榜容器");
    return;
  }

  try {
    // 显示提示
    const originalText = document.title;
    document.title = "正在导出...";

    // 克隆元素避免影响原页面
    const clone = element.cloneNode(true) as HTMLElement;
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";
    clone.style.background = "#000000";
    clone.style.color = "#ffffff";
    clone.style.width = element.offsetWidth + "px";
    
    document.body.appendChild(clone);

    // 修复克隆元素中的图片
    const images = clone.querySelectorAll("img");
    const imagePromises = Array.from(images).map(img => simpleImageFix(img));
    await Promise.all(imagePromises);

    // 移除所有按钮
    const buttons = clone.querySelectorAll("button, [role='button']");
    buttons.forEach(btn => btn.remove());

    // 等待渲染
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 使用最简单的配置导出
    const canvas = await html2canvas(clone, {
      backgroundColor: "#000000",
      scale: 1,
      logging: false,
      useCORS: false,
      allowTaint: true,
    });

    // 下载
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `game-ranking-${Date.now()}.png`;
        link.click();
        URL.revokeObjectURL(url);
        document.title = "导出成功！";
      } else {
        document.title = "导出失败";
      }
      
      setTimeout(() => {
        document.title = originalText;
      }, 2000);
    });

    // 清理
    document.body.removeChild(clone);

  } catch (error) {
    console.error("导出失败:", error);
    document.title = "导出失败: " + (error as Error).message;
    setTimeout(() => {
      document.title = originalText;
    }, 3000);
  }
}

// 全局函数
(window as any).exportUltraSimple = exportUltraSimple;

console.log("🚀 超简单导出已加载，使用: exportUltraSimple()");