# GiveFlow 项目规划文档

> 综合 V1 方案与 V2 迭代，形成完整的框架构想、开发模块与 Demo 流程

---

## 一、项目概述

### 1.1 一句话 Pitch

**GiveFlow** 是一个基于 Monad 的可验证慈善资金网络，依靠链上"可证性 + 自动释放 + 并行微捐"让资金透明到每一笔、捐赠精细到每一分钱、并用 AI 解释每一次资金流转。

### 1.2 核心价值主张

| 价值点 | 说明 |
|--------|------|
| **零抽成直达** | 平台不收取任何中间费用，捐款 100% 直接到达受益人 |
| **可验证透明** | 捐赠-里程碑-提款三段链上记录，形成可验证资金轨迹 |
| **小额高频捐赠** | Monad 低 Gas 让 $0.01 起捐成为可能 |
| **AI 意图驱动** | 自然语言完成捐赠、追踪、解释资金去向 |
| **双视角透明** | 捐赠者追踪资金去向 + 受益人凭证审核提款 |
| **AI 凭证审核** | 受益人提款需上传凭证，AI 自动识别鉴定后释放资金 |

### 1.3 双视角设计（核心创新）

GiveFlow 为捐赠者和受益人/发起人提供完全不同但互相验证的视角：

```
┌─────────────────────────────────────────────────────────────────┐
│                      捐赠者视角 (Donor View)                     │
├─────────────────────────────────────────────────────────────────┤
│  "我的钱去哪了？"                                                │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ 我的捐赠 │ → │ 项目资金池│ → │ 里程碑释放│ → │ 使用凭证 │  │
│  │  $10     │    │  $1,000  │    │  阶段1   │    │ 医疗收据 │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                  │
│  ✓ 实时追踪每一笔捐赠的流向                                      │
│  ✓ 查看资金被用于什么用途（凭证可见）                            │
│  ✓ AI 解释资金去向："您的 $10 已用于购买 XX 药品"                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   受益人/发起人视角 (Beneficiary View)           │
├─────────────────────────────────────────────────────────────────┤
│  "如何提取资金？"                                                │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ 筹款进度 │ → │ 上传凭证 │ → │ AI 审核  │ → │ 资金释放 │  │
│  │  80%     │    │ 发票/收据│    │ 自动鉴定 │    │ 到账通知 │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│                                                                  │
│  ✓ 查看项目筹款进度与捐赠明细                                    │
│  ✓ 上传支出凭证申请提款                                          │
│  ✓ AI 自动识别凭证真实性 → 通过后链上释放资金                    │
└─────────────────────────────────────────────────────────────────┘
```

**AI 凭证审核流程**：
1. 受益人上传凭证（发票、收据、医疗单据等）
2. AI 视觉模型识别凭证内容（金额、日期、用途）
3. AI 判断凭证与里程碑用途是否匹配
4. 审核通过 → 生成审核报告哈希上链 → 触发资金释放
5. 审核不通过 → 返回原因，要求补充材料

### 1.4 为什么必须上链（链上必要性）

- **信任最小化**：捐款、释放、提款不可篡改，避免平台黑箱
- **资金安全**：里程碑未达成时无法提现（合约约束）
- **凭证不可伪造**：AI 审核报告哈希上链，凭证与审核结果永久可查
- **全球协作**：跨境捐赠无需信任中介，链上结算即时可查
- **公开审计**：任何人可验证资金去向，形成"公共账本的社会信用"

### 1.5 Monad 特性映射

| Monad 特性 | 功能映射 | Demo 展示 |
|------------|----------|-----------|
| **并行执行** | batchDonate 批量微捐 | 一次操作向 5 个项目捐 5 笔 $0.5 |
| **低 Gas** | 微订阅 + 高频小额捐 | 每周 $1 自动捐赠，Gas 成本可忽略 |
| **高吞吐 & 低延迟** | 实时资金流可视化 | 页面实时刷新"第 X 笔捐款" |

---

## 二、系统架构

### 2.1 架构总览

