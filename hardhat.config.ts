import * as dotenv from 'dotenv';

import { HardhatUserConfig, task } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
// import 'hardhat-diamond-abi'; // Disabled - using custom diamond ABI generator
import 'hardhat-abi-exporter';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'solidity-coverage';
import '@nomicfoundation/hardhat-web3-v4';
import 'hardhat-multichain';
import 'hardhat-diamonds';

dotenv.config();

/*
 * Destructuring environment variables required for the configuration.
 * These variables are fetched from the `.env` file to avoid hardcoding sensitive data.
 * - HH_CHAIN_ID: Custom chain ID for the Hardhat network (default is 31337 if not set).
 * - DEPLOYER_PRIVATE_KEY: Private key of the deployer account.
 * - ETHEREUM_RPC: RPC URL for the Ethereum network.
 * - SEPOLIA_RPC: RPC URL for the Sepolia network.
 * - POLYGON_RPC: RPC URL for the Polygon network.
 * - AMOY_RPC: RPC URL for the Amoy network.
 * - ETH_BLOCK: Block number for the Ethereum network.
 * - POLY_BLOCK: Block number for the Polygon network.
 * - AMOY_BLOCK: Block number for the Amoy network.
 * - SEPOLIA_BLOCK: Block number for the Sepolia network.
 */
const {
	HH_CHAIN_ID,
	MAINNET_RPC,
	MAINNET_BLOCK,
	SEPOLIA_RPC,
	SEPOLIA_BLOCK,
	POLYGON_RPC,
	POLYGON_BLOCK,
	POLYGON_AMOY_RPC,
	POLYGON_AMOY_BLOCK,
  ARBITRUM_RPC,
  ARBITRUM_BLOCK,
  ARBITRUM_SEPOLIA_RPC,
  ARBITRUM_SEPOLIA_BLOCK,
	BASE_RPC,
	BASE_BLOCK,
	BASE_SEPOLIA_RPC,
	BASE_SEPOLIA_BLOCK,
	BSC_RPC,
	BSC_BLOCK,
	BSC_TESTNET_RPC,
	BSC_TESTNET_BLOCK,
  TEST_PRIVATE_KEY,
} = process.env;

// default blank RPC URLs will return an error. Must be configured in the .env file.
// default block values as well so missing environment variables set default to latest block.
export const mainnetUrl: string = MAINNET_RPC || ''; // Ethereum RPC URL
export const polygonUrl: string = POLYGON_RPC || ''; // Polygon RPC URL
export const polygonAmoyUrl: string = POLYGON_AMOY_RPC || ''; // Amoy RPC URL
export const sepoliaUrl: string = SEPOLIA_RPC || ''; // Sepolia RPC URL
export const sepoliaBlock: number = parseInt(SEPOLIA_BLOCK || '0'); // Sepolia block number
export const arbitrumUrl: string = ARBITRUM_RPC || ''; // Arbitrum RPC URL
export const arbitrumBlock: number = parseInt(ARBITRUM_BLOCK || '0'); // Arbitrum block number
export const arbitrumSepoliaUrl: string = ARBITRUM_SEPOLIA_RPC || ''; // Arbitrum Sepolia RPC URL
export const arbitrumSepoliaBlock: number = parseInt(ARBITRUM_SEPOLIA_BLOCK || '0'); // Arbitrum Sepolia block number
export const baseUrl: string = BASE_RPC || ''; // Base RPC URL
export const mainnetBlock: number = parseInt(MAINNET_BLOCK || '0'); // Ethereum block number
export const polygonBlock: number = parseInt(POLYGON_BLOCK || '0'); // Polygon block number
export const amoyBlock: number = parseInt(POLYGON_AMOY_BLOCK || '0'); // Amoy block number
export const baseBlock: number = parseInt(BASE_BLOCK || '0'); // Base block number
export const baseSepoliaUrl: string = BASE_SEPOLIA_RPC || ''; // Base Sepolia RPC URL
export const baseSepoliaBlock: number = parseInt(BASE_SEPOLIA_BLOCK || '0'); // Base Sepolia block number
export const bscUrl: string = BSC_RPC || ''; // BSC RPC URL
export const bscBlock: number = parseInt(BSC_BLOCK || '0'); // BSC block number
export const bscTestnetUrl: string = BSC_TESTNET_RPC || ''; // BSC Testnet RPC URL
export const bscTestnetBlock: number = parseInt(BSC_TESTNET_BLOCK || '0'); // BSC Testnet block number

