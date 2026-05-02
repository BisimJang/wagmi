// 🎯 Contract Addresses
export const COURSE_CONTRACT_ADDRESS = "0xee905bF7719F83968A4B6287AF1651f7EF47b084";
export const SCHOOL_REGISTRY_ADDRESS = "0xfAB3D29B6e07a0DC50F213F4e2cb1506D86791a5";

// 🎯 School Registry ABI (Factory)
export const SCHOOL_REGISTRY_ABI = [
    { "inputs": [{ "internalType": "address", "name": "_implementation", "type": "address" }], "stateMutability": "nonpayable", "type": "constructor" },
    { "inputs": [{ "internalType": "string", "name": "_name", "type": "string" }], "name": "createSchool", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "nonpayable", "type": "function" },
    {
        "inputs": [
            { "internalType": "string", "name": "_name", "type": "string" },
            { "internalType": "uint256[]", "name": "_courseIds", "type": "uint256[]" },
            { "internalType": "uint256[]", "name": "_prices", "type": "uint256[]" }
        ], "name": "createSchoolWithCourses", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "nonpayable", "type": "function"
    },
    { "inputs": [{ "internalType": "address", "name": "_implementation", "type": "address" }], "name": "setImplementation", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "implementation", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "_creator", "type": "address" }], "name": "getSchoolsByCreator", "outputs": [{ "internalType": "address[]", "name": "", "type": "address[]" }], "stateMutability": "view", "type": "function" },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": false, "internalType": "string", "name": "name", "type": "string" },
            { "indexed": true, "internalType": "address", "name": "creator", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "schoolAddress", "type": "address" }
        ],
        "name": "SchoolCreated",
        "type": "event"
    }
];

// 🎯 Sovereign School ABI (Instance / Clone)
export const SCHOOL_ABI = [
    { "inputs": [{ "internalType": "string", "name": "_name", "type": "string" }, { "internalType": "address", "name": "_owner", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "_courseId", "type": "uint256" }, { "internalType": "uint256", "name": "_price", "type": "uint256" }], "name": "publishCourse", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    {
        "inputs": [
            { "internalType": "uint256[]", "name": "_courseIds", "type": "uint256[]" },
            { "internalType": "uint256[]", "name": "_prices", "type": "uint256[]" }
        ], "name": "bulkPublishCourses", "outputs": [], "stateMutability": "nonpayable", "type": "function"
    },
    { "inputs": [{ "internalType": "uint256", "name": "_courseId", "type": "uint256" }], "name": "enroll", "outputs": [], "stateMutability": "payable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "_courseId", "type": "uint256" }, { "internalType": "string", "name": "_uri", "type": "string" }, { "internalType": "bytes", "name": "_signature", "type": "bytes" }], "name": "claimCertificate", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "withdraw", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "_signer", "type": "address" }], "name": "setSigner", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "name": "coursePrices", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "isEnrolled", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "address", "name": "", "type": "address" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "name": "hasCertificate", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "signer", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }
];

// 🎯 Legacy Course ABI (For backward compatibility)
export const COURSE_CONTRACT_ABI = [
    // ... (Keep existing or just use the new SCHOOL_ABI if they are similar)
    // Actually, let's keep it for safety if any courses are on the old address.
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
    { // publishCourse(uint256 _courseId, uint256 _price)
        "inputs": [
            { "internalType": "uint256", "name": "_courseId", "type": "uint256" },
            { "internalType": "uint256", "name": "_price", "type": "uint256" }
        ],
        "name": "publishCourse",
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