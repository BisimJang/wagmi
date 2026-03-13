// 🎯 Contract Address - Updated to the newly deployed Sepolia address
export const COURSE_CONTRACT_ADDRESS = "0xee905bF7719F83968A4B6287AF1651f7EF47b084";

// 🎯 Contract ABI - Cleaned for required functions and mappings
export const COURSE_CONTRACT_ABI = [
    // --- Constructor ---
    { "inputs": [{ "internalType": "uint256", "name": "_initialFee", "type": "uint256" }], "stateMutability": "nonpayable", "type": "constructor" },

    // --- Write Functions ---
    { // enroll(uint256 _courseId)
        "inputs": [{ "internalType": "uint256", "name": "_courseId", "type": "uint256" }],
        "name": "enroll",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    { // setCoursePrice(uint256 _courseId, uint256 _newFee)
        "inputs": [
            { "internalType": "uint256", "name": "_courseId", "type": "uint256" },
            { "internalType": "uint256", "name": "_newFee", "type": "uint256" }
        ],
        "name": "setCoursePrice",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },

    // --- Read/View Functions ---
    { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { // coursePrices(uint256)
        "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "name": "coursePrices",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    { // isEnrolled(address student, uint256 _courseId)
        "inputs": [
            { "internalType": "address", "name": "student", "type": "address" },
            { "internalType": "uint256", "name": "_courseId", "type": "uint256" }
        ],
        "name": "isEnrolled",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    
    // --- Events ---
    { // Enrolled event
        "anonymous": false, "inputs": [
            { "indexed": true, "internalType": "address", "name": "student", "type": "address" },
            { "indexed": true, "internalType": "uint256", "name": "courseId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ], "name": "Enrolled", "type": "event"
    },
    { // PriceUpdated event
        "anonymous": false, "inputs": [
            { "indexed": true, "internalType": "uint256", "name": "courseId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "oldFee", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "newFee", "type": "uint256" }
        ], "name": "PriceUpdated", "type": "event"
    }
];