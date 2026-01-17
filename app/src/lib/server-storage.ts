import fs from 'fs'
import path from 'path'
import { Campaign } from './mock-data'

// 数据文件路径
const DATA_DIR = path.join(process.cwd(), 'data')
const CAMPAIGNS_FILE = path.join(DATA_DIR, 'campaigns.json')

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// 从文件读取所有项目
export function readCampaignsFromFile(): Campaign[] {
  try {
    ensureDataDir()

    if (!fs.existsSync(CAMPAIGNS_FILE)) {
      // ���果文件不存在，返回空数组
      return []
    }

    const data = fs.readFileSync(CAMPAIGNS_FILE, 'utf-8')
    const campaigns = JSON.parse(data) as Campaign[]
    return campaigns
  } catch (error) {
    console.error('❌ 读取项目数据失败:', error)
    return []
  }
}

// 将所有项目写入文件
export function writeCampaignsToFile(campaigns: Campaign[]): boolean {
  try {
    ensureDataDir()

    const data = JSON.stringify(campaigns, null, 2)
    fs.writeFileSync(CAMPAIGNS_FILE, data, 'utf-8')

    console.log('✅ 项目数据已保存到文件')
    return true
  } catch (error) {
    console.error('❌ 保存项目数据失败:', error)
    return false
  }
}

// 添加新项目
export function addCampaignToFile(campaign: Campaign): boolean {
  try {
    const campaigns = readCampaignsFromFile()
    campaigns.unshift(campaign)
    return writeCampaignsToFile(campaigns)
  } catch (error) {
    console.error('❌ 添加项目失败:', error)
    return false
  }
}

// 更新项目
export function updateCampaignInFile(id: string, updates: Partial<Campaign>): Campaign | null {
  try {
    const campaigns = readCampaignsFromFile()
    const index = campaigns.findIndex(c => c.id === id)

    if (index !== -1) {
      campaigns[index] = { ...campaigns[index], ...updates }
      writeCampaignsToFile(campaigns)
      return campaigns[index]
    }

    return null
  } catch (error) {
    console.error('❌ 更新项目失败:', error)
    return null
  }
}

// 删除项目
export function deleteCampaignFromFile(id: string): boolean {
  try {
    const campaigns = readCampaignsFromFile()
    const filteredCampaigns = campaigns.filter(c => c.id !== id)

    if (filteredCampaigns.length < campaigns.length) {
      writeCampaignsToFile(filteredCampaigns)
      return true
    }

    return false
  } catch (error) {
    console.error('❌ 删除项目失败:', error)
    return false
  }
}
