// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title Sovereign School Contract (Initializable for Clones)
 */
contract School is Initializable, ERC721URIStorageUpgradeable, ReentrancyGuardUpgradeable, OwnableUpgradeable {
    string public schoolName;
    uint256 private _nextTokenId;
    mapping(uint256 => bool) public courseExists;

    mapping(uint256 => uint256) public coursePrices;
    mapping(address => mapping(uint256 => bool)) public isEnrolled;
    mapping(address => mapping(uint256 => bool)) public hasCertificate;
    address public signer;

    event CoursePublished(uint256 indexed courseId, uint256 price);
    event Enrolled(address indexed student, uint256 indexed courseId, uint256 amount);
    event CertificateClaimed(address indexed student, uint256 indexed courseId, uint256 tokenId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /**
     * @dev Initializer instead of constructor for Clone compatibility
     */
    function initialize(string memory _name, address _owner) public initializer {
        __ERC721_init("StudyverseCertificate", "SVC");
        __ERC721URIStorage_init();
        __ReentrancyGuard_init();
        __Ownable_init(_owner);
        schoolName = _name;
        signer = _owner; 
        _nextTokenId = 1; // Start IDs at 1 for better marketplace compatibility
    }

    function setSigner(address _signer) external onlyOwner {
        signer = _signer;
    }

    function publishCourse(uint256 _courseId, uint256 _price) external onlyOwner {
        require(_price > 0, "Price must be > 0");
        coursePrices[_courseId] = _price;
        courseExists[_courseId] = true;
        emit CoursePublished(_courseId, _price);
    }

    /**
     * @dev Bulk Price Initializer
     */
    function bulkPublishCourses(uint256[] calldata _courseIds, uint256[] calldata _prices) external onlyOwner {
        require(_courseIds.length == _prices.length, "Mismatch");
        for (uint256 i = 0; i < _courseIds.length; i++) {
            require(_prices[i] > 0, "Price must be > 0");
            coursePrices[_courseIds[i]] = _prices[i];
            courseExists[_courseIds[i]] = true;
            emit CoursePublished(_courseIds[i], _prices[i]);
        }
    }

    function enroll(uint256 _courseId) external payable nonReentrant {
        require(courseExists[_courseId], "Course does not exist");
        uint256 price = coursePrices[_courseId];
        require(price > 0, "Not for sale");
        require(msg.value == price, "Wrong amount");
        require(!isEnrolled[msg.sender][_courseId], "Enrolled");

        isEnrolled[msg.sender][_courseId] = true;
        // Optimization: Enroll doesn't mint anymore, completion does!
        emit Enrolled(msg.sender, _courseId, msg.value);
    }

    /**
     * @dev Allows student to claim certificate using a signature from the authorized signer.
     */
    function claimCertificate(uint256 _courseId, string calldata _uri, bytes calldata _signature) external nonReentrant {
        require(isEnrolled[msg.sender][_courseId], "Not enrolled");
        require(!hasCertificate[msg.sender][_courseId], "Already claimed");
        
        // Verify signature
        // Verify signature (Security Fix: include chainId to prevent replay attacks)
        bytes32 messageHash = keccak256(abi.encodePacked(msg.sender, _courseId, _uri, address(this), block.chainid));
        bytes32 ethSignedMessageHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash));
        
        address recoveredSigner = _recoverSigner(ethSignedMessageHash, _signature);
        require(recoveredSigner != address(0), "Invalid signature format");
        require(recoveredSigner == signer, "Invalid signature");

        hasCertificate[msg.sender][_courseId] = true;
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, _uri);
        
        emit CertificateClaimed(msg.sender, _courseId, tokenId);
    }

    function _recoverSigner(bytes32 _ethSignedMessageHash, bytes memory _signature) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(_signature);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function _splitSignature(bytes memory _sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(_sig.length == 65, "Invalid signature length");
        assembly ("memory-safe") {
            r := mload(add(_sig, 32))
            s := mload(add(_sig, 64))
            v := byte(0, mload(add(_sig, 96)))
        }
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Failed");
    }
}
