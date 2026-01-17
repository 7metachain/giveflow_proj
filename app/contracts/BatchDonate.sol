// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CampaignRegistry.sol";

/**
 * @title BatchDonate
 * @dev GiveFlow 批量捐赠合约
 * @notice 支持用户一次性向多个公益项目捐赠，充分利用 Monad 的并行执行特性
 */
contract BatchDonate {
    // CampaignRegistry 合约引用
    CampaignRegistry public campaignRegistry;
    
    // 管理员
    address public owner;
    
    // 捐赠记录
    struct DonationRecord {
        uint256 campaignId;
        uint256 amount;
        uint256 timestamp;
    }
    
    // 用户捐赠历史
    mapping(address => DonationRecord[]) public donorHistory;
    
    // 批量捐赠统计
    uint256 public totalBatchDonations;
    uint256 public totalAmountDonated;

    // 事件
    event BatchDonationExecuted(
        address indexed donor,
        uint256[] campaignIds,
        uint256[] amounts,
        uint256 totalAmount,
        uint256 timestamp
    );
    
    event SingleDonationInBatch(
        address indexed donor,
        uint256 indexed campaignId,
        uint256 amount
    );

    // 修饰符
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(address _campaignRegistry) {
        owner = msg.sender;
        campaignRegistry = CampaignRegistry(_campaignRegistry);
    }

    /**
     * @dev 批量捐赠到多个项目
     * @param _campaignIds 项目ID数组
     * @param _amounts 对应的捐赠金额数组
     * @notice 利用 Monad 的并行执行，高效处理多笔捐赠
     */
    function batchDonate(
        uint256[] calldata _campaignIds,
        uint256[] calldata _amounts
    ) external payable {
        require(_campaignIds.length > 0, "No campaigns specified");
        require(_campaignIds.length == _amounts.length, "Arrays length mismatch");
        require(_campaignIds.length <= 10, "Max 10 campaigns per batch");
        
        // 计算总金额
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            require(_amounts[i] > 0, "Amount must be positive");
            totalAmount += _amounts[i];
        }
        
        require(msg.value >= totalAmount, "Insufficient ETH sent");
        
        // 执行批量捐赠
        for (uint256 i = 0; i < _campaignIds.length; i++) {
            // 调用 CampaignRegistry 的 donate 函数
            // 注意：这里需要 CampaignRegistry 支持从合约接收捐赠
            _donateToProject(_campaignIds[i], _amounts[i]);
            
            // 记录捐赠历史
            donorHistory[msg.sender].push(DonationRecord({
                campaignId: _campaignIds[i],
                amount: _amounts[i],
                timestamp: block.timestamp
            }));
            
            emit SingleDonationInBatch(msg.sender, _campaignIds[i], _amounts[i]);
        }
        
        // 更新统计
        totalBatchDonations++;
        totalAmountDonated += totalAmount;
        
        // 退还多余的 ETH
        if (msg.value > totalAmount) {
            (bool success, ) = payable(msg.sender).call{value: msg.value - totalAmount}("");
            require(success, "Refund failed");
        }
        
        emit BatchDonationExecuted(
            msg.sender,
            _campaignIds,
            _amounts,
            totalAmount,
            block.timestamp
        );
    }

    /**
     * @dev 内部函数：向单个项目捐赠
     * @param _campaignId 项目ID
     * @param _amount 金额
     */
    function _donateToProject(uint256 _campaignId, uint256 _amount) internal {
        // 直接转账到 CampaignRegistry 并调用 donate
        (bool success, ) = address(campaignRegistry).call{value: _amount}(
            abi.encodeWithSignature("donate(uint256)", _campaignId)
        );
        require(success, "Donation failed");
    }

    /**
     * @dev 平均分配捐赠到多个项目
     * @param _campaignIds 项目ID数组
     * @notice 将发送的 ETH 平均分配到所有指定项目
     */
    function splitDonate(uint256[] calldata _campaignIds) external payable {
        require(_campaignIds.length > 0, "No campaigns specified");
        require(_campaignIds.length <= 10, "Max 10 campaigns per batch");
        require(msg.value > 0, "No ETH sent");
        
        uint256 amountPerCampaign = msg.value / _campaignIds.length;
        require(amountPerCampaign > 0, "Amount too small to split");
        
        uint256[] memory amounts = new uint256[](_campaignIds.length);
        for (uint256 i = 0; i < _campaignIds.length; i++) {
            amounts[i] = amountPerCampaign;
        }
        
        // 处理余数，添加到第一个项目
        uint256 remainder = msg.value - (amountPerCampaign * _campaignIds.length);
        if (remainder > 0) {
            amounts[0] += remainder;
        }
        
        // 执行批量捐赠
        for (uint256 i = 0; i < _campaignIds.length; i++) {
            _donateToProject(_campaignIds[i], amounts[i]);
            
            donorHistory[msg.sender].push(DonationRecord({
                campaignId: _campaignIds[i],
                amount: amounts[i],
                timestamp: block.timestamp
            }));
            
            emit SingleDonationInBatch(msg.sender, _campaignIds[i], amounts[i]);
        }
        
        totalBatchDonations++;
        totalAmountDonated += msg.value;
        
        emit BatchDonationExecuted(
            msg.sender,
            _campaignIds,
            amounts,
            msg.value,
            block.timestamp
        );
    }

    /**
     * @dev 获取用户捐赠历史
     * @param _donor 捐赠者地址
     */
    function getDonorHistory(address _donor) 
        external 
        view 
        returns (DonationRecord[] memory) 
    {
        return donorHistory[_donor];
    }

    /**
     * @dev 获取用户捐赠的项目数量
     * @param _donor 捐赠者地址
     */
    function getDonorCampaignCount(address _donor) 
        external 
        view 
        returns (uint256) 
    {
        return donorHistory[_donor].length;
    }

    /**
     * @dev 获取用户总捐赠金额
     * @param _donor 捐赠者地址
     */
    function getDonorTotalAmount(address _donor) 
        external 
        view 
        returns (uint256) 
    {
        uint256 total = 0;
        DonationRecord[] memory history = donorHistory[_donor];
        for (uint256 i = 0; i < history.length; i++) {
            total += history[i].amount;
        }
        return total;
    }

    /**
     * @dev 更新 CampaignRegistry 地址
     * @param _campaignRegistry 新地址
     */
    function setCampaignRegistry(address _campaignRegistry) external onlyOwner {
        require(_campaignRegistry != address(0), "Invalid address");
        campaignRegistry = CampaignRegistry(_campaignRegistry);
    }

    // 接收 ETH
    receive() external payable {}
}
