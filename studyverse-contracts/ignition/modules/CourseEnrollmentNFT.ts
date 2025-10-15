import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const CourseModule = buildModule("CourseModule", (m) => {
  const courseFee = m.getParameter("courseFee", 1000000000000000n); // 0.001 ETH in wei
  const course = m.contract("CourseEnrollmentNFT", [courseFee]);
  return { course };
});

export default CourseModule;
