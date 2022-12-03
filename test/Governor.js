const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");
const { loadFixture } = waffle;
const { BigNumber } = ethers;
const { mint } = require("./utils/ERC721");
const { deploy } = require("./utils/contracts");
const { mintCoin } = require("./utils/ERC20");
const { getPairName, getCards } = require("./utils/PairMatching");
const { generateSolidity } = require('abi-to-sol/dist/src');
const BSKTContract = require("../artifacts/contracts/BSKTStakingContract.sol/BsktStakingPool.json");
const ZERO = ethers.utils.parseUnits("0", 18);

describe("BasketCoin Governance", async function () {

    // Pre-Config of NFTs, Tokens and Signers
    const fixture = async function () {
        try {
            const signers = await ethers.getSigners();
            const mockERC721 = await deploy("BasketCoinNFT", signers[0]);
            const mockBasketCoin = await deploy("BasketCoin", signers[0]);
            const mockStakedCoin = await deploy("StakedCoin", signers[0]);
            const VotingPowerStore = await deploy("VotingPower", signers[0]);
            const BSKTStakingPool = await deploy("BsktStakingPool", signers[0], [mockBasketCoin.address]);
            // const fileContent = generateSolidity({ abi: BSKTContract.abi, solidityVersion:'0.5.17' });
            // console.log(fileContent)
            const Governor = await deploy("Governor", signers[0], [
                mockBasketCoin.address, 
                BSKTStakingPool.address,
                mockERC721.address,
                VotingPowerStore.address,
                
            ])
            
            // Mint NFTs and tokens for testing
            const uris = [
                "https://bafkreigea2dsqdmmuum7l2umu5jzwtue7ub2rvpukhhjv5ajdys5nhqxzm.ipfs.nftstorage.link/",
                "https://bafkreicr5ee66tke6h64vl7ib3mqcxbkgr3ru3si3futfbwfnsjmilrdf4.ipfs.nftstorage.link/",
                "https://bafkreibvl7oivayoo5r7znqcdnljg35jkxjauinqeu7qr7ba6stxzh7vq4.ipfs.nftstorage.link/",
                "https://bafkreietbmgyygwv5ye7o3iea44w6ibuey5nsauc4rl4oilb6chrnxt2fy.ipfs.nftstorage.link/",
                "https://bafkreiarugt2ae3tzx4eu4dky6mwwp5yhfe25wmsvh2d7xa3ubfkdfg5pm.ipfs.nftstorage.link/",
                "https://bafkreiab6fqyqm5q7ksyalac2sknkv4utcna7hpuoo7edmmatzspl6hosm.ipfs.nftstorage.link/",
            ];

            // User A
            await mint(mockERC721, signers[1], uris[0])
            await mint(mockERC721, signers[1], uris[1])
            await mint(mockERC721, signers[1], uris[2])
            await mint(mockERC721, signers[1], uris[3])
            await mint(mockERC721, signers[1], uris[4])
            await mintCoin(mockBasketCoin, signers[1], 10000)
            await mintCoin(mockStakedCoin, signers[1], 5000)

            await mockBasketCoin.connect(signers[1]).approve(BSKTStakingPool.address, 6000)
            
            // Stake tokens in Pool UserA
            await BSKTStakingPool.connect(signers[1]).stake(6000, mockBasketCoin.address)
            await BSKTStakingPool.connect(signers[1]).balanceOf(signers[1].getAddress())
            // User B
            await mint(mockERC721, signers[2], uris[5])
            await mint(mockERC721, signers[2], uris[5])
            await mintCoin(mockBasketCoin, signers[2], 1000)
            await mintCoin(mockStakedCoin, signers[2], 100)

            // User C
            await mint(mockERC721, signers[3], uris[5])
            await mint(mockERC721, signers[3], uris[5])
            await mintCoin(mockBasketCoin, signers[3], 2000)
            await mintCoin(mockStakedCoin, signers[3], 100)

            // Polling Proposal from UserA
            const cardsListA = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            const pairNameA = getPairName(cardsListA);
            const cardsA = getCards(cardsListA);

            // Create Proposal and get ID
            const tx = await Governor.connect(signers[1]).createPollingProposal(
                "Do I need to eat a burger or sandwitch?",
                10, // voting period in seconds
                cardsA, // array of cards
                pairNameA
            );
            const receipt = await tx.wait();
            const pollingProposalId = receipt.events[0].args.proposalId;

            // Create Polling Proposal for execute testing
            const ExecutePollingtx = await Governor.connect(signers[1]).createPollingProposal(
                "Do I need to eat a burger or sandwitch?",
                1, // voting period in seconds
                cardsA, // array of cards
                pairNameA
            );
            const ExecutePollingReceipt = await ExecutePollingtx.wait();
            const ExecutePollingProposalId = ExecutePollingReceipt.events[0].args.proposalId;

            // Vote on execute testing proposal Id 
            // const cardsListA = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            const cardsListB = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            const cardsListC = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            

            // const pairNameA = getPairName(cardsListA);
            const pairNameB = getPairName(cardsListB);
            const pairNameC = getPairName(cardsListC);

            // const cardsA = getCards(cardsListA);
            const cardsB = getCards(cardsListB);
            const cardsC = getCards(cardsListC);
            /**
             * VoteType - 0 Against, 1 For, 2 Abstain
             */
            await expect(Governor.connect(signers[1]).castPollingVote(
                ExecutePollingProposalId, 
                1, // for
                "IDK", //reason
                cardsA,
                pairNameA
            )).to.emit(Governor, "PollingVoteCast");

            await expect(Governor.connect(signers[2]).castPollingVote(
                ExecutePollingProposalId, 
                1, // for
                "IDK", //reason
                cardsB,
                pairNameB
            )).to.emit(Governor, "PollingVoteCast");

            await expect(Governor.connect(signers[3]).castPollingVote(
                ExecutePollingProposalId, 
                1, // for
                "IDK", //reason
                cardsC,
                pairNameC
            )).to.emit(Governor, "PollingVoteCast");


            // Add Admin
            const adminTx = await Governor.connect(signers[0]).addAdmin(signers[1].address)
            const adminReceipt = await adminTx.wait();

            // Create Executive proposal
            const executiveTx = await Governor.connect(signers[1]).createExecutiveProposal(
                "Do I need to eat a burger or sandwitch?",
                10, // voting period in seconds
                cardsA, // array of cards
                pairNameA
            );
            const executivereceipt = await executiveTx.wait();
            const executiveProposalId = executivereceipt.events[0].args.proposalId;


            // Create Executive Proposal for execute testing
            const ExecuteExecutivetx = await Governor.connect(signers[1]).createExecutiveProposal(
                "Do I need to eat a burger or sandwitch?",
                1, // voting period in seconds
                cardsA, // array of cards
                pairNameA
            );
            const ExecuteExecutiveReceipt = await ExecuteExecutivetx.wait();
            const ExecuteExecutiveProposalId = ExecuteExecutiveReceipt.events[0].args.proposalId;

            // Vote on execute testing proposal Id 
            // const cardsListA = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            // const cardsListB = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            // const cardsListC = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            

            // const pairNameA = getPairName(cardsListA);
            // const pairNameB = getPairName(cardsListB);
            // const pairNameC = getPairName(cardsListC);

            // const cardsA = getCards(cardsListA);
            // const cardsB = getCards(cardsListB);
            // const cardsC = getCards(cardsListC);
            /**
             * VoteType - 0 Against, 1 For, 2 Abstain
             */
            await expect(Governor.connect(signers[1]).castExecutiveVote(
                ExecuteExecutiveProposalId, 
                1, // for
                "IDK", //reason
                cardsA,
                pairNameA
            )).to.emit(Governor, "ExecutiveVoteCast");

            await expect(Governor.connect(signers[2]).castExecutiveVote(
                ExecuteExecutiveProposalId, 
                1, // for
                "IDK", //reason
                cardsB,
                pairNameB
            )).to.emit(Governor, "ExecutiveVoteCast");

            await expect(Governor.connect(signers[3]).castExecutiveVote(
                ExecuteExecutiveProposalId, 
                1, // against
                "IDK", //reason
                cardsC,
                pairNameC
            )).to.emit(Governor, "ExecutiveVoteCast");

            const CancelPollingtx = await Governor.connect(signers[1]).createPollingProposal(
                "Do I need to eat a burger or sandwitch?",
                1, // voting period in seconds
                cardsA, // array of cards
                pairNameA
            );
            const CancelPollingReceipt = await CancelPollingtx.wait();
            const CancelPollingProposalId = CancelPollingReceipt.events[0].args.proposalId;

            const CancelExecutivetx = await Governor.connect(signers[1]).createExecutiveProposal(
                "Do I need to eat a burger or sandwitch?",
                1, // voting period in seconds
                cardsA, // array of cards
                pairNameA
            );
            const CancelExecutiveReceipt = await CancelExecutivetx.wait();
            const CancelExecutiveProposalId = CancelExecutiveReceipt.events[0].args.proposalId;

            return {
                mockERC721,
                userA: signers[1],  // 5nfts
                userB: signers[2],  // 2nfts
                userC: signers[3],  // 2nfts
                owner: signers[0],
                signers: signers.slice(3),
                mockBasketCoin: mockBasketCoin,
                mockStakedCoin: mockStakedCoin,
                Governor: Governor,
                VotingPowerStore: VotingPowerStore,
                pollingProposalId: pollingProposalId,
                executiveProposalId: executiveProposalId,
                ExecutePollingProposalId,
                ExecuteExecutiveProposalId,
                BSKTStakingPool,
                CancelPollingProposalId,
                CancelExecutiveProposalId
            };

        } catch(err) {
            console.log(err)
        }

    };

    describe("Governor", async function () {

        it("Create Polling Proposal", async function () {

            const { Governor, userA } = await loadFixture(fixture);

            const cardsList = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            await expect(getPairName(cardsList)).to.eqls("straightFlush")

            const pairName = getPairName(cardsList);
            const cards = getCards(cardsList);

            await expect(Governor.connect(userA).createPollingProposal(
                "Do I need to eat a burger or sandwitch?",
                60, // voting period in seconds
                cards, // array of cards
                pairName
            )).to.emit(Governor, "PollingProposalCreated");
        });

        it("Vote for Polling Proposal", async function () {

            const { Governor, userA, userB, userC, pollingProposalId } = await loadFixture(fixture);

            const cardsListA = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            const cardsListB = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            const cardsListC = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            

            const pairNameA = getPairName(cardsListA);
            const pairNameB = getPairName(cardsListB);
            const pairNameC = getPairName(cardsListC);

            const cardsA = getCards(cardsListA);
            const cardsB = getCards(cardsListB);
            const cardsC = getCards(cardsListC);

            /**
             * VoteType - 0 Against, 1 For, 2 Abstain
             */
            await expect(Governor.connect(userA).castPollingVote(
                pollingProposalId, 
                1, // for
                "IDK", //reason
                cardsA,
                pairNameA
            )).to.emit(Governor, "PollingVoteCast");

            await expect(Governor.connect(userB).castPollingVote(
                pollingProposalId, 
                1, // for
                "IDK", //reason
                cardsB,
                pairNameB
            )).to.emit(Governor, "PollingVoteCast");

            await expect(Governor.connect(userC).castPollingVote(
                pollingProposalId, 
                1, // for
                "IDK", //reason
                cardsC,
                pairNameC
            )).to.emit(Governor, "PollingVoteCast");

        });

        it("Get Status for Polling Proposal After Voting (Active State)", async function () {

            const { Governor, userA, userB, userC, pollingProposalId } = await loadFixture(fixture);

            const cardsListA = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            const cardsListB = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            const cardsListC = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            

            const pairNameA = getPairName(cardsListA);
            const pairNameB = getPairName(cardsListB);
            const pairNameC = getPairName(cardsListC);

            const cardsA = getCards(cardsListA);
            const cardsB = getCards(cardsListB);
            const cardsC = getCards(cardsListC);

            /**
             * VoteType - 0 Against, 1 For, 2 Abstain
             */
            await expect(Governor.connect(userA).castPollingVote(
                pollingProposalId, 
                1, // for
                "IDK", //reason
                cardsA,
                pairNameA
            )).to.emit(Governor, "PollingVoteCast");

            await expect(Governor.connect(userB).castPollingVote(
                pollingProposalId, 
                1, // for
                "IDK", //reason
                cardsB,
                pairNameB
            )).to.emit(Governor, "PollingVoteCast");

            await expect(Governor.connect(userC).castPollingVote(
                pollingProposalId, 
                1, // for
                "IDK", //reason
                cardsC,
                pairNameC
            )).to.emit(Governor, "PollingVoteCast");

            /**
             * ProposalState {
                  0  Pending,
                  1  Active,
                  2  Canceled,
                  3  Defeated,
                  4  Succeeded,
                  5  Queued,
                  6  Expired,
                  7  Executed
                }
             */
           
            await expect(await Governor.connect(userA).pollingProposalStatus(
                pollingProposalId, 
            )).equals(4) // Active state 
        
        });

        it("Add Admin", async function () {
            const { Governor, userA, owner } = await loadFixture(fixture);
            await expect(Governor.connect(owner).addAdmin(userA.address))
            // Necessary step while integration please record transactio hash
            // const tx = await Governor.connect(owner).addAdmin(userA.address);
            // await tx.wait()
        });

        it('Create Executive Proposal', async function () {
            const { Governor, userA } = await loadFixture(fixture);

            const cardsList = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            await expect(getPairName(cardsList)).to.eqls("straightFlush")

            const pairName = getPairName(cardsList);
            const cards = getCards(cardsList);

            await expect(Governor.connect(userA).createExecutiveProposal(
                "Do I need to eat a burger or sandwitch?",
                60, // voting period in seconds
                cards, // array of cards
                pairName
            )).to.emit(Governor, "ExecutiveProposalCreated");
        });

        it('Do not allow non admin users to create Executive proposal', async function () {
            const { Governor, userB } = await loadFixture(fixture);

            const cardsList = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            await expect(getPairName(cardsList)).to.eqls("straightFlush")

            const pairName = getPairName(cardsList);
            const cards = getCards(cardsList);

            await expect(Governor.connect(userB).createExecutiveProposal(
                "Do I need to eat a burger or sandwitch?",
                60, // voting period in seconds
                cards, // array of cards
                pairName
            )).to.be.revertedWith("Admin Access Required")
        });

        it("Vote for Executive proposal", async()=> {
            const { Governor, userA, userB, userC, executiveProposalId } = await loadFixture(fixture);

            const cardsListA = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            const cardsListB = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            const cardsListC = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            

            const pairNameA = getPairName(cardsListA);
            const pairNameB = getPairName(cardsListB);
            const pairNameC = getPairName(cardsListC);

            const cardsA = getCards(cardsListA);
            const cardsB = getCards(cardsListB);
            const cardsC = getCards(cardsListC);

            /**
             * VoteType - 0 Against, 1 For, 2 Abstain
             */
            await expect(Governor.connect(userA).castExecutiveVote(
                executiveProposalId, 
                1, // for
                "IDK", //reason
                cardsA,
                pairNameA
            )).to.emit(Governor, "ExecutiveVoteCast");

            await expect(Governor.connect(userB).castExecutiveVote(
                executiveProposalId, 
                1, // for
                "IDK", //reason
                cardsB,
                pairNameB
            )).to.emit(Governor, "ExecutiveVoteCast");

            await expect(Governor.connect(userC).castExecutiveVote(
                executiveProposalId, 
                0, // Against
                "IDK", //reason
                cardsC,
                pairNameC
            )).to.emit(Governor, "ExecutiveVoteCast");
        });

        it("Get Status for Executive Proposal After Voting (Active State)", async function () {

            const { Governor, userA, userB, userC, executiveProposalId } = await loadFixture(fixture);

            const cardsListA = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            const cardsListB = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            const cardsListC = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            

            const pairNameA = getPairName(cardsListA);
            const pairNameB = getPairName(cardsListB);
            const pairNameC = getPairName(cardsListC);

            const cardsA = getCards(cardsListA);
            const cardsB = getCards(cardsListB);
            const cardsC = getCards(cardsListC);

            /**
             * VoteType - 0 Against, 1 For, 2 Abstain
             */
            await expect(Governor.connect(userA).castExecutiveVote(
                executiveProposalId, 
                1, // for
                "IDK", //reason
                cardsA,
                pairNameA
            )).to.emit(Governor, "ExecutiveVoteCast");

            await expect(Governor.connect(userB).castExecutiveVote(
                executiveProposalId, 
                1, // for
                "IDK", //reason
                cardsB,
                pairNameB
            )).to.emit(Governor, "ExecutiveVoteCast");

            await expect(Governor.connect(userC).castExecutiveVote(
                executiveProposalId, 
                1, // for
                "IDK", //reason
                cardsC,
                pairNameC
            )).to.emit(Governor, "ExecutiveVoteCast");

            /**
             * ProposalState {
                  0  Pending,
                  1  Active,
                  2  Canceled,
                  3  Defeated,
                  4  Succeeded,
                  5  Queued,
                  6  Expired,
                  7  Executed
                }
             */
           
            await expect(await Governor.connect(userA).executiveProposalStatus(
                executiveProposalId, 
            )).equals(1) // Active state 
        
        });

        it("Remove Admin", async function () {
            const { Governor, userA, owner } = await loadFixture(fixture);
            await expect(Governor.connect(owner).removeAdmin(userA.address))
            // Necessary step while integration please record transactio hash
            // const tx = await Governor.connect(owner).removeAdmin(userA.address);
            // await tx.wait()
        });

        it("Update Quorum Denominator", async function () {
            const { Governor, owner } = await loadFixture(fixture);
            await expect(Governor.connect(owner).updateQuorumDenominator(5))
            // Necessary step while integration please record transactio hash
            // const tx = await Governor.connect(owner).updateQuorumDenominator(5))
            // await tx.wait()
        });

        it("Update Quorum Numerator", async function () {
            const { Governor, owner } = await loadFixture(fixture);
            await expect(Governor.connect(owner).updateQuorumNumerator(100))
            // Necessary step while integration please record transactio hash
            // const tx = await Governor.connect(owner).updateQuorumNumerator(100))
            // await tx.wait()
        });

        it("Should execute polling proposal", async function() {
            const { ExecutePollingProposalId, Governor, owner } = await loadFixture(fixture);
            await Governor.connect(owner).pollingProposalStatus(
                ExecutePollingProposalId, 
            )
            await expect(Governor.connect(owner).executePollingProposal(ExecutePollingProposalId)).to.emit(Governor, "PollingProposalExecuted").withArgs(ExecutePollingProposalId);
        });

        it("Should execute executive proposal", async function() {
            const { ExecuteExecutiveProposalId, Governor, owner } = await loadFixture(fixture);

            await expect(Governor.connect(owner).executeExecutiveProposal(ExecuteExecutiveProposalId)).to.emit(Governor, "ExecutiveProposalExecuted").withArgs(ExecuteExecutiveProposalId);
        });

        it("Should Prevent Duplicate votes on polling proposal", async function() {
            const { ExecutePollingProposalId, Governor, userA } = await loadFixture(fixture);
            const cardsListA = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            const pairNameA = getPairName(cardsListA);
            const cardsA = getCards(cardsListA);
            
            await expect(Governor.connect(userA).castPollingVote(
                ExecutePollingProposalId, 
                1, // for
                "IDK", //reason
                cardsA,
                pairNameA
            )).to.be.revertedWith("Governor: vote already cast")
        });

        it("Should Prevent Duplicate votes on executive proposal", async function() {
            const { ExecuteExecutiveProposalId, Governor, userA } = await loadFixture(fixture);
            const cardsListA = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            const pairNameA = getPairName(cardsListA);
            const cardsA = getCards(cardsListA);

            await expect(Governor.connect(userA).castExecutiveVote(
                ExecuteExecutiveProposalId, 
                1, // for
                "IDK", //reason
                cardsA,
                pairNameA
            )).to.be.revertedWith("Governor: vote already cast")
        });

        it("Should return if user is admin or not", async function() {
            const { Governor, userA, userB, owner } = await loadFixture(fixture);

            await expect(await Governor.connect(owner).addAdmin(userA.address))

            await expect(await Governor.connect(userA).isAdmin(userB.address)).to.be.equal(false);
            await expect(await Governor.connect(userA).isAdmin(userA.address)).to.be.equal(true);

        });

        it("Should check for voting status of user of polling proposal", async function() {
            const { Governor, userA, userB, ExecutePollingProposalId } = await loadFixture(fixture);
            await expect(await Governor.connect(userA).hasVotedOnPollingProposal(userB.address, ExecutePollingProposalId)).to.be.equals(true);
        });

        it("Should check for voting status of user of executive proposal", async function() {
            const { Governor, userA, userB, ExecuteExecutiveProposalId } = await loadFixture(fixture);
            await expect(await Governor.connect(userA).hasVotedOnExecutiveProposal(userA.address, ExecuteExecutiveProposalId)).to.be.equals(true);
        });

        it("Gets Voting power of user", async function() {
            const { Governor, userA, VotingPowerStore, owner } = await loadFixture(fixture);

            const cardsListA = ["2h", "3h", "4h", "5h", "6h"]; // to match straight flush
            const pairNameA = getPairName(cardsListA);
            const cardsA = getCards(cardsListA);

            await expect((await Governor.connect(userA).getVotingPowerOfUser(cardsA, pairNameA, userA.address)).toNumber()).to.be.equals(864280000);
            
            const Divisor = (await VotingPowerStore.connect(owner).getDivisor()).toNumber();
            
            await expect((await Governor.connect(userA).getVotingPowerOfUser(cardsA, pairNameA, userA.address)).toNumber() / Divisor).to.be.equals(864280000 / Divisor);

        });
        /***
             * @dev notice 
             * return values of proposalDetails have bigNumber please convert to Integer and use 
             * Vote start and end are timestamps use accordingly.
             * status is a enum please refer to ProposalState Object.
             * Please use divisor to divide the voting numbers like forVotes, abstain and against for accurate calculations
        */
        it("Should get polling proposal details", async function() {
            const { Governor, userA,  ExecutePollingProposalId, VotingPowerStore } = await loadFixture(fixture);
            const Divisor = (await VotingPowerStore.connect(userA).getDivisor()).toNumber();
            var proposalDetails = await Governor.connect(userA).getPollingProposaldetails(ExecutePollingProposalId);
            // console.log(proposalDetails);
            /**
             * ProposalState {
                  0  Pending,
                  1  Active,
                  2  Canceled,
                  3  Defeated,
                  4  Succeeded,
                  5  Queued,
                  6  Expired,
                  7  Executed
                }
             */
        });

        /***
             * @dev notice 
             * return values of proposalDetails have bigNumber please convert to Integer and use 
             * Vote start and end are timestamps use accordingly.
             * status is a enum please refer to ProposalState Object.
             * Please use divisor to divide the voting numbers like forVotes, abstain and against for accurate calculations
        */
         it("Should get executive proposal details", async function() {
            const { Governor, userA,  ExecuteExecutiveProposalId, VotingPowerStore } = await loadFixture(fixture);
            const Divisor = (await VotingPowerStore.connect(userA).getDivisor()).toNumber();
            var proposalDetails = await Governor.connect(userA).getExecutiveProposaldetails(ExecuteExecutiveProposalId);
            // console.log(proposalDetails);
            /**
             * ProposalState {
                  0  Pending,
                  1  Active,
                  2  Canceled,
                  3  Defeated,
                  4  Succeeded,
                  5  Queued,
                  6  Expired,
                  7  Executed
                }
             */
        });

        it("Should get polling proposals count", async function() {
            const { Governor, userA } = await loadFixture(fixture);
            await expect((await Governor.connect(userA).getPollingProposalCount()).toNumber()).greaterThanOrEqual(2)
        });

        it("Should get executive proposals count", async function() {
            const { Governor, userA } = await loadFixture(fixture);
            await expect((await Governor.connect(userA).getExecutiveProposalCount()).toNumber()).greaterThanOrEqual(2)
        });

        it("Should cancel polling proposal", async function() {
            const { Governor, owner, CancelPollingProposalId } = await loadFixture(fixture);
            await expect(await Governor.connect(owner).cancelPollingProposal(CancelPollingProposalId)).to.emit(Governor, "pollingProposalCanceled").withArgs(CancelPollingProposalId)
        });

        it("Should cancel polling proposal", async function() {
            const { Governor, owner, CancelExecutiveProposalId } = await loadFixture(fixture);
            await expect(await Governor.connect(owner).cancelExecutiveProposal(CancelExecutiveProposalId)).to.emit(Governor, "executiveProposalCanceled").withArgs(CancelExecutiveProposalId)

        });


    });

    describe("VotingPowerStore", async function () {
        it("Set Minimum voting power to create proposals (owner)", async function () {
            const { VotingPowerStore, owner } = await loadFixture(fixture);
            const tx = await VotingPowerStore.connect(owner).setMinimumVotingPower(6000)
            await expect(tx.wait())
            // Necessary step while integration please record transactio hash
            // const tx = await VotingPowerStore.connect(owner).setMinimumVotingPower(6000))
            // await tx.wait()
            await expect(await VotingPowerStore.connect(owner).getMinimumVotingPower()).to.be.equal(6000);

        });

        it("Should not be able to Set Minimum voting power to create proposals (non-owner)", async function () {
            const { VotingPowerStore, userA } = await loadFixture(fixture);
            await expect(VotingPowerStore.connect(userA).setMinimumVotingPower(6000)).to.be.revertedWith("Ownable: caller is not the owner")
            // Necessary step while integration please record transactio hash
            // const tx = await VotingPowerStore.connect(owner).setMinimumVotingPower(6000))
            // await tx.wait()
        });

        it("Get minimum Voting Power (non-owner)", async function () {
            const { VotingPowerStore, userA, owner } = await loadFixture(fixture);
            const tx = await VotingPowerStore.connect(owner).setMinimumVotingPower(6000)
            await expect(tx.wait())
            await expect(await VotingPowerStore.connect(userA).getMinimumVotingPower()).to.be.equal(6000);

            // Necessary step while integration please record transactio hash
            // const tx = await VotingPowerStore.connect(owner).setMinimumVotingPower(6000))
            // await tx.wait()
        });

        it("Set divisor for Multiplier (Owner)", async function () {
            const { VotingPowerStore, owner } = await loadFixture(fixture);
            const tx = await VotingPowerStore.connect(owner).setDivisor(1000)
            await expect(tx.wait())
            await expect(await VotingPowerStore.connect(owner).getDivisor()).to.be.equal(1000);

        });

        it("Get divisor for Multiplier (non Owner)", async function () {
            const { VotingPowerStore, userA } = await loadFixture(fixture);
        
            await expect(await VotingPowerStore.connect(userA).getDivisor()).to.be.equal(100);

        });

        it("Should not be able to set divisor for Multiplier (non Owner)", async function () {
            const { VotingPowerStore, userA } = await loadFixture(fixture);
            await expect(VotingPowerStore.connect(userA).setDivisor(100)).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Set Multiplier (owner)", async function () {
            const { VotingPowerStore, owner } = await loadFixture(fixture);
            const tx = await VotingPowerStore.connect(owner).setMultiplier("royalFlush",302)
            await expect(tx.wait());

            await expect(await VotingPowerStore.connect(owner).getMultiplier("royalFlush")).to.be.equals(302)
        });

        it("Get Multiplier (non owner)", async function () {
            const { VotingPowerStore, userA } = await loadFixture(fixture);
            
            await expect(await VotingPowerStore.connect(userA).getMultiplier("royalFlush")).to.be.equals(300)
        });

        it("Should not be able to set Multiplier (non owner)", async function () {
            const { VotingPowerStore, userA } = await loadFixture(fixture);
            
            await expect(VotingPowerStore.connect(userA).setMultiplier("royalFlush",302)).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Set Voting power for cards (owner)" , async function () {
            const { VotingPowerStore, owner } = await loadFixture(fixture);
            const divisor = await VotingPowerStore.connect(owner).getDivisor();
            const tx = await VotingPowerStore.connect(owner).setVotingPower("2", 7000 * divisor);
            await expect(await tx.wait());

            await expect(await VotingPowerStore.connect(owner).getVotingPower("2")).to.be.equals(7000 * divisor)
        });

        it("Get Voting power for cards (non owner)" , async function () {
            const { VotingPowerStore, userA } = await loadFixture(fixture);
            const divisor = await VotingPowerStore.connect(userA).getDivisor();

            await expect(await VotingPowerStore.connect(userA).getVotingPower("2")).to.be.equals(5000 * divisor)
        });

        it("Should not be able to set voting power for cards (non owner)" , async function () {
            const { VotingPowerStore, userA } = await loadFixture(fixture);

            await expect(VotingPowerStore.connect(userA).setVotingPower("2", 9000)).to.be.revertedWith("Ownable: caller is not the owner");
        });
    });
})