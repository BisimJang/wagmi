// src/web3/constants.js

// 🎯 Contract Address - Updated to the newly deployed Sepolia address
export const COURSE_CONTRACT_ADDRESS = "0xe4B725F11e8A88DE55826370D6a1EE4a25aAD571";

// 🎯 Contract ABI (Includes all relevant public functions and events)
export const COURSE_CONTRACT_ABI = [
    // --- State-Changing Functions ---
    { 
        "inputs": [], 
        "name": "enroll", 
        "outputs": [], 
        "stateMutability": "payable", 
        "type": "function" 
    },
    { 
        "inputs": [{ "internalType": "uint256", "name": "_newFee", "type": "uint256" }], 
        "name": "setCourseFee", 
        "outputs": [], 
        "stateMutability": "nonpayable", // Key: Does not accept ETH payment
        "type": "function" 
    },
    { 
        "inputs": [], 
        "name": "withdraw", 
        "outputs": [], 
        "stateMutability": "nonpayable", 
        "type": "function" 
    },

    // --- View Functions ---
    { 
        "inputs": [], 
        "name": "courseFee", 
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], 
        "stateMutability": "view", 
        "type": "function" 
    },
    { 
        "inputs": [{ "internalType": "address", "name": "student", "type": "address" }], 
        "name": "isEnrolled", 
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], 
        "stateMutability": "view", 
        "type": "function" 
    },
    { 
        "inputs": [], 
        "name": "owner", 
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }], 
        "stateMutability": "view", 
        "type": "function" 
    },

    // --- Events ---
    { 
        "anonymous": false, 
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "student", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ], 
        "name": "Enrolled", 
        "type": "event"
    },
    { 
        "anonymous": false, 
        "inputs": [
            { "indexed": false, "internalType": "uint256", "name": "oldFee", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "newFee", "type": "uint256" }
        ], 
        "name": "FeeUpdated", 
        "type": "event"
    }
];