// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

// Returns the Ether balance of a given address
async function getBalance(address) {
  const balanceBigInt = await hre.waffle.provider.getBalance(address);
  return hre.ethers.utils.formatEther(balanceBigInt);
}

// Logs the Ether balances for a list of addresses
async function printBalances(addresses) {
  let idx = 0;
  for (const address of addresses) {
    console.log(`Address ${idx} balance: `, await getBalance(address));
    idx++;
  }
}

// Logs the memos stored on-chain from funding histories
async function printMemos(memos) {
  for (const memo of memos) {
    const timestamp = memo.timestamp;
    const funder = memo.name;
    const funderAddress = memo.from;
    const message = memo.message;
    console.log(`At ${timestamp}, ${funder} (${funderAddress} said: "${message}")`);
  }
}

async function main() {
  // Get example accounts
  const [owner, funder, funder2, funder3] = await hre.ethers.getSigners();

  // Get the contract to deploy & deploy
  const FundMe = await hre.ethers.getContractFactory("FundMe");
  const fundMe = await FundMe.deploy();
  await fundMe.deployed();
  console.log("FundMe deployed to ", fundMe.address);

  // Check balances before the fundings
  const addresses = [owner.address, funder.address, fundMe.address]
  console.log("== start ==");
  await printBalances(addresses);

  // Fund the owner with some funds
  const fund = {value: hre.ethers.utils.parseEther("1")};
  await fundMe.connect(funder).fundMe("Alice", "WAGMI!", fund);
  await fundMe.connect(funder2).fundMe("Bob", "DeFi to the moon!", fund);
  await fundMe.connect(funder3).fundMe("Cam", "GM!", fund);

  // Check the balances after fundings
  console.log("== after fundings ==");
  await printBalances(addresses);

  // Withdraw funds
  await fundMe.connect(owner).withdrawFunds();

  // Check balance after withdraw
  console.log("== after withdraw ==");
  await printBalances(addresses);

  // Read all the memos left for the owner
  console.log("== memos ==");
  const memos = await fundMe.getMemos();
  await printMemos(memos);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
