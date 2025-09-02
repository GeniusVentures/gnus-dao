# Smart Contract Projects: Git Workflow

## Repository Structure

```bash
main-project/                 (Node/TypeScript/Hardhat)
├── contracts/<contract-repo>   (Git submodule - Solidity contracts)
├── diamonds/<DiamondName>/     (Git submodule - Deployment records & config)
├── scripts/
├── tests/
├── package.json
├── tsconfig.json
└── hardhat.config.ts
```

## Branch Strategy

### Main Repositories (Parent + Both Submodules)

#### Core Branches

- **`main`** - Production-ready code, always deployable
- **`staging`** - Pre-release testing and validation (deployed to testnets)
- **`develop`** - Integration branch for ongoing development

#### Supporting Branches

- **`feature/CONTRACT-123-add-staking`** - New features
- **`hotfix/fix-critical-vulnerability`** - Critical production fixes
- **`release/v1.2.0`** - Release preparation

## Naming Conventions

### Branch Names

```bash
feature/ISSUE-123-brief-description
hotfix/critical-issue-description  
release/v1.2.0
chore/update-dependencies
docs/update-readme
```

### Commit Messages

```bash
feat(contracts): add staking reward mechanism (#123)
fix(deployment): correct mainnet contract address (#456)
test(staking): add comprehensive staking tests
docs(readme): update deployment instructions
chore(deps): bump hardhat to v2.19.0
```

### Tags

```bash
v1.0.0          - Major release
v1.1.0          - Minor release  
v1.1.1          - Patch release
v1.0.0-beta.1   - Pre-release
```

## Workflow Process

### 1. Feature Development

```bash
# Start from develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/ISSUE-123-add-governance

# Update submodules to latest develop
git submodule update --remote --merge

# Work on feature...
# Make commits following conventional commit format

# Push feature branch
git push -u origin feature/ISSUE-123-add-governance
```

### 2. Pull Request Requirements

#### PR Title Format

```bash
feat: Add governance token staking mechanism (#123)
fix: Resolve deployment configuration for Polygon (#456)
```

#### Required PR Checks

- [ ] All tests pass (unit + integration)
- [ ] Smart contracts compile without warnings
- [ ] Gas optimization review completed
- [ ] Security considerations documented
- [ ] Deployment plan updated (if applicable)
- [ ] Documentation updated
- [ ] Submodule versions properly updated

#### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Smart Contract Impact
- [ ] New contracts added
- [ ] Existing contracts modified
- [ ] Deployment configuration changed
- [ ] Gas cost implications

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Mainnet fork testing completed

## Deployment Checklist
- [ ] Deployment scripts updated
- [ ] Configuration files updated
- [ ] Migration strategy documented

## Security Review
- [ ] No new attack vectors introduced
- [ ] Access controls reviewed
- [ ] Third-party integrations validated
```

### 3. Submodule Management

#### Updating Submodules in Parent

```bash
# Option A: Update to latest commit on develop
git submodule update --remote --merge

# Option B: Update to specific commit
cd contracts
git checkout feature/new-contract
cd ..
git add contracts
git commit -m "feat: update contracts submodule to include new staking contract"
```

#### Submodule Workflow Rules

1. **Contracts submodule**: Always merge to develop first, then update parent
2. **Deployments submodule**: Updated immediately after successful deployments
3. **Atomic updates**: Submodule updates should be separate commits with clear messages

### 4. Release Process

#### Creating a Release

```bash
# Create release branch from develop
git checkout develop
git pull origin develop
git checkout -b release/v1.2.0

# Update version numbers, changelogs
# Final testing and bug fixes only

# Merge to main
git checkout main
git merge --no-ff release/v1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"

# Merge back to develop
git checkout develop
git merge --no-ff release/v1.2.0

# Clean up
git branch -d release/v1.2.0
```

## GitHub Integration

### Branch Protection Rules

#### Main Branch

- Require pull request reviews (min 1 reviewer)
- Require status checks to pass
- Require branches to be up to date
- Require conversation resolution
- Restrict pushes to admins only

#### Develop Branch

- Require pull request reviews (min 1 reviewer)
- Require status checks to pass
- Allow force pushes for admins

### GitHub Actions Workflow

```yaml
# Example CI/CD triggers
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    # Run tests, linting, security checks
  
  deploy-testnet:
    if: github.ref == 'refs/heads/develop'
    # Auto-deploy to testnet
    
  deploy-mainnet:
    if: github.ref == 'refs/heads/main'
    # Manual deployment to mainnet
```

### Issue and Project Integration

#### Issue Labels

```bash
Type:
- bug
- feature
- security
- gas-optimization
- documentation

Priority:
- critical
- high
- medium
- low

Component:
- contracts
- deployment
- testing
- infrastructure
```
