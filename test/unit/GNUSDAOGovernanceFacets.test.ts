import { debug } from 'debug';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import hre from 'hardhat';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { JsonRpcProvider } from 'ethers';
import { multichain } from 'hardhat-multichain';

// Type alias for provider compatibility
type ProviderType = JsonRpcProvider | any;
import { getInterfaceID } from '../../scripts/utils/helpers';
import {
	LocalDiamondDeployer,
	LocalDiamondDeployerConfig,
} from '../../scripts/setup/LocalDiamondDeployer';
import { Diamond, deleteDeployInfo } from 'diamonds';
import { GNUSDAODiamond } from '../../diamond-typechain-types';
import { loadDiamondContract } from '../../scripts/utils/loadDiamondArtifact';

describe('🧪 GNUSDAO Governance Facets Tests', async function () {
	const diamondName = 'GNUSDAODiamond';
	const log: debug.Debugger = debug(`Test:log:${diamondName}:GovernanceFacets`);
	this.timeout(0);

	const networkProviders = multichain.getProviders() || new Map<string, JsonRpcProvider>();

	if (process.argv.includes('test-multichain')) {
		const networkNames = process.argv[process.argv.indexOf('--chains') + 1].split(',');
		if (networkNames.includes('hardhat')) {
			networkProviders.set('hardhat', ethers.provider as any);
		}
	} else if (process.argv.includes('test') || process.argv.includes('coverage')) {
		networkProviders.set('hardhat', ethers.provider as any);
	}

	for (const [networkName, provider] of networkProviders.entries()) {
		describe(`🔗 Chain: ${networkName} - GNUSDAO Governance Facets`, function () {
			let diamond: Diamond;
			let signers: SignerWithAddress[];
			let signer0: string;
			let owner: string;
			let ownerSigner: SignerWithAddress;
			let geniusDiamond: GNUSDAODiamond;
			let ownerDiamond: GNUSDAODiamond;
			let user1: SignerWithAddress;
			let user2: SignerWithAddress;

			let ethersMultichain: typeof ethers;
			let snapshotId: string;

			before(async function () {
				const config = {
					diamondName: diamondName,
					networkName: networkName,
					provider: provider,
					chainId: (await provider.getNetwork()).chainId,
					writeDeployedDiamondData: false,
					configFilePath: `diamonds/GNUSDAODiamond/gnusdaodiamond.config.json`,
				} as LocalDiamondDeployerConfig;
				const diamondDeployer = await LocalDiamondDeployer.getInstance(config);
				await diamondDeployer.setVerbose(true);
				diamond = await diamondDeployer.getDiamondDeployed();
				const deployedDiamondData = diamond.getDeployedDiamondData();

				let geniusDiamondContract: GNUSDAODiamond;
				
				// Load the Diamond contract using the utility function
				geniusDiamondContract = await loadDiamondContract<GNUSDAODiamond>(diamond, deployedDiamondData.DiamondAddress!);
				geniusDiamond = geniusDiamondContract;

				ethersMultichain = ethers;
				ethersMultichain.provider = provider as any;

				// Retrieve the signers for the chain
				signers = await ethersMultichain.getSigners();
				signer0 = signers[0].address;
				user1 = signers[1];
				user2 = signers[2];

				// get the signer for the owner
				owner = diamond.getDeployedDiamondData().DeployerAddress!;
				if (!owner) {
					diamond.setSigner(signers[0]);
					owner = signer0;
				}
				ownerSigner = await ethersMultichain.getSigner(owner);

				ownerDiamond = geniusDiamond.connect(ownerSigner);
			});

			beforeEach(async function () {
				snapshotId = await provider.send('evm_snapshot', []);
			});

			afterEach(async () => {
				await provider.send('evm_revert', [snapshotId]);
			});

			describe('🪙 Governance Token Facet', function () {
				it('should initialize governance token correctly', async function () {
					await ownerDiamond.initializeGovernanceToken(
						"GNUSDAO Governance Token",
						"GDAO",
						owner
					);

					expect(await geniusDiamond.name()).to.equal("GNUSDAO Governance Token");
					expect(await geniusDiamond.symbol()).to.equal("GDAO");
					expect(await geniusDiamond.owner()).to.equal(owner);
				});

				it('should mint tokens to owner during initialization', async function () {
					await ownerDiamond.initializeGovernanceToken(
						"GNUSDAO Governance Token",
						"GDAO",
						owner
					);

					const balance = await geniusDiamond.balanceOf(owner);
					const expectedInitialSupply = await geniusDiamond.getInitialSupply();
					expect(balance).to.equal(expectedInitialSupply);
				});

				it('should allow owner to add minters', async function () {
					await ownerDiamond.initializeGovernanceToken(
						"GNUSDAO Governance Token",
						"GDAO",
						owner
					);

					await ownerDiamond.addMinter(user1.address);
					expect(await geniusDiamond.isMinter(user1.address)).to.be.true;
				});

				it('should allow minters to mint tokens', async function () {
					await ownerDiamond.initializeGovernanceToken(
						"GNUSDAO Governance Token",
						"GDAO",
						owner
					);

					await ownerDiamond.addMinter(user1.address);
					const user1Diamond = geniusDiamond.connect(user1);
					
					const mintAmount = ethers.parseEther("1000");
					await user1Diamond.mint(user2.address, mintAmount);
					
					expect(await geniusDiamond.balanceOf(user2.address)).to.equal(mintAmount);
				});

				it('should allow token burning', async function () {
					await ownerDiamond.initializeGovernanceToken(
						"GNUSDAO Governance Token",
						"GDAO",
						owner
					);

					const initialBalance = await geniusDiamond.balanceOf(owner);
					const burnAmount = ethers.parseEther("100");
					
					await ownerDiamond.burn(burnAmount);
					
					const finalBalance = await geniusDiamond.balanceOf(owner);
					expect(finalBalance).to.equal(initialBalance - burnAmount);
				});

				it('should return correct voting power', async function () {
					await ownerDiamond.initializeGovernanceToken(
						"GNUSDAO Governance Token",
						"GDAO",
						owner
					);

					const balance = await geniusDiamond.balanceOf(owner);
					const votingPower = await geniusDiamond.getVotingPower(owner);
					expect(votingPower).to.equal(balance);
				});
			});

			describe('🗳️ Governance Facet', function () {
				beforeEach(async function () {
					// Initialize governance token first
					await ownerDiamond.initializeGovernanceToken(
						"GNUSDAO Governance Token",
						"GDAO",
						owner
					);
					
					// Initialize governance
					await ownerDiamond.initializeGovernance(owner);
				});

				it('should initialize governance correctly', async function () {
					const config = await geniusDiamond.getVotingConfig();
					expect(config.proposalThreshold).to.equal(ethers.parseEther("1000"));
					expect(config.quorumThreshold).to.equal(ethers.parseEther("100000"));
				});

				it('should allow creating proposals', async function () {
					// First, give user1 enough tokens to create a proposal
					await ownerDiamond.addMinter(owner);
					await ownerDiamond.mint(user1.address, ethers.parseEther("2000"));
					
					const user1Diamond = geniusDiamond.connect(user1);
					
					const proposalId = await user1Diamond.propose.staticCall(
						"Test Proposal",
						"QmTestIPFSHash"
					);
					
					await user1Diamond.propose("Test Proposal", "QmTestIPFSHash");
					
					const proposalBasic = await geniusDiamond.getProposalBasic(proposalId);
					expect(proposalBasic.title).to.equal("Test Proposal");
					expect(proposalBasic.proposer).to.equal(user1.address);
				});

				it('should track proposal count', async function () {
					expect(await geniusDiamond.getProposalCount()).to.equal(0);
					
					// Give user1 enough tokens to create a proposal
					await ownerDiamond.addMinter(owner);
					await ownerDiamond.mint(user1.address, ethers.parseEther("2000"));
					
					const user1Diamond = geniusDiamond.connect(user1);
					await user1Diamond.propose("Test Proposal", "QmTestIPFSHash");
					
					expect(await geniusDiamond.getProposalCount()).to.equal(1);
				});

				it('should allow treasury deposits', async function () {
					const depositAmount = ethers.parseEther("1");
					
					await ownerDiamond.depositToTreasury({ value: depositAmount });
					
					const treasuryBalance = await geniusDiamond.getTreasuryBalance();
					expect(treasuryBalance).to.equal(depositAmount);
				});
			});

			describe('🔢 Voting Mechanisms Facet', function () {
				it('should calculate quadratic cost correctly', async function () {
					const votes = 10;
					const expectedCost = votes * votes; // 100
					
					const cost = await geniusDiamond.calculateQuadraticCost(votes);
					expect(cost).to.equal(expectedCost);
				});

				it('should calculate maximum votes for token balance', async function () {
					const tokenBalance = 100;
					const maxVotes = await geniusDiamond.calculateMaxVotes(tokenBalance);
					
					// sqrt(100) = 10
					expect(maxVotes).to.equal(10);
				});

				it('should calculate vote weight correctly', async function () {
					const tokensCost = 100;
					const weight = await geniusDiamond.calculateVoteWeight(tokensCost);
					
					// sqrt(100) = 10
					expect(weight).to.equal(10);
				});

				it('should validate vote parameters', async function () {
					const votes = 5;
					const maxVotesPerWallet = 10;
					const tokenBalance = 100;
					
					const [valid, cost] = await geniusDiamond.validateVote(
						votes,
						maxVotesPerWallet,
						tokenBalance
					);
					
					expect(valid).to.be.true;
					expect(cost).to.equal(25); // 5² = 25
				});

				it('should calculate optimal votes', async function () {
					const tokenBudget = 100;
					const maxVotesPerWallet = 20;
					
					const [optimalVotes, remainingTokens] = await geniusDiamond.calculateOptimalVotes(
						tokenBudget,
						maxVotesPerWallet
					);
					
					expect(optimalVotes).to.equal(10); // sqrt(100) = 10
					expect(remainingTokens).to.equal(0); // 100 - 10² = 0
				});

				it('should calculate participation rate', async function () {
					const voters = 50;
					const eligibleVoters = 100;
					
					const rate = await geniusDiamond.calculateParticipationRate(voters, eligibleVoters);
					expect(rate).to.equal(50); // 50%
				});

				it('should check quorum correctly', async function () {
					const totalVotes = 1000;
					const quorumThreshold = 500;
					
					const meetsQuorum = await geniusDiamond.checkQuorum(totalVotes, quorumThreshold);
					expect(meetsQuorum).to.be.true;
				});
			});
		});
	}
});
