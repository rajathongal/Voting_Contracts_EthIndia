const hre = require("hardhat");

const { deployContract } = hre.waffle;

/**
 * Deploy a contract with the given artifact name
 * Will be deployed by the given deployer address with the given params
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const deploy = async (contractName, deployer, params) => {
    try {
        const artifact = await hre.artifacts.readArtifact(contractName);
        return await deployContract(deployer, artifact, params);
    } catch(err) {console.log("From contract deploy",err)}
}

module.exports = {deploy};