```
┌─────────────────────────────────────────────────────────────┐
│                         用户层                              │
│     捐赠者 / 项目发起人 / 受益人                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        前端层                               │
│   Next.js 15 + shadcn/ui + TailwindCSS + Wallet Connect    │
│                                                             │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│   │ Landing  │ │ AI Chat  │ │ Projects │ │ Dashboard│      │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        API 层                               │
│   /api/chat  /api/campaigns  /api/donate  /api/track       │
│                                                             │
│   ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│   │   AI 层    │ │  Web3 层   │ │  数据层     │          │
│   │ Vercel AI  │ │ wagmi/viem │ │  Supabase   │          │
│   │ OpenAI SDK │ │            │ │             │          │
│   └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Monad 区块链                            │
│                                                             │
│   ┌────────────────┐  ┌────────────────┐                   │
│   │CampaignRegistry│  │ MilestoneVault │                   │
│   │ 项目注册与管理  │  │ 里程碑与释放   │                   │
│   └────────────────┘  └────────────────┘                   │
│                                                             │
│   ┌────────────────┐  ┌────────────────┐                   │
│   │  BatchDonate   │  │RecurringDonate │                   │
│   │  批量捐赠入口   │  │  定期捐赠      │                   │
│   └────────────────┘  └────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 技术栈选型

| 层级 | 技术选型 | 说明 |
|------|----------|------|
| **前端** | Next.js 15 + App Router | SSR + 现代 React |
| **UI** | shadcn/ui + TailwindCSS | 美观且可定制 |
| **钱包** | wagmi v2 + viem | 类型安全的 Web3 交互 |
| **AI** | Vercel AI SDK + OpenAI | 流式对话 + Function Calling |
| **数据库** | Supabase (PostgreSQL) | 项目元数据、证明文件 |
| **合约** | Solidity + Foundry | 部署到 Monad Testnet |
| **可视化** | Recharts / D3.js | 资金流图表 |

---

## 三、智能合约设计

### 3.1 合约结构（MVP）

#### CampaignRegistry.sol
```solidity
// 项目注册与基本信息管理
struct Campaign {
    uint256 id;
    address beneficiary;      // 受益地址
    string title;
    string description;
    uint256 targetAmount;     // 目标金额
    uint256 raisedAmount;     // 已筹金额
    uint256 deadline;
    bool active;
}

// 核心函数
function createCampaign(...) external returns (uint256 campaignId);
function getCampaign(uint256 id) external view returns (Campaign);
function listActiveCampaigns() external view returns (Campaign[]);
```

#### MilestoneVault.sol
```solidity
// 里程碑管理与资金分阶段释放
struct Milestone {
    uint256 id;
    uint256 campaignId;
    uint256 targetAmount;     // 该阶段目标
    bytes32 proofHash;        // 证明材料哈希
    bool released;
}

// 核心函数
function setMilestone(uint256 campaignId, uint256 target, bytes32 hash) external;
function releaseMilestone(uint256 campaignId, uint256 milestoneId) external;
function getMilestones(uint256 campaignId) external view returns (Milestone[]);
```

#### BatchDonate.sol
```solidity
// 批量捐赠入口（展示 Monad 并行执行）
struct DonationItem {
    uint256 campaignId;
    uint256 amount;
}

// 核心函数：一次交易捐赠多个项目
function batchDonate(DonationItem[] calldata items) external payable;
function donate(uint256 campaignId) external payable;
```

#### RecurringDonation.sol
```solidity
// 定期捐赠订阅（低成本持续交互）
struct Subscription {
    address donor;
    uint256 campaignId;
    uint256 amount;
    uint256 interval;         // 间隔秒数
    uint256 lastExecuted;
    bool active;
}

// 核心函数
function subscribe(uint256 campaignId, uint256 amount, uint256 interval) external;
function executeSubscription(uint256 subscriptionId) external;
function cancelSubscription(uint256 subscriptionId) external;
```

### 3.2 关键事件（前端追踪用）

```solidity
// 捐赠事件
event DonationMade(
    uint256 indexed campaignId,
    address indexed donor,
    uint256 amount,
    uint256 timestamp
);

// 里程碑设置
event MilestoneSet(
    uint256 indexed campaignId,
    uint256 indexed milestoneId,
    uint256 targetAmount,
    bytes32 proofHash
);

