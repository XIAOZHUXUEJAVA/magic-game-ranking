# 图片导出修复指南

## 问题描述

导出图片后，每个游戏 image 都显示破碎的图案，这是由于以下几个原因造成的：

1. **Next.js Image 组件问题**：Next.js 的 `Image` 组件在导出时会被优化，导致导出库无法正确处理
2. **图片路径编码问题**：特殊字符的游戏名称在路径中需要正确编码
3. **图片加载时机问题**：导出时图片可能还没有完全加载
4. **跨域访问限制**：某些情况下存在跨域问题

## 修复方案

### 1. 创建专用的导出组件

已创建 `src/components/game-card-export.tsx`，使用原生 `<img>` 标签替代 Next.js `Image` 组件：

```tsx
// 使用原生 img 标签，避免 Next.js 优化问题
<img
  src={getImageSrc()}
  alt={game.name}
  data-original-src={game.image}
  style={{
    maxWidth: "100%",
    height: "auto",
    objectFit: "cover",
  }}
/>
```

### 2. 改进的导出函数

创建了 `src/lib/export-improved.ts`，包含以下改进：

- **图片预处理**：导出前确保所有图片都正确加载
- **多种导出方法**：html2canvas 和 dom-to-image 双重保障
- **路径修复**：自动修复图片路径问题
- **错误处理**：完善的错误处理和重试机制

### 3. 图片诊断工具

创建了 `src/lib/image-diagnostic.ts`，提供以下功能：

- **图片状态诊断**：检查所有图片的加载状态
- **路径验证**：验证图片路径是否正确
- **自动修复**：自动修复有问题的图片路径

### 4. 导出样式修复

创建了 `src/app/export-fix.css`，确保导出时样式正确：

```css
/* 确保导出时图片正确显示 */
.exporting img {
  display: block !important;
  width: auto !important;
  height: auto !important;
  max-width: 64px !important;
  max-height: 64px !important;
  object-fit: cover !important;
  opacity: 1 !important;
  visibility: visible !important;
}
```

## 使用方法

### 方法 1：使用改进的导出功能

导出按钮现在使用改进的导出函数，会自动处理图片问题。

### 方法 2：手动诊断和修复

在浏览器控制台中运行以下命令：

```javascript
// 诊断所有图片状态
quickImageDiagnose();

// 自动修复图片路径
quickImageFix();

// 详细诊断
diagnoseAllImages("ranking-container");

// 手动修复路径
fixAllImagePaths("ranking-container");
```

### 方法 3：检查图片文件

确保以下几点：

1. **文件存在**：检查 `public/covers/` 目录下是否有对应的图片文件
2. **文件名匹配**：确保文件名与游戏名称完全匹配（包括特殊字符）
3. **文件格式**：支持 `.jpg`、`.png`、`.svg` 格式
4. **文件权限**：确保文件可以被访问

## 常见问题解决

### Q1: 图片仍然显示破碎

**解决方案：**

1. 在控制台运行 `quickImageDiagnose()` 查看具体问题
2. 检查对应的图片文件是否存在于 `public/covers/` 目录
3. 确认文件名是否正确（注意特殊字符和大小写）

### Q2: 部分图片正常，部分图片破碎

**解决方案：**

1. 运行 `quickImageFix()` 自动修复
2. 检查破碎图片的文件名是否包含特殊字符
3. 手动重命名有问题的图片文件

### Q3: 导出速度很慢

**解决方案：**

1. 减少同时导出的游戏数量
2. 优化图片大小（建议 64x64 像素）
3. 使用更快的导出格式（PNG vs JPEG）

### Q4: 导出的图片质量不好

**解决方案：**

1. 调整导出参数中的 `scale` 值（默认为 2）
2. 调整 `quality` 值（默认为 0.95）
3. 选择合适的导出格式

## 技术细节

### 图片路径处理

```typescript
// 路径编码处理
const getImageSrc = () => {
  const imagePath = game.image.startsWith("/")
    ? game.image
    : `/covers/${game.image}`;
  return encodeImagePath(imagePath);
};
```

### 导出配置

```typescript
const exportOptions = {
  filename: "game-ranking",
  format: "png" as const,
  quality: 0.95,
  scale: 2,
};
```

### 图片预加载

```typescript
// 确保图片完全加载后再导出
await preloadAllImages(element);
const success = await tryExportWithMultipleMethods(element, options);
```

## 更新日志

- **v1.0**: 初始修复方案
- **v1.1**: 添加图片诊断工具
- **v1.2**: 改进导出函数，支持多种方法
- **v1.3**: 添加 CSS 样式修复
- **v1.4**: 完善错误处理和重试机制

## 注意事项

1. **开发环境**：修复主要针对开发环境，生产环境可能需要额外配置
2. **浏览器兼容性**：某些旧版浏览器可能不支持部分功能
3. **性能影响**：图片预处理会增加导出时间，但提高成功率
4. **文件大小**：导出的图片大小取决于游戏数量和图片质量设置

如果问题仍然存在，请检查浏览器控制台的错误信息，或联系开发者获取进一步支持。
