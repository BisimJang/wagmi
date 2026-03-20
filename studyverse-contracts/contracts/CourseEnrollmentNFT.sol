// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CourseEnrollmentNFT is ERC721URIStorage, ReentrancyGuard, Ownable {
    uint256 public courseFee;
    uint256 private _nextTokenId;

    mapping(address => bool) public enrolled;
    mapping(uint256 => uint256) public coursePrices;

    event Enrolled(address indexed student, uint256 indexed courseId, uint256 amount);
    event CoursePublished(address indexed school, uint256 indexed courseId, uint256 price);

    constructor(uint256 _courseFee) ERC721("StudyverseCourse", "SVC") Ownable(msg.sender) {
        courseFee = _courseFee;
    }

    /**
     * @dev Records a course price on-chain. Only the school (owner) can do this.
     */
    function publishCourse(uint256 _courseId, uint256 _price) external onlyOwner {
        coursePrices[_courseId] = _price;
        emit CoursePublished(msg.sender, _courseId, _price);
    }

    /**
     * @dev Fallback enroll for previous compatibility or global fee.
     */
    function enroll(string memory metadataURI) external payable nonReentrant {
        require(msg.value == courseFee, "Must pay exact course fee");
        require(!enrolled[msg.sender], "Already enrolled");

        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        enrolled[msg.sender] = true;
        emit Enrolled(msg.sender, 0, msg.value);
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 amount = address(this).balance;
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Withdraw failed");
    }

    function setCourseFee(uint256 newFee) external onlyOwner {
        require(newFee > 0, "Fee must be > 0");
        courseFee = newFee;
    }
}