// 里程碑释放
event MilestoneReleased(
    uint256 indexed campaignId,
    uint256 indexed milestoneId,
    uint256 amount,
    address beneficiary
);

// 订阅创建
event SubscriptionCreated(
    uint256 indexed subscriptionId,
    address indexed donor,
    uint256 campaignId,
    uint256 amount,
    uint256 interval
);
```

---

## 四、开发模块划分

### 4.1 前端组（UI + 体验）

**目标**：打造清晰可演示的捐赠路径与透明追踪界面

| 模块 | 功能 | 优先级 |
|------|------|--------|
| **Landing Page** | 品牌展示、价值主张、快速入口 | P0 |
| **项目列表页** | 浏览所有募捐项目、筛选排序 | P0 |
| **项目详情页** | 项目信息、里程碑进度、捐赠入口 | P0 |
| **捐赠流程** | 单捐/批量捐/订阅捐 + 钱包交互 | P0 |
| **AI Chat 界面** | 自然语言交互入口 | P1 |
| **资金流可视化** | Donation → Milestone → Release 流程图 | P0 |
| **个人 Dashboard** | 捐赠历史、影响力报告 | P1 |

**页面路由规划**：
```
/                     → Landing Page
/campaigns            → 项目列表
/campaigns/[id]       → 项目详情
/donate               → 捐赠页面（支持批量）
/chat                 → AI 对话界面
/dashboard            → 个人仪表盘
/track/[txHash]       → 资金追踪页
```

### 4.2 AI 组（意图解析 + 推荐）

**目标**：AI 可帮助用户发现项目 + 执行捐赠 + 解释资金流向

| 模块 | 功能 | 优先级 |
|------|------|--------|
| **意图解析** | 自然语言 → 结构化操作 | P0 |
| **项目推荐** | 根据用户偏好推荐项目 | P1 |
| **资金解释** | 解读链上事件为自然语言 | P0 |
| **影响力报告** | 自动生成可分享的报告 | P1 |

**AI Tools 设计（Function Calling）**：
```typescript
// 搜索项目
find_campaigns: {
  category?: string;      // 类别：医疗、教育、灾害等
  urgency?: 'high' | 'medium' | 'low';
  minGoal?: number;
  maxGoal?: number;
}

// 执行捐赠
donate: {
  campaignId: number;
  amount: number;
  token?: string;
}

// 批量捐赠
batch_donate: {
  items: { campaignId: number; amount: number }[];
}

// 设置订阅
subscribe: {
  campaignId: number;
  amount: number;
  interval: 'daily' | 'weekly' | 'monthly';
}

// 追踪资金
track_donation: {
  txHash?: string;
  campaignId?: number;
  donor?: string;
}

// 解释资金去向
explain_fund_flow: {
  campaignId: number;
}
```

**系统提示词核心**：
```
你是 GiveFlow 的慈善助手，帮助用户：
1. 发现适合的慈善项目
2. 完成捐赠（支持批量、订阅）
3. 追踪资金去向并用通俗语言解释
4. 生成个人影响力报告

始终强调资金的透明性和链上可验证性。
```

### 4.3 合约组（资金安全 + 透明机制）

**目标**：确保资金安全、透明、可追踪

| 模块 | 功能 | 优先级 |
|------|------|--------|
| **CampaignRegistry** | 项目注册、查询 | P0 |
| **BatchDonate** | 批量捐赠（展示 Monad 并行） | P0 |
| **MilestoneVault** | 里程碑设置与释放 | P0 |
| **RecurringDonation** | 定期捐赠订阅 | P1 |
| **事件日志** | 完整事件用于前端追踪 | P0 |

**部署计划**：
1. 本地 Foundry 测试
2. 部署到 Monad Testnet
3. 验证合约代码

### 4.4 后端组（API + 数据层）

**目标**：连接 AI、前端、链上与数据存储

| API 路由 | 功能 | 优先级 |
|----------|------|--------|
| `POST /api/chat` | AI 意图解析 + 流式响应 | P0 |
| `GET /api/campaigns` | 项目列表查询 | P0 |
| `GET /api/campaigns/[id]` | 项目详情 | P0 |
| `POST /api/donate/prepare` | 构建捐赠交易 | P0 |
| `GET /api/track/[txHash]` | 资金流查询 | P0 |
| `GET /api/user/[address]/history` | 用户捐赠历史 | P1 |
| `GET /api/user/[address]/impact` | 影响力报告数据 | P1 |

**数据库表设计（Supabase）**：
```sql
-- 项目元数据（链下扩展信息）
campaigns_metadata (
  id,
  chain_id,           -- 链上 ID
  images[],           -- 图片 URLs
  documents[],        -- 证明文件
  created_at
)

