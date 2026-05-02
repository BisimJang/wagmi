import { ethers } from "ethers";
import fs from "fs";

async function main() {
  const rpcUrl = process.env.SEPOLIA_RPC_URL;
  const privateKey = process.env.PRIVATE_KEY; // Using PRIVATE_KEY as it is in .env

  if (!rpcUrl || !privateKey) {
    throw new Error("Missing environment variables");
  }

  console.log("Connecting to network...");
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Deploying with account:", wallet.address);

  // 1. Load School Artifact
  const schoolArtifact = JSON.parse(fs.readFileSync("./artifacts/contracts/School.sol/School.json", "utf8"));
  
  // 2. Deploy School Implementation
  console.log("Deploying new School implementation...");
  const SchoolFactory = new ethers.ContractFactory(schoolArtifact.abi, schoolArtifact.bytecode, wallet);
  const school = await SchoolFactory.deploy();
  await school.waitForDeployment();
  const schoolAddress = await school.getAddress();
  console.log("New School implementation deployed to:", schoolAddress);

  // 3. Update Registry
  const registryAddress = "0xfAB3D29B6e07a0DC50F213F4e2cb1506D86791a5";
  const registryArtifact = JSON.parse(fs.readFileSync("./artifacts/contracts/SchoolRegistry.sol/SchoolRegistry.json", "utf8"));
  const registry = new ethers.Contract(registryAddress, registryArtifact.abi, wallet);

  console.log("Updating Registry at:", registryAddress);
  const tx = await registry.setImplementation(schoolAddress);
  console.log("Transaction sent. Waiting for confirmation...");
  await tx.wait();

  console.log("Registry implementation successfully updated!");
}

main().catch(console.error);
