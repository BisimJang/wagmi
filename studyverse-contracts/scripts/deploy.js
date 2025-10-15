// scripts/deploy.js
import { ethers } from "hardhat"; // This is the correct way to import HRE variables in an ES Module setup.

async function main() {
  const [deployer] = await ethers.getSigners(); // Access ethers directly
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy CourseToken
  const CourseToken = await ethers.getContractFactory("CourseToken");
  const courseToken = await CourseToken.deploy();
  await courseToken.deployed();
  console.log("CourseToken deployed to:", courseToken.address);

  // Deploy EnrollmentManager
  const EnrollmentManager = await ethers.getContractFactory("EnrollmentManager");
  const enrollmentManager = await EnrollmentManager.deploy(courseToken.address, deployer.address);
  await enrollmentManager.deployed();
  console.log("EnrollmentManager deployed to:", enrollmentManager.address);

  // Deploy CertificateNFT
  const CertificateNFT = await ethers.getContractFactory("CertificateNFT");
  const certificateNFT = await CertificateNFT.deploy();
  await certificateNFT.deployed();
  console.log("CertificateNFT deployed to:", certificateNFT.address);
}

// Run the deploy
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});