-- 里程碑证明
milestone_proofs (
  id,
  campaign_id,
  milestone_id,
  proof_hash,
  proof_url,          -- IPFS/云存储链接
  description,
  created_at
)

-- 用户偏好（可选）
user_preferences (
  address,
  preferred_categories[],
  notification_settings
)
```

---

## 五、MVP 范围（Hackathon 优先级）

### 5.1 必做（P0）- Demo 核心闭环

1. **项目浏览与详情**
   - 项目列表展示
   - 项目详情页（进度、里程碑）

2. **一键捐赠**
   - 连接钱包
   - 单项目捐赠
   - 交易确认与反馈

3. **批量微捐**
   - 一次交易向多个项目捐赠
   - 展示 Monad 并行执行优势

4. **资金流可视化**
   - Donation → Campaign → Milestone → Release
   - 链上交易可查链接

5. **AI 基础交互**
   - "帮我找医疗救助项目"
   - "我想捐 $1 给这个项目"

### 5.2 可选加分（P1）

1. **定期捐赠订阅**
   - 设置每周/每月自动捐
   - 展示低 Gas 优势

2. **影响力报告**
   - 自动生成捐赠汇总
   - 可分享的报告页面

3. **AI 高级功能**
   - 个性化推荐
   - 资金去向深度解释

---

## 六、Hackathon Demo 流程（2-3 分钟）

### 6.1 Demo 脚本

```
┌─────────────────────────────────────────────────────────────┐
│  开场（15秒）                                               │
│  "GiveFlow 是一个基于 Monad 的零抽成、全透明慈善平台，      │
│   让每一分钱都可追踪、可验证。"                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  场景1：AI 找项目（30秒）                                   │
│  用户输入："帮我找一个紧急医疗救助项目"                     │
│  AI 返回推荐项目列表 + 展示进度/紧急度                      │
│  强调：自然语言即可完成复杂查询                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  场景2：一键微捐（30秒）                                    │
│  选择项目 → 捐 $1 → 钱包确认                                │
│  展示：链上交易成功 + Gas 费用（< $0.01）                   │
│  强调：Monad 低 Gas 让微捐成为可能                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  场景3：批量微捐（30秒）★ Monad 特性展示                    │
│  AI 输入："同时捐 3 个项目各 $0.5"                          │
│  一次交易完成 3 笔捐赠（并行执行）                          │
│  强调：传统链需要 3 次交易，Monad 并行一次搞定              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  场景4：资金流追踪（30秒）                                   │
│  点击"查看资金去向"                                         │
│  展示可视化流程图：Donation → Campaign → Milestone → Release│
│  AI 解释："您的 $1 已进入项目资金池，将在第一阶段           │
│           目标达成后释放给受益人"                           │
│  强调：每一笔资金链上可查、AI 可解释                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  场景5：定期捐赠（20秒，可选加分）                          │
│  用户："我想每周自动捐 $1"                                  │
│  展示订阅合约设置成功                                       │
│  强调：低 Gas 让"微订阅"成为可能                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  场景6：影响力报告（15秒，可选加分）                        │
│  展示自动生成的报告：                                       │
│  "您已帮助 12 位患者，累计捐赠 $18，资金 100% 到达受益人"  │
│  包含链上证明链接，可分享                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  结尾（15秒）                                                │
│  "Monad 的低费用 + 高性能让微捐成为现实。                   │
│   GiveFlow 让公益变成每个人随手可做的事，                   │
│   每一分钱都透明可查。"                                     │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 Demo 核心叙事（评委视角）

