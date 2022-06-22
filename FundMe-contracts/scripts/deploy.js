const hre = require("hardhat");

async function main() {
  // Get the contract to deploy & deploy
  const FundMe = await hre.ethers.getContractFactory("FundMe");
  const fundMe = await FundMe.deploy();
  await fundMe.deployed();
  console.log("FundMe deployed to ", fundMe.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });