// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./ProofRegistry.sol";

/**
 * @title MilestoneVault
 * @dev GiveFlow 里程碑资金管理合约
 * @notice 管理项目资金的分阶段释放，需凭证审核通过后才能提款
 */
contract MilestoneVault {
    // 里程碑状态
    enum MilestoneStatus {
        Pending,     // 待开始
        InProgress,  // 进行中
        Completed,   // 已完成
        Cancelled    // 已取消
    }

    // 里程碑结构
    struct Milestone {
        uint256 id;
        uint256 campaignId;
        string title;
        uint256 targetAmount;     // 目标金额
        uint256 releasedAmount;   // 已释放金额
        MilestoneStatus status;
        bool proofRequired;       // 是否需要凭证
        uint256 createdAt;
    }

    // 提款记录
    struct Withdrawal {
        uint256 id;
        uint256 campaignId;
        uint256 milestoneId;
        uint256 proofId;          // 关联凭证ID
        address recipient;
        uint256 amount;
        bytes32 txHash;
        uint256 timestamp;
    }

    // 状态变量
    uint256 public milestoneCount;
    uint256 public withdrawalCount;
    
    mapping(uint256 => Milestone) public milestones;
    mapping(uint256 => Withdrawal) public withdrawals;
    mapping(uint256 => uint256[]) public campaignMilestones;  // campaignId => milestoneIds
    mapping(uint256 => uint256) public campaignBalance;       // campaignId => balance
    mapping(uint256 => uint256[]) public milestoneWithdrawals; // milestoneId => withdrawalIds
    
    // ProofRegistry 合约引用
    ProofRegistry public proofRegistry;
    
    // 管理员
    address public owner;

    // 事件
    event MilestoneCreated(
        uint256 indexed milestoneId,
        uint256 indexed campaignId,
        string title,
        uint256 targetAmount
    );
    
    event MilestoneUpdated(
        uint256 indexed milestoneId,
        MilestoneStatus status,
        uint256 releasedAmount
    );
    
    event FundsDeposited(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount
    );
    
    event WithdrawalExecuted(
        uint256 indexed withdrawalId,
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        uint256 proofId,
        address recipient,
        uint256 amount
    );

    // 修饰符
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier milestoneExists(uint256 _milestoneId) {
        require(_milestoneId > 0 && _milestoneId <= milestoneCount, "Milestone not found");
        _;
    }

    constructor(address _proofRegistry) {
        owner = msg.sender;
        proofRegistry = ProofRegistry(_proofRegistry);
    }

    /**
     * @dev 创建里程碑
     * @param _campaignId 项目ID
     * @param _title 里程碑标题
     * @param _targetAmount 目标金额
     * @param _proofRequired 是否需要凭证
     */
    function createMilestone(
        uint256 _campaignId,
        string calldata _title,
        uint256 _targetAmount,
        bool _proofRequired
    ) external returns (uint256) {
        require(_campaignId > 0, "Invalid campaign");
        require(bytes(_title).length > 0, "Title required");
        require(_targetAmount > 0, "Target amount required");
        
        milestoneCount++;
        uint256 newMilestoneId = milestoneCount;
        
        milestones[newMilestoneId] = Milestone({
            id: newMilestoneId,
            campaignId: _campaignId,
            title: _title,
            targetAmount: _targetAmount,
            releasedAmount: 0,
            status: MilestoneStatus.Pending,
            proofRequired: _proofRequired,
            createdAt: block.timestamp
        });
        
        campaignMilestones[_campaignId].push(newMilestoneId);
        
        emit MilestoneCreated(newMilestoneId, _campaignId, _title, _targetAmount);
        
        return newMilestoneId;
    }

    /**
     * @dev 向项目存入资金
     * @param _campaignId 项目ID
     */
    function deposit(uint256 _campaignId) external payable {
        require(_campaignId > 0, "Invalid campaign");
        require(msg.value > 0, "Amount required");
        
        campaignBalance[_campaignId] += msg.value;
        
        emit FundsDeposited(_campaignId, msg.sender, msg.value);
    }

    /**
     * @dev 凭证验证后提款
     * @param _campaignId 项目ID
     * @param _milestoneId 里程碑ID
     * @param _proofId 凭证ID
     */
    function withdrawWithProof(
        uint256 _campaignId,
        uint256 _milestoneId,
        uint256 _proofId
    ) external milestoneExists(_milestoneId) {
        Milestone storage milestone = milestones[_milestoneId];
        require(milestone.campaignId == _campaignId, "Milestone not in campaign");
        require(milestone.status != MilestoneStatus.Completed, "Milestone already completed");
        require(milestone.status != MilestoneStatus.Cancelled, "Milestone cancelled");
        
        // 验证凭证
        if (milestone.proofRequired) {
            require(proofRegistry.isProofApproved(_proofId), "Proof not approved");
            
            // 获取凭证信息验证金额
            ProofRegistry.Proof memory proof = proofRegistry.getProof(_proofId);
            require(proof.campaignId == _campaignId, "Proof not for this campaign");
            require(proof.milestoneId == _milestoneId, "Proof not for this milestone");
            require(proof.submitter == msg.sender, "Not proof submitter");
            
            // 验证项目余额
            uint256 withdrawAmount = proof.amount;
            require(campaignBalance[_campaignId] >= withdrawAmount, "Insufficient balance");
            require(
                milestone.releasedAmount + withdrawAmount <= milestone.targetAmount,
                "Exceeds milestone target"
            );
            
            // 执行提款
            campaignBalance[_campaignId] -= withdrawAmount;
            milestone.releasedAmount += withdrawAmount;
            
            // 检查里程碑是否完成
            if (milestone.releasedAmount >= milestone.targetAmount) {
                milestone.status = MilestoneStatus.Completed;
            } else if (milestone.status == MilestoneStatus.Pending) {
                milestone.status = MilestoneStatus.InProgress;
            }
            
            // 记录提款
            withdrawalCount++;
            withdrawals[withdrawalCount] = Withdrawal({
                id: withdrawalCount,
                campaignId: _campaignId,
                milestoneId: _milestoneId,
                proofId: _proofId,
                recipient: msg.sender,
                amount: withdrawAmount,
                txHash: blockhash(block.number - 1),
                timestamp: block.timestamp
            });
            
            milestoneWithdrawals[_milestoneId].push(withdrawalCount);
            
            // 转账
            (bool success, ) = payable(msg.sender).call{value: withdrawAmount}("");
            require(success, "Transfer failed");
            
            emit WithdrawalExecuted(
                withdrawalCount,
                _campaignId,
                _milestoneId,
                _proofId,
                msg.sender,
                withdrawAmount
            );
            
            emit MilestoneUpdated(_milestoneId, milestone.status, milestone.releasedAmount);
        }
    }

    /**
     * @dev 获取里程碑信息
     * @param _milestoneId 里程碑ID
     */
    function getMilestone(uint256 _milestoneId) 
        external 
        view 
        milestoneExists(_milestoneId) 
        returns (Milestone memory) 
    {
        return milestones[_milestoneId];
    }

    /**
     * @dev 获取项目的所有里程碑
     * @param _campaignId 项目ID
     */
    function getCampaignMilestones(uint256 _campaignId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return campaignMilestones[_campaignId];
    }

    /**
     * @dev 获取项目余额
     * @param _campaignId 项目ID
     */
    function getCampaignBalance(uint256 _campaignId) 
        external 
        view 
        returns (uint256) 
    {
        return campaignBalance[_campaignId];
    }

    /**
     * @dev 获取提款记录
     * @param _withdrawalId 提款ID
     */
    function getWithdrawal(uint256 _withdrawalId) 
        external 
        view 
        returns (Withdrawal memory) 
    {
        require(_withdrawalId > 0 && _withdrawalId <= withdrawalCount, "Withdrawal not found");
        return withdrawals[_withdrawalId];
    }

    /**
     * @dev 获取里程碑的所有提款记录
     * @param _milestoneId 里程碑ID
     */
    function getMilestoneWithdrawals(uint256 _milestoneId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return milestoneWithdrawals[_milestoneId];
    }

    /**
     * @dev 更新里程碑状态
     * @param _milestoneId 里程碑ID
     * @param _status 新状态
     */
    function updateMilestoneStatus(uint256 _milestoneId, MilestoneStatus _status)
        external
        onlyOwner
        milestoneExists(_milestoneId)
    {
        milestones[_milestoneId].status = _status;
        emit MilestoneUpdated(_milestoneId, _status, milestones[_milestoneId].releasedAmount);
    }

    /**
     * @dev 更新 ProofRegistry 地址
     * @param _proofRegistry 新地址
     */
    function setProofRegistry(address _proofRegistry) external onlyOwner {
        require(_proofRegistry != address(0), "Invalid address");
        proofRegistry = ProofRegistry(_proofRegistry);
    }

    // 接收 ETH
    receive() external payable {}
}
