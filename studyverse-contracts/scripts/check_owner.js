import { ethers } from "ethers";

async function main() {
  const rpcUrl = "https://ethereum-sepolia-rpc.publicnode.com";
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const registryAddress = "0xfAB3D29B6e07a0DC50F213F4e2cb1506D86791a5";
  
  const abi = ["function owner() view returns (address)"];
  const registry = new ethers.Contract(registryAddress, abi, provider);

  const owner = await registry.owner();
  console.log("Registry Owner:", owner);
}

main().catch(console.error);
