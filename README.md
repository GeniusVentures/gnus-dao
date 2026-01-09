# 🗳️ GNUS DAO Monorepo

A comprehensive monorepo for the GNUS DAO ecosystem, containing both the smart contract infrastructure and the governance platform frontend. This project implements a modern, enterprise-grade decentralized autonomous organization (DAO) with upgradeable smart contracts and a full-featured web interface.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-FFDB1C.svg)](https://hardhat.org/)

## 📋 Table of Contents

- [Overview](#overview)
- [Repository Structure](#repository-structure)
- [Submodules](#submodules)
- [Quick Start](#quick-start)
- [Development Workflow](#development-workflow)
- [Architecture](#architecture)
- [Contributing](#contributing)
- [License](#license)

## 🌟 Overview

GNUS DAO is a decentralized autonomous organization platform that combines:

- **Smart Contract Infrastructure**: ERC-2535 Diamond Proxy contracts for upgradeable, modular DAO functionality
- **Governance Platform**: Modern Next.js 14 web application for proposal management and voting
- ~~**Multi-Chain Support**: Compatible with Ethereum, Base, Polygon, and SKALE networks~~
- **Quadratic Voting**: Advanced voting mechanisms for democratic decision-making
- **IPFS Integration**: Decentralized storage for proposal metadata

## 📁 Repository Structure

This is a monorepo containing two primary git submodules:

```
gnus-dao-project/
├── gnus-dao-diamond-deployer/    # Smart contract development and deployment
└── gnus-dao-website/              # Frontend governance platform
```

## 🔗 Submodules

### 1. GNUS DAO Diamond Deployer

**Location**: `gnus-dao-diamond-deployer/`  
**Repository**: [GeniusVentures/gnus-dao-diamond-deployer](https://github.com/GeniusVentures/gnus-dao-diamond-deployer)  
**Branch**: `develop`

A modular, upgradeable smart contract system built on the ERC-2535 Diamond Proxy Standard.

**Key Features**:
- 💎 Diamond Proxy Architecture (ERC-2535)
- 🔄 Seamless contract upgrades without address changes
- 🏗️ Modular facet-based design
- 🛡️ OpenZeppelin Defender integration
- 🧪 Comprehensive testing suite
- ⚡ TypeScript integration with auto-generated bindings
- 🌐 Multi-network deployment support

**Core Facets**:
- `DiamondCutFacet`: Upgrade management
- `DiamondLoupeFacet`: Contract inspection
- `GNUSDAOOwnershipFacet`: Ownership and access control
- `GNUSDAOAccessControlFacet`: Role-based permissions
- `GNUSDAOInitFacet`: Initialization logic

**Quick Commands**:
```bash
cd gnus-dao-diamond-deployer
yarn install
yarn compile           # Compile contracts
yarn test              # Run tests
yarn coverage          # Generate coverage report
```

[📖 Full Documentation](./gnus-dao-diamond-deployer/README.md)

---

### 2. GNUS DAO Website

**Location**: `gnus-dao-website/`  
**Repository**: [GeniusVentures/gnus-dao-website](https://github.com/GeniusVentures/gnus-dao-website)  
**Branch**: `develop`  
**Live Deployment**: [https://gnus-dao-web.pages.dev](https://gnus-dao-web.pages.dev)

A modern governance platform built with Next.js 14, featuring a complete user interface for DAO interactions.

**Key Features**:
- ✅ Proposal creation and management
- ✅ Voting system with For/Against/Abstain options
- ✅ Quadratic voting implementation
- ✅ Multi-chain wallet integration (WalletConnect v2)
- ✅ IPFS metadata storage via Pinata
- ✅ Real-time proposal status tracking
- ✅ Mobile-responsive design
- ✅ Dark/Light theme support

**Tech Stack**:
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: ethers.js, WalletConnect v2
- **Storage**: IPFS (Pinata)
- **Deployment**: Cloudflare Pages
- **Testing**: Jest, Playwright

**Quick Commands**:
```bash
cd gnus-dao-website
yarn install
yarn dev               # Start development server
yarn build:production  # Build for production
yarn test              # Run unit tests
yarn test:e2e          # Run E2E tests
```

[📖 Full Documentation](./gnus-dao-website/README.md)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: >= 20.0.0
- **Yarn**: Latest version (recommended)
- **Git**: For submodule management
- **Web3 Wallet**: MetaMask or WalletConnect-compatible wallet

### Initial Setup

1. **Clone the repository with submodules**:
   ```bash
   git clone --recurse-submodules https://github.com/GeniusVentures/gnus-dao.git
   cd gnus-dao-project
   ```

2. **Initialize submodules** (if already cloned):
   ```bash
   git submodule init
   git submodule update --remote
   ```

3. **Install dependencies for both projects**:
   ```bash
   # Install diamond deployer dependencies
   cd gnus-dao-diamond-deployer
   yarn install
   cd ..
   
   # Install website dependencies
   cd gnus-dao-website
   yarn install
   cd ..
   ```

4. **Configure environment variables**:
   ```bash
   # For smart contracts
   cd gnus-dao-diamond-deployer
   cp .env.example .env
   # Edit .env with your configuration
   
   # For website
   cd ../gnus-dao-website
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

## 🔧 Development Workflow

### Working with Submodules

#### Update all submodules to latest:
```bash
git submodule update --remote --merge
```

#### Pull latest changes:
```bash
git pull --recurse-submodules
```

#### Commit changes in submodules:
```bash
# Make changes in submodule
cd gnus-dao-website
git add .
git commit -m "Your commit message"
git push

# Update parent repo to reference new commit
cd ..
git add gnus-dao-website
git commit -m "Update website submodule"
git push
```

### Development Cycle

1. **Smart Contract Development**:
   ```bash
   cd gnus-dao-diamond-deployer
   
   # Write/modify contracts in contracts/gnus-dao/
   # Write tests in test/
   
   yarn compile           # Compile contracts
   yarn test              # Run tests
   yarn coverage          # Check coverage
   
   # Deploy to testnet
   npx ts-node scripts/deploy/rpc/deploy-rpc.ts GNUSDAODiamond sepolia
   ```

2. **Frontend Development**:
   ```bash
   cd gnus-dao-website
   
   # Start development server
   yarn dev
   
   # Make changes to src/ and components/
   
   # Run tests
   yarn test
   yarn test:e2e
   
   # Build for production
   yarn build:production
   ```

3. **Integration Testing**:
   - Deploy contracts to testnet
   - Update contract address in website `.env.local`
   - Test complete user flows in website
   - Verify on-chain interactions

### Testing Strategy

- **Smart Contracts**: Unit tests with Hardhat/Foundry
- **Frontend**: Jest for unit tests, Playwright for E2E
- **Integration**: Manual testing on testnets
- **Security**: Slither, Mythril for contract analysis

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────┐
│                   User Interface                    │
│              (Next.js 14 Website)                   │
└────────────────┬────────────────────────────────────┘
                 │
                 │ Web3 Provider (ethers.js)
                 │
┌────────────────▼────────────────────────────────────┐
│              Diamond Proxy Contract                 │
│               (ERC-2535)                           │
├─────────────────────────────────────────────────────┤
│  Facets:                                            │
│  - Ownership                                        │
│  - Access Control                                   │
│  - Governance                                       │
│  - Proposals                                        │
│  - Voting                                           │
│  - Treasury                                         │
└─────────────────────────────────────────────────────┘
                 │
                 │ Events & State
                 │
┌────────────────▼────────────────────────────────────┐
│              Blockchain Network                     │
│     (Ethereum, Polygon, Base, SKALE)               │
└─────────────────────────────────────────────────────┘
```

### Technology Stack

**Smart Contracts**:
- Solidity ^0.8.27
- Hardhat + Foundry
- OpenZeppelin Contracts
- ERC-2535 Diamond Standard

**Frontend**:
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- ethers.js v6
- WalletConnect v2

**Infrastructure**:
- IPFS (Pinata) for metadata
- Cloudflare Pages for hosting
- GitHub Actions for CI/CD
- OpenZeppelin Defender for production deployments

## 🤝 Contributing

We welcome contributions to the GNUS DAO ecosystem!

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** in the appropriate submodule
4. **Run tests**: Ensure all tests pass
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to the branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Maintain test coverage above 80%
- Use conventional commit messages
- Update documentation for new features
- Ensure contracts pass security audits

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Links

- **Website**: [https://gnus-dao-web.pages.dev](https://gnus-dao-web.pages.dev)
- **Documentation**: See individual submodule READMEs
- **Discord**: [Join our community](#)
- **Twitter**: [@GNUSDAO](#)

## 📞 Support

For support, please:
- Open an issue in the appropriate repository
- Join our Telegram community
- Check the documentation in each submodule

---
