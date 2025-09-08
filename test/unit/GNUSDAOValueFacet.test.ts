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

describe('🧪 GNUSDAOValueFacet Tests', async function () {
	const diamondName = 'GNUSDAODiamond';
	const log: debug.Debugger = debug(`Test:log:${diamondName}:ValueFacet`);
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
		describe(`🔗 Chain: ${networkName} - GNUSDAOValueFacet`, function () {
			let diamond: Diamond;
			let signers: SignerWithAddress[];
			let signer0: string;
			let owner: string;
			let ownerSigner: SignerWithAddress;
			let geniusDiamond: GNUSDAODiamond;
			let ownerDiamond: GNUSDAODiamond;

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

			it(`should return the correct string value from getValue()`, async function () {
				const result = await geniusDiamond.getValue();
				expect(result).to.equal("Hello from GNUSDAO Value Facet!");
			});

			it(`should return the correct numeric value from getNumericValue()`, async function () {
				const result = await geniusDiamond.getNumericValue();
				expect(result).to.equal(42);
			});

			it(`should return the correct token name from getTokenName()`, async function () {
				const result = await geniusDiamond.getTokenName();
				expect(result).to.equal("GNUSDAO Tokens");
			});

			it(`should return the correct token symbol from getTokenSymbol()`, async function () {
				const result = await geniusDiamond.getTokenSymbol();
				expect(result).to.equal("GDAO");
			});

			it(`should return the correct max supply from getMaxSupply()`, async function () {
				const result = await geniusDiamond.getMaxSupply();
				// 50 million tokens with 18 decimals
				const expectedMaxSupply = BigInt("50000000000000000000000000");
				expect(result).to.equal(expectedMaxSupply);
			});

			it(`should have all ValueFacet functions available through diamond`, async function () {
				// Test that all functions are accessible through the diamond proxy
				expect(geniusDiamond.getValue).to.not.be.undefined;
				expect(geniusDiamond.getNumericValue).to.not.be.undefined;
				expect(geniusDiamond.getTokenName).to.not.be.undefined;
				expect(geniusDiamond.getTokenSymbol).to.not.be.undefined;
				expect(geniusDiamond.getMaxSupply).to.not.be.undefined;
			});
		});
	}
});
