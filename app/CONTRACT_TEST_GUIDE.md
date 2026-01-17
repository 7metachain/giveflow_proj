# GiveFlow 合约测试指南

本文档介绍如何测试已部署的 GiveFlow 智能合约。

## 📋 已部署的合约

| 合约名称 | 地址 | 功能 |
|---------|------|------|
| **CampaignRegistry** | `0xe50e3B162a3671fc758FcD53766C95582DF63ebF` | 项目注册与捐赠管理 |
| **BatchDonate** | `0xBAB71010e46DDf7B9E183d2C57753842d3cC5118` | 批量捐赠（展示并行执行） |

## 🧪 测试方法

### 方法一：Web 界面测试（推荐）

#### 1. 启动本地开发服务器

```bash
cd app
npm run dev
```

#### 2. 访问测试页面

在浏览器中打开：
```
http://localhost:3000/test-contracts
```

#### 3. 测试功能

页面包含以下测试功能：

**1️⃣ 钱包连接**
- 点击"连接钱包"按钮
- 选择 MetaMask 或其他钱包
- 确保切换到 Monad Testnet (Chain ID: 10143)

**2️⃣ 读取项目数量**
- 点击"刷新数据"按钮
- 查看链上项目总数

**3️⃣ 查看项目详情**
- 输入项目 ID（例如：1）
- 点击"查询项目"
- 查看项目的详细信息（标题、目标、已筹金额等）

**4️⃣ 单次捐赠测试**
- 输入捐赠金额（例如：0.001 MON）
- 点击"捐赠"按钮
- 在钱包中确认交易
- 等待交易确认（约 15 秒）

**5️⃣ 批量捐赠测试 ⭐**
- 点击"批量捐赠"按钮
- 同时向多个项目捐赠
- 体验 Monad 并行执行优势

**6️⃣ 查看捐赠统计**
- 查看你的总捐赠金额
- 查看捐赠历史记录

**7️⃣ 操作日志**
- 实时查看所有操作的日志
- 包括成功和错误信息

---

### 方法二：命令行测试

#### 1. 准备私钥

```bash
# 设置环境变量（Linux/Mac）
export MONAD_PRIVATE_KEY=你的私钥

# Windows CMD
set MONAD_PRIVATE_KEY=你的私钥

# Windows PowerShell
$env:MONAD_PRIVATE_KEY="你的私钥"
```

⚠️ **安全提示**: 仅在测试网使用此方法，切勿在主网暴露私钥

#### 2. 运行测试脚本

```bash
cd app
node test-contracts.js
```

#### 3. 测试内容

脚本会自动执行以下测试：

1. ✅ 读取项目数量
2. ✅ 读取项目详情
3. ✅ 单次捐赠（0.001 MON）
4. ✅ 批量捐赠（向 2 个项目各捐赠 0.001 MON）
5. ✅ 查询捐赠历史
6. ✅ 显示总捐赠金额

---

### 方法三：使用 Monad Explorer

#### 1. 访问 Explorer

打开浏览器访问：
```
https://testnet.monadexplorer.com
```

#### 2. 查看合约

输入合约地址搜索：
- CampaignRegistry: `0xe50e3B162a3671fc758FcD53766C95582DF63ebF`
- BatchDonate: `0xBAB71010e46DDf7B9E183d2C57753842d3cC5118`

#### 3. 查看功能

- 📊 查看合约交易历史
- 📝 读取合约状态
- 💼 查看合约代码
- 📈 查看事件日志

---

## 🔧 测试前准备

### 1. 添加 Monad Testnet 到钱包

**Network Details:**
- **Network Name**: Monad Testnet
- **RPC URL**: `https://testnet-rpc.monad.xyz`
- **Chain ID**: `10143`
- **Currency Symbol**: `MON`
- **Block Explorer**: `https://testnet.monadexplorer.com`

**MetaMask 添加方法:**
1. 打开 MetaMask
2. 点击网络下拉菜单
3. 点击"添加网络" / "Add Network"
4. 选择"手动添加网络" / "Add a network manually"
5. 填入上述信息
6. 点击"保存"

### 2. 获取测试币

访问 Monad 测试网水龙头：
```
https://faucet.monad.xyz
```

或使用其他水龙头：
- [Monad Faucet](https://faucet.monad.xyz)
- [Paradigm Faucet](https://faucet.paradigm.xyz/)

---

## 📊 预期测试结果

### 成功的测试应该看到：

✅ **读取数据**
- 项目数量 > 0
- 能看到项目详情

✅ **单次捐赠**
- 交易成功
- Gas 费用 < 0.01 MON
- 项目筹款增加

✅ **批量捐赠**
- 一次交易完成多笔捐赠
- Gas 费用 < 0.02 MON
- 所有项目筹款都增加

✅ **查询历史**
- 能看到自己的捐赠记录
- 总金额正确

---

## 🐛 常见问题

### Q1: 交易失败 "insufficient funds"

**解决方法**:
- 检查钱包余额
- 去水龙头获取测试币

### Q2: 交易失败 "execution reverted"

**解决方法**:
- 检查项目 ID 是否存在
- 确认项目状态是否活跃
- 查看具体错误信息

### Q3: 无法连接钱包

**解决方法**:
- 确保安装了钱包插件（MetaMask 等）
- 刷新页面
- 检查钱包是否已解锁

### Q4: 交易一直 pending

**解决方法**:
- 等待更长时间（Monad 确认约 15 秒）
- 检查 RPC 连接
- 在 Explorer 查看交易状态

### Q5: Gas 费用显示很高

**解决方法**:
- 确保在 Monad Testnet（不是主网）
- 检查网络配置
- Monad Gas 应该 < 0.01 MON

---

## 📈 性能对比

### Monad vs 其他链

| 操作 | Ethereum | Polygon | Monad Testnet |
|------|----------|---------|---------------|
| 单次捐赠 Gas | ~$5-20 | ~$0.05 | **~$0.003** |
| 批量捐赠 (5个项目) | ~$25-100 | ~$0.25 | **~$0.015** |
| 确认时间 | ~15-60秒 | ~5-10秒 | **~15秒** |

---

## 🔗 有用的链接

- **Monad Testnet RPC**: https://testnet-rpc.monad.xyz
- **Monad Explorer**: https://testnet.monadexplorer.com
- **Monad Faucet**: https://faucet.monad.xyz
- **Monad Docs**: https://docs.monad.xyz

---

## 💡 下一步

测试通过后，你可以：

1. ✅ 创建自己的募捐项目
2. ✅ 尝试不同金额的捐赠
3. ✅ 测试批量捐赠的并行优势
4. ✅ 查看资金流向的可视化
5. ✅ 集成 AI 功能（项目推荐、资金解释）

---

## 📞 需要帮助？

如果遇到问题：
1. 检查控制台错误日志
2. 在 Explorer 查看交易详情
3. 确认网络配置正确
4. 查看合约地址是否正确

祝测试顺利！🎉
