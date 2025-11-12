# Requirements Document

## Introduction

This document defines the requirements for a Web3 creation platform that enables handmade-art creators to register original works on-chain, authorize derivative works (二创), and automatically split revenue between original and derivative creators. The platform uses blockchain technology to ensure transparent licensing and payment distribution, creating an ecosystem where "creation becomes a tree that can see itself grow."

## Glossary

- **Creation Platform**: The Web3 application system that manages original and derivative artwork registration and licensing
- **Original Work**: A handmade artwork registered on-chain by its creator as a certified creation
- **Derivative Work (二创)**: A new creation inspired by or based on an Original Work, requiring authorization from the original creator
- **Authorization Token**: An on-chain proof that a user has paid for and received permission to create a Derivative Work
- **License Fee**: The amount set by an original creator that others must pay to create Derivative Works
- **Revenue Split**: The automatic distribution of earnings between original and derivative creators when a work generates income
- **Wallet**: A MetaMask wallet used for authentication and blockchain transactions
- **Smart Contract System**: The on-chain Solidity contracts that manage work registration, authorization, and payments

## Requirements

### Requirement 1

**User Story:** As a creator, I want to connect my MetaMask wallet to the platform, so that I can authenticate and interact with blockchain features

#### Acceptance Criteria

1. WHEN a user clicks the wallet connection button, THE Creation Platform SHALL initiate a MetaMask connection request
2. WHEN MetaMask connection succeeds, THE Creation Platform SHALL store the user's wallet address in the session
3. IF MetaMask is not installed, THEN THE Creation Platform SHALL display an error message with installation instructions
4. THE Creation Platform SHALL display the connected wallet address in the user interface
5. WHEN a user disconnects their wallet, THE Creation Platform SHALL clear the session and return to the unauthenticated state

### Requirement 2

**User Story:** As an original creator, I want to register my handmade artwork on-chain, so that I can prove ownership and enable derivative work licensing

#### Acceptance Criteria

1. WHEN a connected user submits an original work with metadata, THE Smart Contract System SHALL mint a unique token representing the work
2. THE Smart Contract System SHALL store the creator's wallet address, work identifier, and timestamp on-chain
3. WHEN registering a work, THE Smart Contract System SHALL allow the creator to set a License Fee in wei
4. THE Smart Contract System SHALL emit an event containing the work identifier and creator address upon successful registration
5. IF the transaction fails, THEN THE Creation Platform SHALL display the error reason to the user

### Requirement 3

**User Story:** As a user, I want to browse registered original works, so that I can discover creations and decide which ones to support or derive from

#### Acceptance Criteria

1. THE Creation Platform SHALL query and display a list of all registered Original Works from the blockchain
2. WHEN displaying a work, THE Creation Platform SHALL show the creator address, registration timestamp, and License Fee
3. THE Creation Platform SHALL retrieve work metadata from off-chain storage using the work identifier
4. WHEN a user selects a work, THE Creation Platform SHALL display detailed information including derivative work count
5. THE Creation Platform SHALL allow users to filter works by creator address or registration date

### Requirement 4

**User Story:** As a supporter, I want to tip creators directly on-chain, so that I can reward quality work and support the creator community

#### Acceptance Criteria

1. WHEN a user initiates a tip transaction with an amount and recipient address, THE Smart Contract System SHALL transfer the specified amount to the creator
2. THE Smart Contract System SHALL emit an event containing the tipper address, recipient address, and tip amount
3. IF the tip amount is zero or the transaction fails, THEN THE Smart Contract System SHALL revert the transaction
4. THE Creation Platform SHALL display a confirmation message after a successful tip transaction
5. THE Creation Platform SHALL update the displayed tip total for the work after the transaction confirms

### Requirement 5

**User Story:** As a potential derivative creator, I want to request and pay for authorization to create derivative works, so that I can legally build upon existing creations

#### Acceptance Criteria

