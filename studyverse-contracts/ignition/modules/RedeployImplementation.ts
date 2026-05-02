import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const RedeployImplementationModule = buildModule("RedeployImplementationModule", (m) => {
  // 1. Deploy the new School Implementation
  const school = m.contract("School");
  
  // 2. Get the registry instance
  const registry = m.contractAt("SchoolRegistry", "0xfAB3D29B6e07a0DC50F213F4e2cb1506D86791a5");
  
  // 3. Update the registry with the new implementation address
  m.call(registry, "setImplementation", [school]);

  return { school, registry };
});

export default RedeployImplementationModule;
