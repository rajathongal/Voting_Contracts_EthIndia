// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const VotingPowerStore = await hre.ethers.getContractFactory("VotingPower");
  const VotingPower = await VotingPowerStore.deploy();
  await VotingPower.deployed();
  console.log("VotingPowerContract", VotingPower.address)

  const votingPowerC = VotingPower.address; // "0x8068c9D6c99855854be6519DfB879D7F934D6434"

  const BasketCoinNFT = await hre.ethers.getContractFactory("BasketCoinNFT");
  const BasketCoinNFTContract = await BasketCoinNFT.deploy();
  await BasketCoinNFTContract.deployed();
  console.log("BasketCoinNFTContract", BasketCoinNFTContract.address)

  const BasketCoinNFTC = BasketCoinNFTContract.address; //"0x9125d41850790276cf38b61c9876881A9b80c26f"

  const BasketCoin = await hre.ethers.getContractFactory("BasketCoin");
  const BasketCoinContract = await BasketCoin.deploy();
  await BasketCoinContract.deployed();
  console.log("BasketCoinContract", BasketCoinContract.address)

  const BasketCoinC = BasketCoinContract.address; // "0xB9ccE86277f176bDbE1FF8b7c1f43B53AD0E052f"


  const StakedCoin = await hre.ethers.getContractFactory("StakedCoin");
  const StakedCoinContract = await StakedCoin.deploy();
  await StakedCoinContract.deployed();
  console.log("StakedCoinContract", StakedCoinContract.address)

  const StakedCoinC = StakedCoinContract.address; // 0xD2911122650296022288CA7E0756eC7e8b5d43Fc


  const Governor = await hre.ethers.getContractFactory("Governor");
  const GovernorContract = await Governor.deploy(BasketCoinC, StakedCoinC, BasketCoinNFTC, votingPowerC);
  await GovernorContract.deployed();
  console.log("GovernorContract", GovernorContract.address) // 0xFe684A8ca03025504bAF6240916ffadaB153fF00
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
