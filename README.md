# 🎮 Magic Game Ranking

> 一个现代化的游戏排行榜制作工具，让你轻松创建专属的游戏排行榜

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1.0-blue?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)

## 📖 项目简介

Magic Game Ranking 是一个基于 Next.js 构建的现代化游戏排行榜制作工具。您可以使用这个工具轻松创建美观的游戏排行榜

## ✨ 功能特性

### 🏆 双模式排行榜

- **排行模式**: 传统的 1-N 位排行榜，适合最佳游戏排序
- **梯队模式**: 等级分类，适合游戏分层评价

### 🎯 核心功能

- **🔍 智能搜索**: 快速查找和添加游戏
- **🖱️ 拖拽排序**: 直观的拖拽操作，实时调整排名
- **🎨 美观界面**: 现代化设计，深色主题
- **📸 图片导出**: 一键导出为高质量 PNG 图片

## 🛠️ 技术栈

### 前端框架

- **[Next.js 15.5.2](https://nextjs.org/)** - React 全栈框架，支持 Turbopack
- **[React 19.1.0](https://reactjs.org/)** - 用户界面构建库
- **[TypeScript 5.0](https://www.typescriptlang.org/)** - 类型安全的 JavaScript

### 样式与 UI

- **[Tailwind CSS 4.0](https://tailwindcss.com/)** - 原子化 CSS 框架
- **[Magic UI](https://magicui.design/)** - 现代化 UI 组件库
- **[Radix UI](https://www.radix-ui.com/)** - 无障碍 UI 基础组件
- **[Lucide React](https://lucide.dev/)** - 精美的图标库

### 状态管理与工具

- **[Zustand](https://zustand-demo.pmnd.rs/)** - 轻量级状态管理
- **[DND Kit](https://dndkit.com/)** - 现代化拖拽功能
- **[html-to-image](https://github.com/bubkoo/html-to-image)** - HTML 转图片导出
- **[Motion](https://motion.dev/)** - 高性能动画库

## 🚀 安装与运行

### 📋 环境要求

- Node.js 18.0 或更高版本
- npm、yarn、pnpm 或 bun 包管理器

### 📥 克隆项目

```bash
git clone https://github.com/XIAOZHUXUEJAVA/magic-game-ranking.git
cd magic-game-ranking
```

### 📦 安装依赖

```bash
# 使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install

# 或使用 bun
bun install
```

### 🏃‍♂️ 启动开发服务器

```bash
# 使用 npm
npm run dev

# 或使用 yarn
yarn dev

# 或使用 pnpm
pnpm dev

# 或使用 bun
bun dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 🏗️ 构建生产版本

```bash
# 构建项目
npm run build

# 启动生产服务器
npm run start
```

### 🔍 代码检查

```bash
npm run lint
```

## 📁 项目结构

```
magic-game-ranking/
├── 📁 public/                 # 静态资源
│   └── 📁 covers/            # 游戏封面图片
├── 📁 src/                   # 源代码
│   ├── 📁 app/               # Next.js App Router
│   │   ├── 📄 layout.tsx     # 根布局
│   │   ├── 📄 page.tsx       # 首页
│   │   └── 📄 globals.css    # 全局样式
│   ├── 📁 components/        # React 组件
│   │   ├── 📁 ui/            # 基础 UI 组件
│   │   ├── 📁 magicui/       # Magic UI 组件
│   │   ├── 📄 game-card.tsx  # 游戏卡片组件
│   │   ├── 📄 tier-ranking.tsx # 梯队排行组件
│   │   └── 📄 top-ranking.tsx  # Top排行组件
│   ├── 📁 hooks/             # 自定义 Hooks
│   ├── 📁 lib/               # 工具库
│   │   ├── 📄 games.ts       # 游戏数据
│   │   ├── 📄 utils.ts       # 通用工具函数
│   │   └── 📄 html-to-image-export.ts # 导出功能
│   ├── 📁 store/             # 状态管理
│   │   └── 📄 ranking-store.ts # 排行榜状态
│   └── 📁 types/             # TypeScript 类型定义
│       └── 📄 game.ts        # 游戏相关类型
├── 📄 package.json           # 项目配置
├── 📄 tailwind.config.js     # Tailwind 配置
├── 📄 tsconfig.json          # TypeScript 配置
└── 📄 next.config.ts         # Next.js 配置
```

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给它一个星标！**

Made with ❤️ by xiaozhu

</div>
