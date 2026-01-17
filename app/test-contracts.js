/**
 * GiveFlow 合约测试脚本
 * 使用方法: node test-contracts.js
 *
 * 前置��求:
 * 1. 安装依赖: npm install
 * 2. 设置环境变量: MONAD_PRIVATE_KEY (你的私钥)
 */

const { createPublicClient, createWalletClient, http } = require('viem')
const { privateKeyToAccount } = require('viem/accounts')

// 从 contracts.ts 复制的 ABI
const CampaignRegistryABI = [
  {
    name: 'campaignCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    name: 'getCampaign',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_campaignId', type: 'uint256' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'beneficiary', type: 'address' },
          { name: 'title', type: 'string' },
          { name: 'description', type: 'string' },
          { name: 'category', type: 'string' },
          { name: 'targetAmount', type: 'uint256' },
          { name: 'raisedAmount', type: 'uint256' },
          { name: 'donorsCount', type: 'uint256' },
          { name: 'deadline', type: 'uint256' },
          { name: 'createdAt', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'metadataUri', type: 'string' },
        ],
      },
    ],
  },
  {
    name: 'donate',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: '_campaignId', type: 'uint256' }],
    outputs: [],
  },
]

const BatchDonateABI = [
  {
    name: 'batchDonate',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: '_campaignIds', type: 'uint256[]' },
      { name: '_amounts', type: 'uint256[]' },
    ],
    outputs: [],
  },
  {
    name: 'getDonorHistory',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_donor', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'campaignId', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
        ],
      },
    ],
  },
  {
    name: 'getDonorTotalAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_donor', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
]

// Monad Testnet 配置
const MONAD_TESTNET = {
  id: 10143,
  name: 'Monad Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'MON',
    symbol: 'MON',
  },
  rpcUrls: {
    default: {
      http: ['https://testnet-rpc.monad.xyz'],
    },
  },
  blockExplorers: {
    default: { name: 'Monad Explorer', url: 'https://testnet.monadexplorer.com' },
  },
}

// 合约地址
const CONTRACT_ADDRESSES = {
  campaignRegistry: '0xe50e3B162a3671fc758FcD53766C95582DF63ebF',
  batchDonate: '0xBAB71010e46DDf7B9E183d2C57753842d3cC5118',
}

// 工具函数
const formatEther = (wei) => {
  return (Number(wei) / 1e18).toFixed(4)
}

const log = (message, data = '') => {
  console.log(`\n${message}`)
  if (data) console.log(data)
}

// 创建客户端
const createClients = () => {
  const privateKey = process.env.MONAD_PRIVATE_KEY

  if (!privateKey) {
    console.error('❌ 错误: 请设置环境变量 MONAD_PRIVATE_KEY')
    console.log('\n使用方法:')
    console.log('  export MONAD_PRIVATE_KEY=你的私钥')
    console.log('  node test-contracts.js')
    process.exit(1)
  }

  const account = privateKeyToAccount(privateKey)

  const publicClient = createPublicClient({
    chain: MONAD_TESTNET,
    transport: http(),
  })

  const walletClient = createWalletClient({
    chain: MONAD_TESTNET,
    transport: http(),
    account,
  })

  return { publicClient, walletClient, account }
}

