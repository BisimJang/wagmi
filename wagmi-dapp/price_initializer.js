// This script automates setting prices for all courses on the smart contract.
// NOTE: This must be run with the private key of the CONTRACT OWNER.

// 🎯 FIX 1: Import all main functions from 'viem' except privateKeyToAccount
import { createPublicClient, createWalletClient, http, parseUnits } from 'viem'; 
// 🎯 FIX 2: Import privateKeyToAccount from 'viem/accounts'
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { COURSE_CONTRACT_ADDRESS, COURSE_CONTRACT_ABI } from './src/web3/constants.js';

// NOTE: Using a polyfill or global fetch. If native fetch is unavailable, install node-fetch: npm install node-fetch@2

// Ensure environment variables are set (RPC URL, OWNER Private Key, and Django API URL)
const RPC_URL = process.env.SEPOLIA_RPC_URL;
const PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;
const DJANGO_API_URL = process.env.DJANGO_API_URL; // New required variable

if (!RPC_URL || !PRIVATE_KEY || !DJANGO_API_URL) {
  console.error("Error: SEPOLIA_RPC_URL, OWNER_PRIVATE_KEY, and DJANGO_API_URL must be set in your environment.");
  process.exit(1);
}

// 🎯 FIX: Sanitize the private key to ensure it has the 0x prefix, which viem strictly requires.
const sanitizedPrivateKey = PRIVATE_KEY.startsWith('0x') ? PRIVATE_KEY : `0x${PRIVATE_KEY}`;

const account = privateKeyToAccount(sanitizedPrivateKey);

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

const walletClient = createWalletClient({
  chain: sepolia,
  account,
  transport: http(RPC_URL),
});

async function fetchCourseData() {
  console.log(`Fetching course data from: ${DJANGO_API_URL}`);
  try {
    // You may need to handle authentication if your /courses/ endpoint is protected
    const response = await fetch(DJANGO_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch course data from Django API:", error);
    process.exit(1);
  }
}

async function initializeCoursePrices() {
  console.log(`Starting price initialization on contract: ${COURSE_CONTRACT_ADDRESS}`);
  console.log(`Owner address: ${account.address}`);

  const courseList = await fetchCourseData(); 

  for (const course of courseList) {
    // Ensure the required fields (id and price) exist and are valid strings
    if (!course.id || typeof course.price !== 'string') {
        console.error(`Skipping course with missing ID or price:`, course);
        continue;
    }
    
    try {
      // 1. Convert human-readable price to Wei (BigInt)
      const feeInWei = parseUnits(course.price, 18);
      
      console.log(`\n--- Initializing Course ID ${course.id}: ${course.title || course.name} ---`);
      console.log(`Setting price to ${course.price} ETH (${feeInWei.toString()} Wei)`);

      // 2. Prepare transaction arguments
      const args = [
        BigInt(course.id), // _courseId (uint256)
        feeInWei            // _newFee (uint256)
      ];

      // 3. Send transaction to set the price
      const hash = await walletClient.writeContract({
        address: COURSE_CONTRACT_ADDRESS,
        abi: COURSE_CONTRACT_ABI,
        functionName: 'setCoursePrice',
        args: args,
        account,
        chain: sepolia
      });

      console.log(`Tx submitted for ID ${course.id}: ${hash}`);

      // 4. Wait for the transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        console.log(`✅ Success! Price set for Course ID ${course.id}.`);
      } else {
        console.error(`❌ Failed to set price for Course ID ${course.id}. Transaction reverted.`);
      }

    } catch (error) {
      console.error(`\nFatal error processing course ID ${course.id}:`, error.message);
      console.error("Check network, gas limits, or owner status.");
    }
  }

  console.log("\n--- Initialization Complete ---");
}

initializeCoursePrices();