# Frontend Repository
https://github.com/bijankundu/coinGov

Deployed Link 
https://dao2.netlify.app/

#Contracts on polygon mumbai 
VotingPowerContract 0xE4a430721a0981c4cEfc387CA3a3eb8157b8069a
https://mumbai.polygonscan.com/address/0xE4a430721a0981c4cEfc387CA3a3eb8157b8069a

BasketCoinNFTContract 0xb6F7E3C19EeA4A28758F441DF62F635f36e96C0E
https://mumbai.polygonscan.com/address/0xb6F7E3C19EeA4A28758F441DF62F635f36e96C0E

BasketCoinContract 0x0ff08Ff0c70C021Bf2e2E269e27f7233FB735d86
https://mumbai.polygonscan.com/address/0x0ff08Ff0c70C021Bf2e2E269e27f7233FB735d86

StakedCoinContract 0x595924673703Ea3Ce8dBb9392b10787EBF5A8Efe
https://mumbai.polygonscan.com/address/0x595924673703Ea3Ce8dBb9392b10787EBF5A8Efe

GovernorContract 0x0C44b10d0dcE025215b62d09256271b4067CC6b5
https://mumbai.polygonscan.com/address/0x0C44b10d0dcE025215b62d09256271b4067CC6b5



# Before going to Mainnet Guide!
### _Please follow below instructions before going to mainnet launch_

- Please make sure you have nodejs and vscode installed.
- Go to contracts/Governor.sol 
- Change this line import "./interfaces/IBSKTStakingContractForTesting.sol" at line no 10 to import "./interfaces/IBSKTStakingContract.sol".
- Go to scripts/deploy.js line no 48 and paste this const GovernorContract = await Governor.deploy(basetcoinAddress, stakingcontractaddress, basketNFTaddress, votingPowerC). Do not change this word votingPowerC.
- Go to hardhat.config.js in root directory and go to line no 48 and paste your wallet private key.
- Run Command npx hardhat deploy --network bsc

## Features

- Polling Proposal
- Executive proposal
- Adjust voting power and minimum votes required to complete the proposal
- NFT Dao operations
- Admin operations


## Tech

- Hardhat
- Waffle
- Openzeppelin standard codes
- Chai and mocha 
- [node.js] - evented I/O for the backend



## Installation

BasketCoin Dao requires [Node.js](https://nodejs.org/) v10+ to run.

Install the dependencies and devDependencies and start the server.

```sh
npm i
```

For mainnet deployment...

```sh
npx hardhat deploy --network bsc
```


## Make sure before testing
- Go to contracts/Governor.sol 
- Make sure this line import "./interfaces/IBSKTStakingContractForTesting.sol" is present at line no 10

For testing:

```sh
npx hardhat test
```




# Advanced Sample Hardhat Project

This project demonstrates an advanced Hardhat use case, integrating other tools commonly used alongside Hardhat in the ecosystem.

The project comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts. It also comes with a variety of other tools, preconfigured to work with the project code.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
npx hardhat help
REPORT_GAS=true npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.js
node scripts/deploy.js
npx eslint '**/*.js'
npx eslint '**/*.js' --fix
npx prettier '**/*.{json,sol,md}' --check
npx prettier '**/*.{json,sol,md}' --write
npx solhint 'contracts/**/*.sol'
npx solhint 'contracts/**/*.sol' --fix
```

# Etherscan verification

To try out Etherscan verification, you first need to deploy a contract to an Ethereum network that's supported by Etherscan, such as Ropsten.

In this project, copy the .env.example file to a file named .env, and then edit it to fill in the details. Enter your Etherscan API key, your Ropsten node URL (eg from Alchemy), and the private key of the account which will send the deployment transaction. With a valid .env file in place, first deploy your contract:

```shell
hardhat run --network ropsten scripts/deploy.js
```

Then, copy the deployment address and paste it in to replace `DEPLOYED_CONTRACT_ADDRESS` in this command:

```shell
npx hardhat verify --network ropsten DEPLOYED_CONTRACT_ADDRESS "Hello, Hardhat!"
```