// 测试函数
async function testContracts() {
  log('🚀 开始测试 GiveFlow 合约')
  log('=' .repeat(50))

  const { publicClient, walletClient, account } = createClients()

  log('✅ 已连接到 Monad Testnet')
  log('📍 账户地址:', account.address)

  try {
    // 检查余额
    const balance = await publicClient.getBalance({ address: account.address })
    log('💰 账户余额:', `${formatEther(balance)} MON`)

    if (balance === 0n) {
      log('❌ 错误: 账户余额为 0，请先获取测试币')
      log('\n获取测试币: https://faucet.monad.xyz')
      process.exit(1)
    }

    // ========== 测试 1: 读取项目数量 ==========
    log('\n📊 测试 1: 读取项目数量')
    log('-' .repeat(50))

    const campaignCount = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.campaignRegistry,
      abi: CampaignRegistryABI,
      functionName: 'campaignCount',
    })

    log(`✅ 项目总数: ${campaignCount}`)

    // ========== 测试 2: 读取项目详情 ==========
    log('\n📋 测试 2: 读取项目详情')
    log('-' .repeat(50))

    if (campaignCount > 0) {
      const campaign = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.campaignRegistry,
        abi: CampaignRegistryABI,
        functionName: 'getCampaign',
        args: [1n], // 读取第一个项目
      })

      log('✅ 项目 #1 详情:')
      log(`   ID: ${campaign.id}`)
      log(`   标题: ${campaign.title}`)
      log(`   受益人: ${campaign.beneficiary}`)
      log(`   目标金额: ${formatEther(campaign.targetAmount)} MON`)
      log(`   已筹金额: ${formatEther(campaign.raisedAmount)} MON`)
      log(`   捐赠人数: ${campaign.donorsCount}`)
      log(`   状态: ${campaign.status === 0n ? '活跃' : '已结束'}`)

      // ========== 测试 3: 单次捐赠 ==========
      log('\n💝 测试 3: 单次捐赠测试')
      log('-' .repeat(50))

      const donateAmount = parseEther('0.001')
      log(`📤 向项目 #1 捐赠 ${formatEther(donateAmount)} MON`)

      const { request: donateRequest } = await publicClient.simulateContract({
        address: CONTRACT_ADDRESSES.campaignRegistry,
        abi: CampaignRegistryABI,
        functionName: 'donate',
        args: [1n],
        value: donateAmount,
        account,
      })

      const donateHash = await walletClient.writeContract(donateRequest)
      log(`✅ 交易已提交: ${donateHash}`)
      log('⏳ 等待交易确认...')

      const donateReceipt = await publicClient.waitForTransactionReceipt({
        hash: donateHash,
      })

      log(`✅ 交易已确认! 区块: ${donateReceipt.blockNumber}`)
      log(`📊 Gas 使用: ${donateReceipt.gasUsed}`)

      // 重新读取项目数据，验证捐赠
      const updatedCampaign = await publicClient.readContract({
        address: CONTRACT_ADDRESSES.campaignRegistry,
        abi: CampaignRegistryABI,
        functionName: 'getCampaign',
        args: [1n],
      })

      log(`📈 更新后的已筹金额: ${formatEther(updatedCampaign.raisedAmount)} MON`)
      log(`📈 更新后的捐赠人数: ${updatedCampaign.donorsCount}`)
    }

    // ========== 测试 4: 批量捐赠 ==========
    log('\n💝💝 测试 4: 批量捐赠测试 (Monad 并行执行)')
    log('-' .repeat(50))

    const batchAmount = parseEther('0.001')
    const campaignIds = [1n, 2n]
    const amounts = [batchAmount, batchAmount]
    const totalAmount = batchAmount * 2n

    log(`📤 向 ${campaignIds.length} 个项目各捐赠 ${formatEther(batchAmount)} MON`)
    log(`💰 总计: ${formatEther(totalAmount)} MON`)

    const { request: batchRequest } = await publicClient.simulateContract({
      address: CONTRACT_ADDRESSES.batchDonate,
      abi: BatchDonateABI,
      functionName: 'batchDonate',
      args: [campaignIds, amounts],
      value: totalAmount,
      account,
    })

    const batchHash = await walletClient.writeContract(batchRequest)
    log(`✅ 批量捐赠交易已提交: ${batchHash}`)
    log('⏳ 等待交易确认...')

    const batchReceipt = await publicClient.waitForTransactionReceipt({
      hash: batchHash,
    })

    log(`✅ 批量捐赠交易已确认! 区块: ${batchReceipt.blockNumber}`)
    log(`📊 Gas 使用: ${batchReceipt.gasUsed}`)

    // ========== 测试 5: 查询捐赠历史 ==========
    log('\n📜 测试 5: 查询您的捐赠历史')
    log('-' .repeat(50))

    const donorHistory = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.batchDonate,
      abi: BatchDonateABI,
      functionName: 'getDonorHistory',
      args: [account.address],
    })

    const donorTotal = await publicClient.readContract({
      address: CONTRACT_ADDRESSES.batchDonate,
      abi: BatchDonateABI,
      functionName: 'getDonorTotalAmount',
      args: [account.address],
    })

    log(`✅ 总捐赠次数: ${donorHistory.length}`)
    log(`💰 总捐赠金额: ${formatEther(donorTotal)} MON`)

    if (donorHistory.length > 0) {
      log('\n最近的捐赠记录:')
      donorHistory.slice(0, 5).forEach((donation, index) => {
        log(`   ${index + 1}. 项目 #${donation.campaignId} - ${formatEther(donation.amount)} MON`)
        log(`      时间: ${new Date(Number(donation.timestamp) * 1000).toLocaleString()}`)
      })
    }

    // ========== 总结 ==========
    log('\n🎉 所有测试完成!')
    log('=' .repeat(50))
    log('✅ 合约地址:')
    log(`   CampaignRegistry: ${CONTRACT_ADDRESSES.campaignRegistry}`)
    log(`   BatchDonate: ${CONTRACT_ADDRESSES.batchDonate}`)
    log('\n🔍 在 Monad Explorer 查看交易:')
    log(`   https://testnet.monadexplorer.com/address/${account.address}`)

  } catch (error) {
    log('\n❌ 测试失败:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// 辅助函数
function parseEther(eth) {
  return BigInt(Math.floor(parseFloat(eth) * 1e18))
}

// 运行测试
testContracts()
  .then(() => {
    log('\n✅ 测试脚本执行完毕')
    process.exit(0)
  })
  .catch((error) => {
    log('\n❌ 测试脚本执行失败')
    console.error(error)
    process.exit(1)
  })
