# 产品需求文档 (PRD) - CommuteFlow

**—— 个人知识流转与通勤学习助手 (Web Client)**

| 文档属性 | 内容 |
| :--- | :--- |
| **项目名称** | CommuteFlow Web |
| **版本号** | **v7.0 (Final Architecture)** |
| **核心理念** | 极速采集、智能编排、强制内化、自由流转 |
| **状态** | **待开发** |
| **技术栈建议** | Next.js (React), TailwindCSS, Lark Open API |

-----

## 1. 系统概览与架构 (System Overview)

### 1.1 产品定义
CommuteFlow 是一个连接内容采集与知识内化的 **“中间件”**。它不生产内容，而是将分散在各平台（B站/小红书等）的“稍后观看”转化为有序的“通勤播放列表”，并强制用户在观看后进行归档或笔记，形成闭环。

### 1.2 核心架构逻辑
系统由三个解耦的模块组成：
1.  **输入端 (Upstream)**：iOS 快捷指令。负责极速采集 URL 和标题，写入数据库。
2.  **数据中心 (Database)**：飞书多维表格 (Lark Base)。作为 **唯一真实数据源 (Single Source of Truth)**。
3.  **客户端 (Client)**：Mobile Web App。负责数据的展示、本地筛选、播放调度与状态回写。

-----

## 2. 业务流程图 (Core Workflow)

```mermaid
graph TD
    A[用户打开 Web App / 刷新] --> B{并发同步数据}
    B --> |API: Get ToWatch List| C[内存: 待看视频列表]
    B --> |API: Get Tag Metadata| D[内存: 标签配置(颜色/ID)]
    
    C & D --> E[渲染首页 Dashboard]
    E --> |动态计算| E1[标签云: 仅展示当前存在的分类]
    
    E --> F{用户决策}
    F --> |本地筛选| G[点击标签 -> 毫秒级过滤]
    F --> |加入队列| H[点击 [+] -> 更新 LocalStorage]
    
    H --> I[点击播放列表 -> 唤起第三方 App]
    
    I --> |看完切回| J[触发过渡控制器 (Overlay)]
    
    J --> K[上半区: 强制反馈]
    K --> |删除| L1[Delete -> 移除本地 & 飞书Trash]
    K --> |已阅| L2[Done -> 移除本地 & 飞书Done]
    K --> |笔记| L3[Note -> 弹窗输入文本 -> 飞书Done]
    
    L1 & L2 & L3 --> M{下一步}
    M --> |播放下一个| N[唤起 App]
    M --> |跳过| O[加载再下一个]
```

-----

## 3. 功能模块详解 (Functional Modules)

### 3.1 模块一：数据展示与同步 (Dashboard & Sync)

**目标**：平衡数据实时性与展示性能，实现“零延迟”筛选。

*   **F1.1 并发同步机制 (OnLoad / Refresh)**
    *   **请求 A (Video Data)**：请求飞书 API 获取所有 `Status=ToWatch` 的记录。
    *   **请求 B (Meta Data)**：请求飞书 API 获取“标签(Tags)”字段的元数据（包含 Option ID, Name, Color）。
    *   **清洗逻辑**：比对本地 `LocalStorage` 队列与返回的 Video Data，剔除已不在待看列表中的死链 ID。

*   **F1.2 动态标签云 (Dynamic Tag Cloud)**
    *   **逻辑**：前端遍历 **请求 A** 返回的视频列表，提取所有出现的标签。
    *   **渲染**：
        *   **内容**：仅展示当前列表中包含的标签（避免“空房间”效应）。
        *   **样式**：匹配 **请求 B** 中的颜色配置，保持与飞书后台视觉一致。
    *   **交互**：点击标签时，执行 **本地过滤 (Local Filter)**，不发起网络请求。

*   **F1.3 搜索策略 (Hybrid Search)**
    *   **默认 (Local Search)**：用户输入关键词 -> 前端过滤当前列表 -> 实时展示结果。
    *   **全局 (Global Search)**：
        *   **触发**：开启 `[搜索全部]` 开关或点击“在云端搜索”。
        *   **逻辑**：后端请求飞书搜索接口（含已读 `Done` 内容）。
        *   **UI**：全局搜索结果展示时，顶部标签栏置灰/隐藏（不再支持对搜索结果的二次标签筛选）。

### 3.2 模块二：平台适配器 (Platform Adapter)

*   **F2.1 动态协议**
    *   前端 Config：`{ "Bilibili": "bilibili://video/{id}", "Xiaohongshu": "xhsdiscover://item/{id}" }`。
*   **F2.2 跳转兜底**
    *   若无法解析 ID 或唤起失败，默认在浏览器新标签页打开原始 URL。

### 3.3 模块三：播放队列 (Playlist)

*   **F3.1 队列管理**
    *   **加入/移除**：操作 LocalStorage 中的 `cf_playlist_queue` 数组。
    *   **状态**：队列仅存于本地，不修改飞书数据。
*   **F3.2 播放聚焦**
    *   点击列表播放时，展示“大卡片聚焦模式”，显示完整简介，再次点击卡片唤起 App。

### 3.4 模块四：过渡控制器 (Transition Controller)

**目标**：极简交互，快速闭环。

*   **触发**：App 可见性变化 (VisibilityChange) + 存在 `cf_last_played_id`。
*   **A. 上半区：反馈 (Feedback)**
    *   **[ 🗑 删除 ]**：标记 Trash。
    *   **[ ✅ 已阅 ]**：标记 Done。
    *   **[ 📝 记笔记 ]**：
        *   点击弹出简单 Modal。
        *   内容：**纯文本 Textarea** (不含标签选择器)。
        *   提交后：追加到飞书 `Notes` 字段，并标记为 Done。
*   **B. 下半区：流转 (Flow)**
    *   **[ ▶ 播放下一个 ]**：取队列 Top 1，唤起 App。
    *   **[ ⏭ 跳过 ]**：Top 1 移至队尾，取新的 Top 1。

-----

## 4. 数据契约 (Data Schema)

### 4.1 飞书多维表格字段

| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| **Title** | Text | 视频标题 |
| **URL** | Link | 原始链接 |
| **Status** | Single Select | `ToWatch` (默认), `Done`, `Trash` |
| **Platform** | Single Select | 自动计算或手动 |
| **Tags** | Multi Select | **需请求字段元数据获取颜色配置** |
| **Notes** | Text | 用户笔记 |

### 4.2 接口策略摘要

| 操作场景 | HTTP Method | 目标 | 说明 |
| :--- | :--- | :--- | :--- |
| **首页加载** | GET (Concurrent) | `/videos?status=ToWatch`<br>`/fields/tags` | 并发请求内容与配置 |
| **标签筛选** | N/A | Local Memory | 纯前端过滤 |
| **普通搜索** | N/A | Local Memory | 纯前端过滤 |
| **全局搜索** | POST | `/search` | 仅在显式请求时调用 |
| **完成/归档** | PATCH | `/videos/{id}` | 更新 Status 和 Notes |

-----

## 5. 开发优先级 (Roadmap)

1.  **Phase 1 (MVP)**
    *   实现飞书 API 连接 (Read ToWatch + Read Tag Meta)。
    *   实现首页瀑布流 + **动态标签云渲染**。
    *   实现基础跳转适配 + 过渡页的“已阅/删除”功能。
2.  **Phase 2 (Playlist)**
    *   LocalStorage 队列管理。
    *   过渡页的“播放下一个”循环逻辑。
3.  **Phase 3 (Enhancement)**
    *   笔记输入弹窗。
    *   全局搜索接口对接。

-----
