// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./School.sol";

/**
 * @title Studyverse School Registry (Clone Factory)
 */
contract SchoolRegistry is Ownable {
    address public implementation;
    address[] public allSchools;
    mapping(address => address[]) public creatorToSchools;

    event SchoolCreated(string name, address indexed creator, address indexed schoolAddress);
    event ImplementationUpdated(address indexed implementation);

    constructor(address _implementation) Ownable(msg.sender) {
        implementation = _implementation;
    }

    /**
     * @dev Allows owner to update the master school implementation for future clones
     */
    function setImplementation(address _implementation) external onlyOwner {
        implementation = _implementation;
        emit ImplementationUpdated(_implementation);
    }

    /**
     * @dev Creates a new school via EIP-1167 Clone. Very gas efficient.
     */
    function createSchool(string memory _name) external returns (address) {
        require(implementation != address(0), "Imp not set");
        
        address schoolProxy = Clones.clone(implementation);
        School(schoolProxy).initialize(_name, msg.sender);
        
        allSchools.push(schoolProxy);
        creatorToSchools[msg.sender].push(schoolProxy);
        
        emit SchoolCreated(_name, msg.sender, schoolProxy);
        return schoolProxy;
    }

    /**
     * @dev Creation with Price Initializer. Uses Clones and atomic initialization.
     */
    function createSchoolWithCourses(
        string memory _name, 
        uint256[] calldata _courseIds, 
        uint256[] calldata _prices
    ) external returns (address) {
        require(implementation != address(0), "Imp not set");
        
        address schoolProxy = Clones.clone(implementation);
        School(schoolProxy).initialize(_name, msg.sender);
        
        // Internal bulk initialization
        School(schoolProxy).bulkPublishCourses(_courseIds, _prices);
        
        allSchools.push(schoolProxy);
        creatorToSchools[msg.sender].push(schoolProxy);
        
        emit SchoolCreated(_name, msg.sender, schoolProxy);
        return schoolProxy;
    }

    function getAllSchools() external view returns (address[] memory) {
        return allSchools;
    }

    function getSchoolsByCreator(address _creator) external view returns (address[] memory) {
        return creatorToSchools[_creator];
    }
}
