import { Campaign } from './mock-data'

// 简单的内存存储（用于演示，生产环境应该使用数据库）
class CampaignStorage {
  private campaigns: Campaign[] = []
  private initialized = false

  // 初始化时从mock数据加载
  initialize(mockData: Campaign[]) {
    if (!this.initialized) {
      // 尝试从localStorage加载
      const stored = localStorage.getItem('giveflow_campaigns')
      if (stored) {
        try {
          this.campaigns = JSON.parse(stored)
        } catch (e) {
          console.error('Failed to parse stored campaigns:', e)
          this.campaigns = [...mockData]
        }
      } else {
        this.campaigns = [...mockData]
      }
      this.initialized = true
    }
  }

  // 获取所有项目
  getAll(): Campaign[] {
    if (!this.initialized) {
      console.warn('Storage not initialized')
      return []
    }
    return this.campaigns
  }

  // 根据ID获取项目
  getById(id: string): Campaign | undefined {
    return this.campaigns.find(c => c.id === id)
  }

  // 创建新项目
  create(campaign: Campaign): Campaign {
    this.campaigns.unshift(campaign)
    this.save()
    return campaign
  }

  // 更新项目
  update(id: string, updates: Partial<Campaign>): Campaign | undefined {
    const index = this.campaigns.findIndex(c => c.id === id)
    if (index !== -1) {
      this.campaigns[index] = { ...this.campaigns[index], ...updates }
      this.save()
      return this.campaigns[index]
    }
    return undefined
  }

  // 删除项目
  delete(id: string): boolean {
    const index = this.campaigns.findIndex(c => c.id === id)
    if (index !== -1) {
      this.campaigns.splice(index, 1)
      this.save()
      return true
    }
    return false
  }

  // 保存到localStorage
  private save() {
    try {
      localStorage.setItem('giveflow_campaigns', JSON.stringify(this.campaigns))
    } catch (e) {
      console.error('Failed to save campaigns:', e)
    }
  }

  // 清空所有数据
  clear() {
    this.campaigns = []
    localStorage.removeItem('giveflow_campaigns')
    this.save()
  }
}

// 导出单例实例
export const campaignStorage = new CampaignStorage()
