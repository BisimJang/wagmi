import { ethers } from "hardhat";
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Updating platform signatures with account:", deployer.address);

  // 1. Deploy the new School Implementation (contains the 'signer' variable)
  console.log("Deploying new School implementation...");
  const School = await ethers.getContractFactory("School");
  const school = await School.deploy();
  await school.waitForDeployment();
  const schoolAddress = await school.getAddress();
  console.log("New School implementation deployed to:", schoolAddress);

  // 2. Update the Registry to use this new implementation
  const SCHOOL_REGISTRY_ADDRESS = "0xfAB3D29B6e07a0DC50F213F4e2cb1506D86791a5";
  console.log("Updating Registry at:", SCHOOL_REGISTRY_ADDRESS);
  
  const SchoolRegistry = await ethers.getContractAt("SchoolRegistry", SCHOOL_REGISTRY_ADDRESS);
  const tx = await SchoolRegistry.setImplementation(schoolAddress);
  console.log("Transaction sent. Waiting for confirmation...");
  await tx.wait();
  
  console.log("Registry implementation successfully updated!");
  console.log("All future schools will now support automated certificate authorized signatures.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
