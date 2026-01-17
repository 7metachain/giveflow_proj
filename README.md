# SHE³ (GiveFlow) - 可验证慈善资金网络

<p align="center">
  <img src="app/public/logo.png" alt="SHE³ Logo" width="120" />
</p>

<p align="center">
  <strong>透明 · 可验证 · AI 驱动</strong>
</p>

<p align="center">
  基于 Monad 区块链的女性健康与教育慈善平台
</p>

<p align="center">
  <a href="#特性">特性</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#快速开始">快速开始</a> •
  <a href="#项目结构">项目结构</a> •
  <a href="#智能合约">智能合约</a> •
  <a href="#演示">演示</a>
</p>

---

## 🌸 项目简介

**SHE³** 是一个专注于亚洲农村女性健康与教育的慈善捐赠平台，基于 Monad 区块链构建。我们通过 AI 智能审核和链上透明追踪，确保每一分钱都用在刀刃上。

### 核心价值

| 价值点 | 说明 |
|--------|------|
| 🎯 **零抽成直达** | 个人捐款 100% 到达受益人，平台不收取任何中间费用 |
| 👁️ **双视角透明** | 捐赠者追踪资金去向 + 受益人凭证审核提款 |
| 🤖 **AI 凭证审核** | 受益人提款需上传凭证，AI 自动识别鉴定后释放资金 |
| 💼 **x402 企业付费** | 企业用户通过 x402 协议按需付费，获取高级报告与服务 |
| ⚡ **并行微捐** | Monad 低 Gas + 并行执行，支持 0.01 MON 起捐 |

---

## ✨ 特性

### 🎭 双视角设计

```
┌─────────────────────────────────────────────────────────────────┐
│                      捐赠者视角 (Donor View)                     │
├─────────────────────────────────────────────────────────────────┤
│  "我的钱去哪了？"                                                │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ 我的捐赠 │ → │ 项目资金池│ → │ 里程碑释放│ → │ 使用凭证 │  │
│  │  10 MON  │    │ 1000 MON │    │  阶段1   │    │ 医疗收据 │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   受益人视角 (Beneficiary View)                  │
├─────────────────────────────────────────────────────────────────┤
│  "如何提取资金？"                                                │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ 筹款进度 │ → │ 上传凭证 │ → │ AI 审核  │ → │ 资金释放 │  │
│  │  80%     │    │ 发票/收据│    │ 自动鉴定 │    │ 到账通知 │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 🤖 AI 智能审核

- **OCR 提取**：识别凭证中的金额、日期、收款方
- **真实性检测**：检测图片是否被 PS / 伪造
- **格式验证**：是否为有效的发票/收据格式
- **用途匹配**：凭证内容与里程碑用途是否一致
- **审核上链**：审核结果永久存证，透明可查

### 💼 x402 企业付费

企业用户通过 HTTP 402 协议按需付费：

| 服务 | 收费方式 | 价格示例 |
|------|----------|----------|
| 月度捐赠报告 | 按次 | 5 MON / 次 |
| 年度影响力报告 | 按次 | 20 MON / 次 |
| 税务凭证生成 | 按次 | 10 MON / 份 |
| 批量捐赠 API | 按调用量 | 0.1 MON / 次 |
| 优先 AI 审核通道 | 按次 | 2 MON / 次 |

---

## 🛠️ 技术栈

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **前端** | Next.js 15 + App Router | SSR + 现代 React |
| **UI** | shadcn/ui + TailwindCSS | 温暖人文风格设计 |
| **钱包** | wagmi v2 + viem + RainbowKit | Web3 交互 |
| **AI** | DeepSeek API | 凭证 OCR + 智能对话 |
| **区块链** | Monad Testnet | 低 Gas + 高吞吐 |
| **合约** | Solidity | 链上逻辑 |

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- MetaMask 钱包（配置 Monad Testnet）

### 安装依赖

```bash
# 克隆项目
git clone https://github.com/7metachain/giveflow_proj.git
cd giveflow_proj/app

# 安装依赖
npm install
```

### 环境配置

创建 `.env.local` 文件：

```env
# AI API
AI_API_KEY=your_deepseek_api_key

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# 合约地址 (Monad Testnet)
NEXT_PUBLIC_CAMPAIGN_REGISTRY=0x...
NEXT_PUBLIC_MILESTONE_VAULT=0x...
NEXT_PUBLIC_BATCH_DONATE=0x...
NEXT_PUBLIC_PROOF_REGISTRY=0x...
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### Monad Testnet 配置

在 MetaMask 中添加网络：

