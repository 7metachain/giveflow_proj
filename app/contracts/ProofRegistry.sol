// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProofRegistry
 * @dev GiveFlow 凭证存证与 AI 审核结果记录合约
 * @notice 记录凭证上传和 AI 审核结果，确保透明可追溯
 */
contract ProofRegistry {
    // 凭证审核状态
    enum ProofStatus {
        Pending,        // 待审核
        AIApproved,     // AI 审核通过
        AIRejected,     // AI 审核拒绝
        ManualReview,   // 人工复核中
        ManualApproved, // 人工审核通过
        ManualRejected  // 人工审核拒绝
    }

    // 凭证结构
    struct Proof {
        uint256 id;
        uint256 campaignId;      // 关联项目ID
        uint256 milestoneId;     // 关联里程碑ID
        address submitter;       // 提交者地址
        bytes32 proofHash;       // 凭证文件哈希
        bytes32 aiReportHash;    // AI 审核报告哈希
        uint256 amount;          // 申请提取金额
        ProofStatus status;      // 审核状态
        uint256 confidence;      // AI 置信度 (0-10000 表示 0-100%)
        string ipfsUri;          // 凭证文件 IPFS 地址
        uint256 submittedAt;     // 提交时间
        uint256 reviewedAt;      // 审核时间
    }

    // 状态变量
    uint256 public proofCount;
    mapping(uint256 => Proof) public proofs;
    mapping(uint256 => uint256[]) public campaignProofs;  // campaignId => proofIds
    mapping(address => uint256[]) public submitterProofs; // submitter => proofIds
    
    // AI 审核员地址 (授权调用审核结果记录)
    mapping(address => bool) public authorizedReviewers;
    
    // 管理员
    address public owner;

    // 事件
    event ProofSubmitted(
        uint256 indexed proofId,
        uint256 indexed campaignId,
        uint256 milestoneId,
        address indexed submitter,
        bytes32 proofHash,
        uint256 amount
    );
    
    event AIReviewRecorded(
        uint256 indexed proofId,
        uint256 indexed campaignId,
        ProofStatus status,
        uint256 confidence,
        bytes32 aiReportHash
    );
    
    event ManualReviewRecorded(
        uint256 indexed proofId,
        address indexed reviewer,
        ProofStatus status
    );
    
    event ReviewerAuthorized(address indexed reviewer, bool authorized);

    // 修饰符
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyAuthorizedReviewer() {
        require(authorizedReviewers[msg.sender] || msg.sender == owner, "Not authorized reviewer");
        _;
    }
    
    modifier proofExists(uint256 _proofId) {
        require(_proofId > 0 && _proofId <= proofCount, "Proof not found");
        _;
    }

    constructor() {
        owner = msg.sender;
        authorizedReviewers[msg.sender] = true;
    }

    /**
     * @dev 提交凭证
     * @param _campaignId 项目ID
     * @param _milestoneId 里程碑ID
     * @param _proofHash 凭证文件哈希
     * @param _amount 申请提取金额
     * @param _ipfsUri IPFS 地址
     */
    function submitProof(
        uint256 _campaignId,
        uint256 _milestoneId,
        bytes32 _proofHash,
        uint256 _amount,
        string calldata _ipfsUri
    ) external returns (uint256) {
        require(_campaignId > 0, "Invalid campaign");
        require(_proofHash != bytes32(0), "Invalid proof hash");
        require(_amount > 0, "Invalid amount");
        require(bytes(_ipfsUri).length > 0, "Invalid IPFS URI");
        
        proofCount++;
        uint256 newProofId = proofCount;
        
        proofs[newProofId] = Proof({
            id: newProofId,
            campaignId: _campaignId,
            milestoneId: _milestoneId,
            submitter: msg.sender,
            proofHash: _proofHash,
            aiReportHash: bytes32(0),
            amount: _amount,
            status: ProofStatus.Pending,
            confidence: 0,
            ipfsUri: _ipfsUri,
            submittedAt: block.timestamp,
            reviewedAt: 0
        });
        
        campaignProofs[_campaignId].push(newProofId);
        submitterProofs[msg.sender].push(newProofId);
        
        emit ProofSubmitted(
            newProofId,
            _campaignId,
            _milestoneId,
            msg.sender,
            _proofHash,
            _amount
        );
        
        return newProofId;
    }

    /**
     * @dev 记录 AI 审核结果
     * @param _proofId 凭证ID
     * @param _status 审核状态
     * @param _confidence 置信度 (0-10000)
     * @param _aiReportHash AI 审核报告哈希
     */
    function recordAIReview(
        uint256 _proofId,
        ProofStatus _status,
        uint256 _confidence,
        bytes32 _aiReportHash
    ) external onlyAuthorizedReviewer proofExists(_proofId) {
        require(
            _status == ProofStatus.AIApproved || 
            _status == ProofStatus.AIRejected || 
            _status == ProofStatus.ManualReview,
            "Invalid AI status"
        );
        require(_confidence <= 10000, "Invalid confidence");
        
        Proof storage proof = proofs[_proofId];
        require(proof.status == ProofStatus.Pending, "Already reviewed");
        
        proof.status = _status;
        proof.confidence = _confidence;
        proof.aiReportHash = _aiReportHash;
        proof.reviewedAt = block.timestamp;
        
        emit AIReviewRecorded(
            _proofId,
            proof.campaignId,
            _status,
            _confidence,
            _aiReportHash
        );
    }

    /**
     * @dev 记录人工审核结果
     * @param _proofId 凭证ID
     * @param _approved 是否通过
     */
    function recordManualReview(uint256 _proofId, bool _approved) 
        external 
        onlyAuthorizedReviewer 
        proofExists(_proofId) 
    {
        Proof storage proof = proofs[_proofId];
        require(
            proof.status == ProofStatus.ManualReview || 
            proof.status == ProofStatus.AIRejected,
            "Not pending manual review"
        );
        
        proof.status = _approved ? ProofStatus.ManualApproved : ProofStatus.ManualRejected;
        proof.reviewedAt = block.timestamp;
        
        emit ManualReviewRecorded(_proofId, msg.sender, proof.status);
    }

    /**
     * @dev 获取凭证信息
     * @param _proofId 凭证ID
     */
    function getProof(uint256 _proofId) 
        external 
        view 
        proofExists(_proofId) 
        returns (Proof memory) 
    {
        return proofs[_proofId];
    }

    /**
     * @dev 获取凭证审核状态
     * @param _proofId 凭证ID
     */
    function getProofStatus(uint256 _proofId) 
        external 
        view 
        proofExists(_proofId) 
        returns (ProofStatus) 
    {
        return proofs[_proofId].status;
    }

    /**
     * @dev 检查凭证是否审核通过
     * @param _proofId 凭证ID
     */
    function isProofApproved(uint256 _proofId) 
        external 
        view 
        proofExists(_proofId) 
        returns (bool) 
    {
        ProofStatus status = proofs[_proofId].status;
        return status == ProofStatus.AIApproved || status == ProofStatus.ManualApproved;
    }

    /**
     * @dev 获取项目的所有凭证
     * @param _campaignId 项目ID
     */
    function getCampaignProofs(uint256 _campaignId) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return campaignProofs[_campaignId];
    }

    /**
     * @dev 获取提交者的所有凭证
     * @param _submitter 提交者地址
     */
    function getSubmitterProofs(address _submitter) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return submitterProofs[_submitter];
    }

    /**
     * @dev 授权审核员
     * @param _reviewer 审核员地址
     * @param _authorized 是否授权
     */
    function authorizeReviewer(address _reviewer, bool _authorized) 
        external 
        onlyOwner 
    {
        authorizedReviewers[_reviewer] = _authorized;
        emit ReviewerAuthorized(_reviewer, _authorized);
    }
}
