const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Studyverse MVP contracts", function () {
  let cert, enroll, deployer, user;

  beforeEach(async () => {
    [deployer, user] = await ethers.getSigners();

    const Enrollment = await ethers.getContractFactory("EnrollmentManager");
    enroll = await upgrades.deployProxy(Enrollment, [deployer.address], { initializer: "initialize" });

    const Cert = await ethers.getContractFactory("CertificateNFT");
    cert = await upgrades.deployProxy(Cert, ["Test Cert", "TCERT", deployer.address], { initializer: "initialize", kind: "uups" });
  });

  it("enrolls a user and issues certificate", async function () {
    // grant enroller role to deployer (already set in initialize)
    await enroll.enroll(user.address, 42, "ipfs://dummyCid");
    const isEnrolled = await enroll.isEnrolled(user.address, 42);
    expect(isEnrolled).to.be.true;

    // issue certificate for user
    const tx = await cert.issueCertificate(user.address, 42, "ipfs://certCid", "Completed course 42");
    const rc = await tx.wait();
    // tokenId will be 1 (first minted)
    expect(rc.status).to.equal(1);

    const c = await cert.getCertificate(1);
    expect(c.courseId).to.equal(42);
    expect(c.ipfsCid).to.equal("ipfs://certCid");
    expect(c.revoked).to.be.false;
  });
});