| 叙事点 | 展示内容 | 回答的问题 |
|--------|----------|------------|
| **为什么必须上链** | 资金流可视化 + 里程碑记录 | 解决传统慈善的信任黑箱 |
| **Monad 为什么关键** | 批量微捐 + 低 Gas 展示 | 为什么选 Monad 而非其他链 |
| **AI 的价值** | 意图解析 + 资金解释 | AI 如何降低 Web3 门槛 |

### 6.3 Demo 注意事项

1. **提前准备**
   - 测试网有足够测试币
   - 预先创建 3-5 个示例项目
   - 钱包已连接、已授权

2. **备用方案**
   - 录制备用视频以防网络问题
   - 准备截图展示关键界面

3. **时间控制**
   - 总时长控制在 2-3 分钟
   - 核心场景（批量微捐 + 资金追踪）至少 1 分钟

---

## 七、风险与规避

| 风险 | 影响 | 规避方案 |
|------|------|----------|
| **项目真实性** | 虚假项目骗捐 | 里程碑证明哈希上链 + 多签审核 |
| **用户门槛** | Web3 操作复杂 | AI 意图驱动 + 简化签名步骤 |
| **数据复杂** | 链上数据难理解 | 统一事件日志 + 可视化模板 |
| **合约风险** | 资金安全问题 | 充分测试 + 简化合约逻辑 |
| **演示失败** | 网络/钱包问题 | 备用录屏 + 本地演示环境 |

---

## 八、开发时间线（Hackathon 建议）

```
Day 1 上午：
├── 合约组：完成 CampaignRegistry + BatchDonate 基础版
├── 前端组：搭建 Next.js 项目 + 基础路由
└── 后端组：配置 Supabase + 基础 API

Day 1 下午：
├── 合约组：完成 MilestoneVault + 部署测试网
├── 前端组：项目列表页 + 详情页
└── AI 组：基础意图解析 + find_campaigns

Day 2 上午：
├── 合约组：事件日志完善 + 合约验证
├── 前端组：捐赠流程 + 钱包集成
└── AI 组：donate + track 功能

Day 2 下午：
├── 全组：资金流可视化页面
├── 全组：联调测试
└── 全组：Demo 准备 + 录制备用视频

Day 3（如有）：
├── 优化 UI 细节
├── 添加 P1 功能（订阅、报告）
└── 最终 Demo 彩排
```

---

## 九、团队分工建议

| 角色 | 职责 | 关键产出 |
|------|------|----------|
| **前端 Lead** | UI 开发、钱包集成 | 完整可演示界面 |
| **合约 Lead** | 智能合约开发部署 | 已验证的测试网合约 |
| **AI Lead** | AI 意图解析、推荐 | 可用的 AI Chat 功能 |
| **后端/整合** | API、数据库、联调 | 稳定的后端服务 |
| **Demo Lead** | 演示脚本、录制 | 流畅的 Demo 展示 |

---

## 十、成功标准

### Hackathon 评判维度自检

| 维度 | GiveFlow 对应 | 得分潜力 |
|------|---------------|----------|
| **创新性** | 可验证资金流 + 并行微捐 + AI 解释 | ⭐⭐⭐⭐⭐ |
| **技术实现** | 合约 + 前端 + AI 完整闭环 | ⭐⭐⭐⭐ |
| **Monad 特性利用** | 批量微捐、低 Gas 订阅、实时更新 | ⭐⭐⭐⭐⭐ |
| **社会影响力** | 解决真实慈善透明问题 | ⭐⭐⭐⭐⭐ |
| **可演示性** | 2 分钟完整闭环 Demo | ⭐⭐⭐⭐ |

### 核心交付物

- [ ] 可运行的前端应用（Vercel 部署）
- [ ] 已部署的智能合约（Monad Testnet）
- [ ] 可用的 AI Chat 功能
- [ ] 资金流可视化页面
- [ ] 2 分钟 Demo 视频/演示

---

## 附录：快速启动命令

```bash
# 前端
npx create-next-app@latest giveflow-app --typescript --tailwind --app
cd giveflow-app
npx shadcn@latest init
npm install wagmi viem @tanstack/react-query

# 合约
cd contracts
forge init
forge install OpenZeppelin/openzeppelin-contracts

# 部署到 Monad Testnet
forge script script/Deploy.s.sol --rpc-url $MONAD_RPC --broadcast
```