| 参数 | 值 |
|------|-----|
| 网络名称 | Monad Testnet |
| RPC URL | https://testnet-rpc.monad.xyz |
| Chain ID | 10143 |
| 货币符号 | MON |
| 区块浏览器 | https://testnet.monadexplorer.com |

---

## 📁 项目结构

```
giveflow_proj/
├── app/                          # Next.js 应用
│   ├── src/
│   │   ├── app/                  # 页面路由
│   │   │   ├── page.tsx          # 首页
│   │   │   ├── campaigns/        # 项目列表/详情
│   │   │   ├── dashboard/        # 仪表盘
│   │   │   │   ├── donor/        # 捐赠者仪表盘
│   │   │   │   ├── beneficiary/  # 受益人仪表盘
│   │   │   │   └── enterprise/   # 企业仪表盘
│   │   │   ├── proof/            # 凭证上传
│   │   │   └── api/              # API 路由
│   │   │       ├── chat/         # AI 对话
│   │   │       ├── proof/        # 凭证审核
│   │   │       └── enterprise/   # 企业服务
│   │   ├── components/           # 组件
│   │   │   ├── chat/             # 聊天机器人
│   │   │   ├── ui/               # UI 组件
│   │   │   └── ...
│   │   ├── lib/                  # 工具库
│   │   │   ├── web3.ts           # Web3 配置
│   │   │   ├── contracts.ts      # 合约 ABI
│   │   │   ├── ai-client.ts      # AI 客户端
│   │   │   └── mock-data.ts      # 模拟数据
│   │   └── hooks/                # 自定义 Hooks
│   └── contracts/                # 智能合约源码
├── specs/                        # 项目规格文档
│   ├── final_version.md          # 最终版本规划
│   └── ...
└── README.md
```

---

## 📜 智能合约

### 合约架构

```
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│CampaignRegistry│  │ MilestoneVault │  │  BatchDonate   │
│ 项目注册管理   │  │ 凭证审核释放   │  │  批量捐赠      │
└────────────────┘  └────────────────┘  └────────────────┘

┌────────────────┐  ┌────────────────┐
│ x402PaymentHub │  │ ProofRegistry  │
│ 企业付费结算   │  │ 凭证哈希存证   │
└────────────────┘  └────────────────┘
```

### 主要合约

| 合约 | 功能 |
|------|------|
| **CampaignRegistry** | 项目注册、查询、管理 |
| **MilestoneVault** | 里程碑管理、凭证验证、资金释放 |
| **BatchDonate** | 批量捐赠、捐赠历史记录 |
| **ProofRegistry** | 凭证提交、AI 审核结果存证 |
| **x402PaymentHub** | 企业服务付费结算 |

### 合约地址 (Monad Testnet)

```
CampaignRegistry: 0x...
MilestoneVault:   0x...
BatchDonate:      0x...
ProofRegistry:    0x...
```

---

## 🎬 演示

### 3 分钟 Demo 流程

| 时间 | 场景 | 亮点 |
|------|------|------|
| 0:00-0:20 | 开场 | 问题 + 方案一句话 |
| 0:20-1:20 | **AI 审核** | 上传凭证 → AI 识别 → 自动放款 |
| 1:20-2:00 | **双视角** | 捐赠者看到凭证 + 资金流 |
| 2:00-2:40 | **x402** | 企业付费一键完成 |
| 2:40-3:00 | 结尾 | 总结 + 愿景 |

### 核心场景

1. **捐赠者捐款**
   - 选择项目 → 输入金额 → 钱包确认 → 链上记录

2. **受益人提款**
   - 上传凭证 → AI 自动审核 → 审核上链 → 资金释放

3. **企业批量捐赠**
   - 选择多个项目 → x402 付费 → 批量执行 → 生成报告

---

## 🌐 页面路由

| 路由 | 说明 |
|------|------|
| `/` | 首页（角色选择） |
| `/campaigns` | 项目列表 |
| `/campaigns/[id]` | 项目详情 |
| `/dashboard/donor` | 捐赠者仪表盘 |
| `/dashboard/beneficiary` | 受益人仪表盘 |
| `/dashboard/enterprise` | 企业仪表盘 |
| `/proof/upload` | 凭证上传 |

---

## 🔗 相关链接

- [Monad Testnet Explorer](https://testnet.monadexplorer.com)
- [Monad 官网](https://www.monad.xyz)
- [项目规划文档](./specs/final_version.md)

---

## 👥 团队

SHE³ Team - Monad Hackathon 2026

---

## 📄 License

MIT License

---

<p align="center">
  <strong>透明是慈善最好的监督 💜</strong>
</p>