let multichainTestHardhat = '';
// If this is a test-multichain task then we need to parse the --chains argument to get the chain names
if (process.argv.includes('test-multichain') && process.argv.includes('--chains')) {
	const chains = process.argv[process.argv.indexOf('--chains') + 1].split(',');
	if (chains.includes('hardhat') || chains.includes('localhost') || !chains) {
		multichainTestHardhat = 'http://localhost:8545';
	}
}
if (process.argv.includes('coverage')) {
	multichainTestHardhat = 'http://localhost:8555';
}
export const multichainHardhat = multichainTestHardhat;

// Task to print the list of accounts
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
	// Retrieve the list of accounts
	const accounts = await hre.ethers.getSigners();
	for (const account of accounts) {
		console.log(account.address);
	}
});

const elementSeenSet = new Set<string>();
// filter out duplicate function signatures
function genSignature(name: string, inputs: Array<unknown>, type: string): string {
	return `${type} ${name}(${inputs.reduce((previous: string, key) => {
		const comma = previous.length ? ',' : '';
		return previous + comma + (key as { internalType: string }).internalType;
	}, '')})`;
}

// function filterDuplicateFunctions(
// 	abiElement: { type: string; name?: string; inputs?: Array<{ internalType: string }> },
// 	index: number,
// 	fullAbiL: Array<{
// 		type: string;
// 		name?: string;
// 		inputs?: Array<{ internalType: string }>;
// 	}>,
// 	fullyQualifiedName: string,
// ) {
// 	if (['function', 'event'].includes(abiElement.type)) {
// 		const funcSignature = genSignature(
// 			abiElement.name || '',
// 			abiElement.inputs || [],
// 			abiElement.type,
// 		);
// 		if (elementSeenSet.has(funcSignature)) {
// 			return false;
// 		}
// 		elementSeenSet.add(funcSignature);
// 	} else if (abiElement.type === 'fallback') {
// 		if (!fullyQualifiedName.match('GNUSDAODiamond.sol')) {
// 			return false;
// 		}
// 	}
// 	return true;
// }

const MOCK_CHAIN_ID = HH_CHAIN_ID ? parseInt(HH_CHAIN_ID) : 31337;
// console.log(`Using chain ID: ${MOCK_CHAIN_ID}`);

