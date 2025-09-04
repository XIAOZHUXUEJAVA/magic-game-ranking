import html2canvas from "html2canvas";
import domtoimage from "dom-to-image";

export interface ExportOptions {
  filename?: string;
  format?: "png" | "jpeg";
  quality?: number;
  scale?: number;
}

// 尝试原生截图（实验性功能）
async function tryNativeScreenshot(
  element: HTMLElement,
  options: { filename: string; format: string; quality: number }
): Promise<boolean> {
  // 这个功能需要用户手动授权，通常不适合自动化
  // 暂时返回 false，让程序使用备用方案
  return false;
}

// 完全替换样式系统为兼容版本
async function replaceWithCompatibleStyles(element: HTMLElement): Promise<{
  originalStyles: Map<Element, string>;
  cleanup: () => void;
}> {
  const originalStyles = new Map<Element, string>();

  // 保存所有元素的原始样式
  const allElements = element.querySelectorAll("*");
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    if (htmlEl.style.cssText) {
      originalStyles.set(el, htmlEl.style.cssText);
    }
  });

  // 保存根元素样式
  if (element.style.cssText) {
    originalStyles.set(element, element.style.cssText);
  }

  // 获取所有元素的计算样式并转换为兼容格式
  const elementsToProcess = [element, ...Array.from(allElements)];

  elementsToProcess.forEach((el) => {
    try {
      const computedStyle = window.getComputedStyle(el);
      const htmlEl = el as HTMLElement;

      // 提取关键样式属性
      const importantProps = [
        "display",
        "position",
        "top",
        "left",
        "right",
        "bottom",
        "width",
        "height",
        "margin",
        "padding",
        "border",
        "backgroundColor",
        "color",
        "fontSize",
        "fontWeight",
        "fontFamily",
        "textAlign",
        "lineHeight",
        "borderRadius",
        "boxShadow",
        "opacity",
        "zIndex",
        "overflow",
        "flexDirection",
        "alignItems",
        "justifyContent",
        "gridTemplateColumns",
        "gap",
      ];

      // 清除现有样式
      htmlEl.style.cssText = "";

      // 应用兼容的样式
      importantProps.forEach((prop) => {
        const value = computedStyle.getPropertyValue(prop);
        if (
          value &&
          value !== "none" &&
          value !== "auto" &&
          value !== "normal"
        ) {
          // 转换颜色值为RGB格式
          if (prop.includes("color") || prop.includes("Color")) {
            if (value.startsWith("rgb")) {
              htmlEl.style.setProperty(prop, value, "important");
            } else if (value.startsWith("#")) {
              htmlEl.style.setProperty(prop, value, "important");
            } else {
              // 对于其他颜色格式，尝试转换
              const tempDiv = document.createElement("div");
              tempDiv.style.color = value;
              document.body.appendChild(tempDiv);
              const rgbValue = window.getComputedStyle(tempDiv).color;
              document.body.removeChild(tempDiv);
              if (rgbValue.startsWith("rgb")) {
                htmlEl.style.setProperty(prop, rgbValue, "important");
              }
            }
          } else {
            htmlEl.style.setProperty(prop, value, "important");
          }
        }
      });

      // 处理背景图片
      const bgImage = computedStyle.backgroundImage;
      if (bgImage && bgImage !== "none") {
        if (bgImage.includes("gradient")) {
          // 简化渐变
          if (bgImage.includes("linear-gradient")) {
            htmlEl.style.setProperty(
              "background-image",
              "linear-gradient(135deg, #333333, #666666)",
              "important"
            );
          } else {
            htmlEl.style.setProperty(
              "background-color",
              "#333333",
              "important"
            );
          }
        } else {
          htmlEl.style.setProperty("background-image", bgImage, "important");
        }
      }
    } catch (error) {
      console.warn("Failed to process element styles:", error);
    }
  });

  // 返回清理函数
  const cleanup = () => {
    // 恢复所有原始样式
    originalStyles.forEach((cssText, el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.cssText = cssText;
    });

    // 清理没有原始样式的元素
    elementsToProcess.forEach((el) => {
      const htmlEl = el as HTMLElement;
      if (!originalStyles.has(el)) {
        htmlEl.style.cssText = "";
      }
    });
  };

  return { originalStyles, cleanup };
}

