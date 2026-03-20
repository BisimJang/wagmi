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

    mapping(uint256 => uint256) public coursePrices;
    mapping(address => mapping(uint256 => bool)) public isEnrolled;

    event CoursePublished(uint256 indexed courseId, uint256 price);
    event Enrolled(address indexed student, uint256 indexed courseId, uint256 amount);

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
    }

    function publishCourse(uint256 _courseId, uint256 _price) external onlyOwner {
        coursePrices[_courseId] = _price;
        emit CoursePublished(_courseId, _price);
    }

    /**
     * @dev Bulk Price Initializer
     */
    function bulkPublishCourses(uint256[] calldata _courseIds, uint256[] calldata _prices) external onlyOwner {
        require(_courseIds.length == _prices.length, "Mismatch");
        for (uint256 i = 0; i < _courseIds.length; i++) {
            coursePrices[_courseIds[i]] = _prices[i];
            emit CoursePublished(_courseIds[i], _prices[i]);
        }
    }

    function enroll(uint256 _courseId) external payable nonReentrant {
        uint256 price = coursePrices[_courseId];
        require(price > 0, "Not for sale");
        require(msg.value == price, "Wrong amount");
        require(!isEnrolled[msg.sender][_courseId], "Enrolled");

        isEnrolled[msg.sender][_courseId] = true;
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        emit Enrolled(msg.sender, _courseId, msg.value);
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Failed");
    }
}