const config: HardhatUserConfig = {
	typechain: {
		outDir: 'typechain-types', // Ensure this matches your expected output folder
		target: 'ethers-v6', // Match the version of Ethers.js you're using
	},
	solidity: {
		version: '0.8.9',
		settings: {
			optimizer: {
				enabled: true,
				runs: 1000,
			},
		},
	},
	chainManager: {  // Multichain configuration
		chains: {
			mainnet: {
				rpcUrl: mainnetUrl,
				blockNumber: mainnetBlock,
			},
			polygon: {
				rpcUrl: polygonUrl,
				blockNumber: polygonBlock,
			},
			sepolia: {
				rpcUrl: sepoliaUrl,
				// blockNumber: sepoliaBlock,
				chainId: 11155111,
			},
			polygon_amoy: {
				rpcUrl: polygonAmoyUrl,
				blockNumber: amoyBlock,
				chainId: 80002,
			},
			hardhat: {
				rpcUrl: multichainHardhat,
			},
      arbitrum: {
        rpcUrl: arbitrumUrl,
        blockNumber: arbitrumBlock,
      },
      arbitrum_sepolia: {
        rpcUrl: arbitrumSepoliaUrl,
        blockNumber: arbitrumSepoliaBlock,
      },
			base: {
				rpcUrl: baseUrl,
				blockNumber: baseBlock,
			},
			base_sepolia: {
				rpcUrl: baseSepoliaUrl,
				blockNumber: baseSepoliaBlock,
			},
			bsc: {
				rpcUrl: bscUrl,
				blockNumber: bscBlock,
			},
			bsc_testnet: {
				rpcUrl: bscTestnetUrl,
				blockNumber: bscTestnetBlock,
			},
		},
	},
	networks: {
		hardhat: {
			forking: process.env.FORK_URL
				? {
						url: process.env.FORK_URL,
						blockNumber: process.env.FORK_BLOCK_NUMBER
							? parseInt(process.env.FORK_BLOCK_NUMBER)
							: undefined,
					}
				: undefined,
        /* hardhat-multichain config  */
        chainId: MOCK_CHAIN_ID, // Sets the chain ID for the Hardhat network
        // Chains without Hardhat built in definitions
        chains: {     
				80002: {
					hardforkHistory: {
						london: 10000000,
					},
				},
				137: {
					hardforkHistory: {
						london: 10000000,
					},
				},
				// BNB (BSC) chain
				56: {
					hardforkHistory: {
						london: 10000000,
					},
				},
				// BNB Smart Chain Testnet chain
				97: {
					hardforkHistory: {
						london: 100000000,
					},
				},
				// Base chain
				8453: {
					hardforkHistory: {
						london: 10000000,
					},
				},
				// Base Testnet chain
				84532: {
					hardforkHistory: {
						london: 10000000,
					},
				},
			},
		},
		polygon: {
			url: polygonUrl,
			chainId: 137,
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
		},
		sepolia: {
			url: sepoliaUrl,
			chainId: 11155111,
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
			timeout: 100000,
		},
    arbitrum: {
      url: arbitrumUrl,
      chainId: 42161,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    arbitrum_sepolia: {
      url: arbitrumSepoliaUrl,
      chainId: 421614,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
		base_sepolia: {
			url: baseSepoliaUrl,
			chainId: 84532,
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
		},
		bsc_testnet: {
			url: bscTestnetUrl,
			chainId: 97,
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
		},
		polygon_amoy: {
			url: polygonAmoyUrl,
			chainId: 80002,
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
		},
		local: {
			url: `http://127.0.0.1:8545`,
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
		},
		mainnet: {
			url: mainnetUrl,
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
		},
		bsc: {
			url: bscUrl,
			chainId: 56,
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
		},
		base: {
			url: baseUrl,
			chainId: 8453,
			accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
		},
	},
	gasReporter: {
		enabled: process.env.REPORT_GAS !== undefined,
		currency: 'USD',
	},
	etherscan: {
		apiKey: {
			polygonMumbai:
				process.env.POLYGONSCAN_API_KEY !== undefined
					? process.env.POLYGONSCAN_API_KEY
					: '',
			polygon:
				process.env.POLYGONSCAN_API_KEY !== undefined
					? process.env.POLYGONSCAN_API_KEY
					: '',
			polygon_amoy:
				process.env.POLYGONSCAN_API_KEY !== undefined
					? process.env.POLYGONSCAN_API_KEY
					: '',
			sepolia: process.env.ETHERSCAN_API_KEY || '',
			mainnet: process.env.ETHERSCAN_API_KEY || '',
			bsc: process.env.BSCSCAN_API_KEY || '',
			bsc_testnet: process.env.BSCSCAN_API_KEY || '',
			arbitrum_sepolia: process.env.ARBITRUM_API_KEY || '',
			base_sepolia: process.env.BASESCAN_API_KEY || '',
			base: process.env.BASESCAN_API_KEY || '',
		},
		customChains: [
			// additional etherscan config
			{
				network: 'arbitrum_sepolia',
				chainId: 421614,
				urls: {
					apiURL: 'https://api-sepolia.arbiscan.io/api',
					browserURL: 'https://sepolia.arbiscan.io/',
				},
			},
			{
				network: 'base_sepolia',
				chainId: 84532,
				urls: {
					apiURL: 'https://api-sepolia.basescan.org/api',
					browserURL: 'https://sepolia.basescan.org/',
				},
			},
			{
				network: 'bsc_testnet',
				chainId: 97,
				urls: {
					apiURL: 'https://api-testnet.bscscan.com/api',
					browserURL: 'https://testnet.bscscan.com',
				},
			},
			{
				network: 'base',
				chainId: 8453,
				urls: {
					apiURL: 'https://api.basescan.org/api',
					browserURL: 'https://basescan.org',
				},
			},
			{
				network: 'polygon_amoy',
				chainId: 80002,
				urls: {
					apiURL: 'https://api-amoy.polygonscan.com/api',
					browserURL: 'https://amoy.polygonscan.com/',
				},
			},
		],
	},
	abiExporter: {
		flat: true,
		spacing: 2,
		pretty: true,
	},
	diamonds: {
		paths: {
			GNUSDAODiamond: {
				deploymentsPath: 'diamonds',
        // It is recommended but not required to create a separate contracts repo and 
        // include it as a git submodule.
				contractsPath: 'contracts/gnus-dao',
			},
		},
	},
};

export default config;