export async function exportRankingAsImage(
  elementId: string,
  options: ExportOptions = {}
): Promise<void> {
  const {
    filename = "game-ranking",
    format = "png",
    quality = 0.95,
    scale = 2,
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    // 显示加载状态
    const loadingToast = showLoadingToast("正在生成图片...");

    // 添加导出状态类来隐藏不需要的元素
    element.classList.add("exporting");

    // 等待图片加载完成
    await waitForImagesToLoad(element);

    // 首先尝试使用 dom-to-image（对现代CSS支持更好）
    try {
      console.log("尝试使用 dom-to-image...");

      const dataUrl = await domtoimage.toPng(element, {
        quality: quality,
        width: element.scrollWidth * scale,
        height: element.scrollHeight * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          width: element.scrollWidth + "px",
          height: element.scrollHeight + "px",
        },
      });

      // 下载图片
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${filename}-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      hideLoadingToast(loadingToast);
      showSuccessToast("排行榜已导出成功！");
      return;
    } catch (domToImageError) {
      console.log("dom-to-image 失败，尝试备用方案:", domToImageError);

      // 备用方案1：尝试简化的 dom-to-image
      try {
        console.log("尝试简化的 dom-to-image...");
        const dataUrl = await domtoimage.toPng(element);

        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = `${filename}-${
          new Date().toISOString().split("T")[0]
        }.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        hideLoadingToast(loadingToast);
        showSuccessToast("排行榜已导出成功！");
        return;
      } catch (simpleDomError) {
        console.log(
          "简化的 dom-to-image 也失败，使用 html2canvas:",
          simpleDomError
        );
      }
    }

    // 备用方案2：使用 html2canvas 但完全替换样式系统
    const { originalStyles, cleanup } = await replaceWithCompatibleStyles(
      element
    );

    try {
      console.log("使用 html2canvas 备用方案...");

      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#000000",
        width: element.scrollWidth,
        height: element.scrollHeight,
        ignoreElements: (el) => {
          return el.tagName === "STYLE" || el.tagName === "SCRIPT";
        },
      });

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `${filename}-${
              new Date().toISOString().split("T")[0]
            }.${format}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            hideLoadingToast(loadingToast);
            showSuccessToast("排行榜已导出成功！");
          } else {
            hideLoadingToast(loadingToast);
            showErrorToast("导出失败，请重试");
          }
        },
        `image/${format}`,
        quality
      );
    } finally {
      cleanup();
    }
  } catch (error) {
    console.error("Export failed:", error);
    showErrorToast("导出失败: " + (error as Error).message);
  } finally {
    // 移除导出状态类，恢复元素显示
    element.classList.remove("exporting");
  }
}

// 等待所有图片加载完成
function waitForImagesToLoad(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const images = element.querySelectorAll("img");
    if (images.length === 0) {
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        resolve();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkAllLoaded();
      } else {
        img.onload = checkAllLoaded;
        img.onerror = checkAllLoaded; // 即使加载失败也继续
      }
    });
  });
}

// 简单的toast通知系统
function showLoadingToast(message: string): HTMLElement {
  const toast = document.createElement("div");
  toast.className =
    "fixed top-4 right-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2";
  toast.innerHTML = `
    <div class="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
    <span>${message}</span>
  `;
  document.body.appendChild(toast);
  return toast;
}

function hideLoadingToast(toast: HTMLElement): void {
  if (toast && toast.parentNode) {
    toast.parentNode.removeChild(toast);
  }
}

function showSuccessToast(message: string): void {
  const toast = document.createElement("div");
  toast.className =
    "fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 3000);
}

function showErrorToast(message: string): void {
  const toast = document.createElement("div");
  toast.className =
    "fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 5000);
}
