// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title CampaignRegistry
 * @dev GiveFlow 公益项目注册合约
 * @notice 管理公益项目的创建、查询和状态更新
 */
contract CampaignRegistry {
    // 项目状态枚举
    enum CampaignStatus {
        Active,      // 进行中
        Completed,   // 已完成
        Cancelled,   // 已取消
        Expired      // 已过期
    }

    // 项目结构
    struct Campaign {
        uint256 id;
        address beneficiary;        // 受益人地址
        string title;               // 项目标题
        string description;         // 项目描述
        string category;            // 项目类别
        uint256 targetAmount;       // 目标金额
        uint256 raisedAmount;       // 已筹金额
        uint256 donorsCount;        // 捐赠者数量
        uint256 deadline;           // 截止时间
        uint256 createdAt;          // 创建时间
        CampaignStatus status;      // 项目状态
        string metadataUri;         // IPFS 元数据地址
    }

    // 状态变量
    uint256 public campaignCount;
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => uint256[]) public beneficiaryCampaigns;
    
    // 已验证的受益人
    mapping(address => bool) public verifiedBeneficiaries;
    
    // 管理员
    address public owner;
    
    // 事件
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed beneficiary,
        string title,
        uint256 targetAmount
    );
    
    event CampaignUpdated(
        uint256 indexed campaignId,
        CampaignStatus status,
        uint256 raisedAmount
    );
    
    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount,
        uint256 timestamp
    );
    
    event BeneficiaryVerified(address indexed beneficiary, bool verified);

    // 修饰符
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyBeneficiary(uint256 _campaignId) {
        require(campaigns[_campaignId].beneficiary == msg.sender, "Only beneficiary");
        _;
    }
    
    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId > 0 && _campaignId <= campaignCount, "Campaign not found");
        _;
    }
    
    modifier campaignActive(uint256 _campaignId) {
        require(campaigns[_campaignId].status == CampaignStatus.Active, "Campaign not active");
        require(block.timestamp < campaigns[_campaignId].deadline, "Campaign expired");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev 创建新的公益项目
     * @param _title 项目标题
     * @param _description 项目描述
     * @param _category 项目类别
     * @param _targetAmount 目标金额 (wei)
     * @param _deadline 截止时间 (timestamp)
     * @param _metadataUri IPFS 元数据地址
     */
    function createCampaign(
        string calldata _title,
        string calldata _description,
        string calldata _category,
        uint256 _targetAmount,
        uint256 _deadline,
        string calldata _metadataUri
    ) external returns (uint256) {
        require(bytes(_title).length > 0, "Title required");
        require(_targetAmount > 0, "Target amount required");
        require(_deadline > block.timestamp, "Invalid deadline");
        
        campaignCount++;
        uint256 newCampaignId = campaignCount;
        
        campaigns[newCampaignId] = Campaign({
            id: newCampaignId,
            beneficiary: msg.sender,
            title: _title,
            description: _description,
            category: _category,
            targetAmount: _targetAmount,
            raisedAmount: 0,
            donorsCount: 0,
            deadline: _deadline,
            createdAt: block.timestamp,
            status: CampaignStatus.Active,
            metadataUri: _metadataUri
        });
        
        beneficiaryCampaigns[msg.sender].push(newCampaignId);
        
        emit CampaignCreated(newCampaignId, msg.sender, _title, _targetAmount);
        
        return newCampaignId;
    }

    /**
     * @dev 向项目捐赠
     * @param _campaignId 项目ID
     */
    function donate(uint256 _campaignId) 
        external 
        payable 
        campaignExists(_campaignId) 
        campaignActive(_campaignId) 
    {
        require(msg.value > 0, "Donation required");
        
        Campaign storage campaign = campaigns[_campaignId];
        campaign.raisedAmount += msg.value;
        campaign.donorsCount++;
        
        // 检查是否达成目标
        if (campaign.raisedAmount >= campaign.targetAmount) {
            campaign.status = CampaignStatus.Completed;
        }
        
        emit DonationReceived(_campaignId, msg.sender, msg.value, block.timestamp);
        emit CampaignUpdated(_campaignId, campaign.status, campaign.raisedAmount);
    }

    /**
     * @dev 获取项目信息
     * @param _campaignId 项目ID
     */
    function getCampaign(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (Campaign memory) 
    {
        return campaigns[_campaignId];
    }

    /**
     * @dev 获取受益人的所有项目
     * @param _beneficiary 受益人地址
     */
    function getBeneficiaryCampaigns(address _beneficiary) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return beneficiaryCampaigns[_beneficiary];
    }

    /**
     * @dev 获取所有活跃项目数量
     */
    function getActiveCampaignsCount() external view returns (uint256) {
        uint256 count = 0;
        for (uint256 i = 1; i <= campaignCount; i++) {
            if (campaigns[i].status == CampaignStatus.Active && 
                block.timestamp < campaigns[i].deadline) {
                count++;
            }
        }
        return count;
    }

    /**
     * @dev 验证受益人
     * @param _beneficiary 受益人地址
     * @param _verified 是否验证
     */
    function verifyBeneficiary(address _beneficiary, bool _verified) 
        external 
        onlyOwner 
    {
        verifiedBeneficiaries[_beneficiary] = _verified;
        emit BeneficiaryVerified(_beneficiary, _verified);
    }

    /**
     * @dev 更新项目状态
     * @param _campaignId 项目ID
     * @param _status 新状态
     */
    function updateCampaignStatus(uint256 _campaignId, CampaignStatus _status)
        external
        campaignExists(_campaignId)
        onlyBeneficiary(_campaignId)
    {
        campaigns[_campaignId].status = _status;
        emit CampaignUpdated(_campaignId, _status, campaigns[_campaignId].raisedAmount);
    }
}
