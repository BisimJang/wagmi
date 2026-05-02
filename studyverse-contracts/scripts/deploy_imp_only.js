import { ethers } from "ethers";
import fs from "fs";

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) throw new Error("Missing PRIVATE_KEY");

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying implementation with account:", wallet.address);

  const schoolArtifact = JSON.parse(fs.readFileSync("./artifacts/contracts/School.sol/School.json", "utf8"));
  const SchoolFactory = new ethers.ContractFactory(schoolArtifact.abi, schoolArtifact.bytecode, wallet);
  
  console.log("Starting deployment...");
  const school = await SchoolFactory.deploy();
  console.log("Waiting for deployment confirmation...");
  await school.waitForDeployment();
  const schoolAddress = await school.getAddress();
  
  console.log("--- DEPLOYMENT SUCCESS ---");
  console.log("New School implementation address:", schoolAddress);
  console.log("Now you must call setImplementation on the SchoolRegistry (0xfAB3D29B6e07a0DC50F213F4e2cb1506D86791a5) with this address.");
}

main().catch(console.error);