1. WHEN a user requests authorization for a specific Original Work, THE Smart Contract System SHALL require payment equal to the License Fee
2. WHEN payment is received, THE Smart Contract System SHALL mint an Authorization Token to the requester's address
3. THE Smart Contract System SHALL record the authorization relationship between the Original Work and the authorized user on-chain
4. THE Smart Contract System SHALL emit an event containing the work identifier, authorized user address, and payment amount
5. IF the user already has authorization for the work, THEN THE Smart Contract System SHALL revert the transaction

### Requirement 6

**User Story:** As an authorized user, I want to register my derivative work on-chain, so that I can prove my authorization and participate in revenue sharing

#### Acceptance Criteria

1. WHEN a user submits a Derivative Work registration, THE Smart Contract System SHALL verify the user holds an Authorization Token for the parent Original Work
2. IF the user lacks authorization, THEN THE Smart Contract System SHALL revert the transaction with an error message
3. WHEN authorization is verified, THE Smart Contract System SHALL register the Derivative Work with a reference to the parent Original Work
4. THE Smart Contract System SHALL store the derivative creator's address and timestamp on-chain
5. THE Smart Contract System SHALL emit an event containing the derivative work identifier and parent work identifier

### Requirement 7

**User Story:** As a creator in the creation tree, I want revenue from derivative works to be tracked and split across all ancestors in the chain, so that the entire creation tree fairly rewards all contributors

#### Acceptance Criteria

1. WHEN a Derivative Work receives payment, THE Smart Contract System SHALL traverse the parent chain to identify all ancestor works up to the original
2. THE Smart Contract System SHALL calculate the split percentage for each creator in the chain according to the revenue distribution rules
3. THE Smart Contract System SHALL update the balance record for each creator in the chain with their respective share amount
4. THE Smart Contract System SHALL emit an event containing all recipient addresses in the chain and their respective amounts
5. WHEN a creator requests withdrawal, THE Smart Contract System SHALL transfer their accumulated balance to their wallet address and reset their balance to zero

### Requirement 8

**User Story:** As a creator, I want to view my authorization status and derivative work relationships, so that I can track my creation tree and understand my licensing rights

#### Acceptance Criteria

1. WHEN a user queries their authorizations, THE Creation Platform SHALL retrieve all Authorization Tokens owned by the user's address
2. THE Creation Platform SHALL display the Original Works for which the user has authorization
3. WHEN viewing an Original Work, THE Creation Platform SHALL display all registered Derivative Works that reference it
4. THE Creation Platform SHALL show the creation hierarchy as a tree structure
5. THE Creation Platform SHALL indicate whether a user has authorization to create derivatives for a specific work

### Requirement 9

**User Story:** As a platform user, I want all critical actions to be recorded on-chain with minimal gas costs, so that the platform remains affordable while maintaining transparency

#### Acceptance Criteria

1. THE Smart Contract System SHALL store only essential data on-chain including work identifiers, creator addresses, authorization relationships, and payment amounts
2. THE Smart Contract System SHALL reference off-chain storage for large metadata such as artwork files and descriptions
3. WHEN executing transactions, THE Smart Contract System SHALL optimize gas usage by minimizing storage operations
4. THE Smart Contract System SHALL use events for historical data that does not require on-chain queries
5. THE Smart Contract System SHALL batch multiple operations where possible to reduce transaction costs

### Requirement 10

**User Story:** As a platform administrator, I want the smart contracts deployed on Sepolia testnet, so that we can test all functionality before mainnet deployment

#### Acceptance Criteria

1. THE Smart Contract System SHALL be deployable to the Sepolia testnet network
2. THE Smart Contract System SHALL use Sepolia-compatible addresses and gas configurations
3. THE Creation Platform SHALL connect to Sepolia RPC endpoints for blockchain interactions
4. THE Creation Platform SHALL display Sepolia network information to users
5. WHEN a user's wallet is on the wrong network, THE Creation Platform SHALL prompt them to switch to Sepolia
