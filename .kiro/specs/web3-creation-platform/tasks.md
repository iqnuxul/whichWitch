# Implementation Plan

- [x] 1. Set up project structure and development environment
  - Initialize Hardhat project for smart contract development
  - Configure Hardhat for Sepolia testnet deployment
  - Install OpenZeppelin contracts for security utilities
  - Set up TypeScript configuration for type safety
  - Create directory structure: contracts/, scripts/, test/
  - _Requirements: 10.1, 10.2_

- [x] 2. Implement PaymentManager smart contract
  - [x] 2.1 Create PaymentManager contract with balance tracking
    - Write contract with balances mapping and configuration variables
    - Implement custom errors for gas efficiency
    - Add ReentrancyGuard from OpenZeppelin
    - _Requirements: 7.3, 9.1, 9.3_
  
  - [x] 2.2 Implement tip functionality
    - Write tipCreator function that accepts payable ETH
    - Update creator balance directly (100% to creator)
    - Emit TipReceived event with tipper, creator, amount, timestamp
    - Add validation for zero amount
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 2.3 Implement revenue distribution logic
    - Write distributeRevenue internal function
    - Implement chain traversal to get all ancestors
    - Calculate 50/50 split between direct creator and ancestor pool
    - Update balances for all creators in chain
    - Emit RevenueDistributed event with all recipients and amounts
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [x] 2.4 Implement withdrawal functionality
    - Write withdraw function with reentrancy protection
    - Follow checks-effects-interactions pattern
    - Reset balance before transfer
    - Emit Withdrawal event
    - Handle transfer failures with custom error
    - _Requirements: 7.5_
  
  - [x] 2.5 Add view functions for balance queries
    - Implement getBalance function
    - _Requirements: 7.3_

- [x] 3. Implement CreationManager smart contract
  - [x] 3.1 Create CreationManager contract with core data structures
    - Define Work struct with id, creator, parentId, licenseFee, timestamp, exists
    - Create mappings for works, creatorWorks, derivatives
    - Add nextWorkId counter
    - Store PaymentManager and AuthorizationManager addresses
    - _Requirements: 2.2, 9.1_
  
  - [x] 3.2 Implement original work registration
    - Write registerOriginalWork function
    - Validate inputs and increment work ID
    - Create Work struct with parentId = 0
    - Store work in mappings
    - Emit WorkRegistered event with metadata URI
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 3.3 Implement derivative work registration
    - Write registerDerivativeWork function
    - Call AuthorizationManager to verify user authorization
    - Revert with custom error if not authorized
    - Create Work struct with parent reference
    - Update derivatives mapping
    - Emit DerivativeWorkRegistered event
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 3.4 Implement work chain traversal
    - Write getWorkChain function to traverse parent relationships
    - Return array from original work to specified work
    - Handle edge cases (invalid work ID, circular references)
    - _Requirements: 7.1_
  
  - [x] 3.5 Add query functions for work data
    - Implement getDerivatives function
    - Add getter functions for work details
    - _Requirements: 3.1, 3.4, 8.3_
  
  - [x] 3.6 Add setter for AuthorizationManager address
    - Write function to set AuthorizationManager after deployment
    - Add access control (only owner)
    - _Requirements: 6.1_

- [x] 4. Implement AuthorizationManager smart contract
  - [x] 4.1 Create AuthorizationManager contract with authorization tracking
    - Create authorizations mapping (workId => user => bool)
    - Create userAuthorizations mapping (user => workIds array)
    - Store CreationManager and PaymentManager addresses
    - _Requirements: 5.3, 8.1_
  
  - [x] 4.2 Implement authorization request and payment
    - Write requestAuthorization payable function
    - Query license fee from CreationManager
    - Validate msg.value equals license fee
    - Check for duplicate authorization and revert if exists
    - Mark user as authorized
    - Add work ID to user's authorization list
    - Forward payment to PaymentManager for distribution
    - Emit AuthorizationGranted event
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 4.3 Implement authorization verification
    - Write hasAuthorization view function
    - Used by CreationManager during derivative registration
    - _Requirements: 6.1_
  
  - [x] 4.4 Add query function for user authorizations
    - Implement getUserAuthorizations function
    - Return array of work IDs user is authorized for
    - _Requirements: 8.1, 8.2_

- [ ] 5. Create deployment scripts
  - [ ] 5.1 Write deployment script for all contracts
    - Deploy PaymentManager first
    - Deploy CreationManager with PaymentManager address
    - Deploy AuthorizationManager with both addresses
    - Set AuthorizationManager address in CreationManager
    - Log all deployed addresses
    - _Requirements: 10.1, 10.2_
  
  - [ ] 5.2 Create Sepolia testnet configuration
    - Configure Hardhat network settings for Sepolia
    - Set up environment variables for private key and RPC URL
    - Add gas price configuration
    - _Requirements: 10.2_
  
  - [ ] 5.3 Create contract verification script
    - Write script to verify contracts on Etherscan
    - Include constructor arguments
    - _Requirements: 10.1_

- [ ] 6. Write smart contract tests
  - [ ] 6.1 Write PaymentManager unit tests
    - Test tip functionality with balance updates
    - Test revenue distribution across multi-level chains
    - Test withdrawal with reentrancy protection
    - Test edge cases (zero amounts, insufficient balance)
    - _Requirements: 4.1, 7.1, 7.2, 7.3, 7.5_
  
  - [ ] 6.2 Write CreationManager unit tests
    - Test original work registration
    - Test derivative work registration with authorization
    - Test rejection of unauthorized derivative registration
    - Test work chain traversal for various depths
    - Test getDerivatives function
    - _Requirements: 2.1, 6.1, 6.2, 7.1_
  
  - [ ] 6.3 Write AuthorizationManager unit tests
    - Test authorization request with correct payment
    - Test rejection with incorrect payment
    - Test duplicate authorization prevention
    - Test authorization verification
    - _Requirements: 5.1, 5.2, 5.5, 6.1_
  
  - [ ] 6.4 Write integration tests for complete flows
    - Test end-to-end: register original → request auth → register derivative
    - Test multi-level chain creation and revenue distribution
    - Test tip flow
    - Test withdrawal flow
    - _Requirements: All_

- [ ] 7. Initialize Next.js frontend project
  - [ ] 7.1 Create Next.js application with TypeScript
    - Initialize Next.js project with TypeScript template
    - Configure ESLint and Prettier
    - Set up directory structure: components/, lib/, pages/, styles/
    - _Requirements: 1.1_
  
  - [ ] 7.2 Install Web3 dependencies
    - Install ethers.js for blockchain interaction
    - Install wagmi and viem for React hooks
    - Install RainbowKit for wallet connection UI
    - _Requirements: 1.1, 1.2_
  
  - [ ] 7.3 Configure Web3 providers and chains
    - Set up wagmi config with Sepolia chain
    - Configure RainbowKit with MetaMask
    - Create Web3Provider wrapper component
    - _Requirements: 10.3, 10.4_

- [ ] 8. Implement wallet connection functionality
  - [ ] 8.1 Create wallet connection component
    - Build ConnectWallet button component using RainbowKit
    - Display connected wallet address
    - Add disconnect functionality
    - _Requirements: 1.1, 1.2, 1.4, 1.5_
  
  - [ ] 8.2 Implement MetaMask detection and error handling
    - Check for MetaMask installation
    - Display installation instructions if not found
    - Handle connection errors gracefully
    - _Requirements: 1.3_
  
  - [ ] 8.3 Add network validation and switching
    - Detect current network
    - Prompt user to switch to Sepolia if on wrong network
    - Implement automatic network switch request
    - _Requirements: 10.5_

- [ ] 9. Create contract interaction utilities
  - [ ] 9.1 Generate TypeScript contract types
    - Use Typechain to generate types from ABIs
    - Export contract interfaces
    - _Requirements: 2.1, 5.1, 4.1_
  
  - [ ] 9.2 Create contract instance hooks
    - Write custom hooks for CreationManager contract
    - Write custom hooks for AuthorizationManager contract
    - Write custom hooks for PaymentManager contract
    - Include read and write functions
    - _Requirements: All contract interactions_
  
  - [ ] 9.3 Implement transaction handling utilities
    - Create helper for sending transactions with loading states
    - Add transaction confirmation waiting
    - Implement error parsing and user-friendly messages
    - Add transaction receipt handling
    - _Requirements: 2.5, 4.4, 5.4_

- [ ] 10. Implement work registration features
  - [ ] 10.1 Create original work registration form
    - Build form with title, description, image upload, license fee inputs
    - Add form validation
    - Implement image upload to Supabase Storage
    - Generate metadata URI
    - Call registerOriginalWork contract function
    - Display transaction status and confirmation
    - _Requirements: 2.1, 2.3, 2.4, 2.5_
  
  - [ ] 10.2 Create derivative work registration form
    - Build form with parent work selection, metadata inputs
    - Verify user has authorization before allowing submission
    - Upload derivative work metadata
    - Call registerDerivativeWork contract function
    - Handle authorization errors
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ] 10.3 Add transaction feedback and error handling
    - Show loading states during transactions
    - Display success messages with transaction links
    - Parse and display contract errors
    - Handle user rejection gracefully
    - _Requirements: 2.5, 6.2_

- [ ] 11. Implement work browsing and discovery
  - [ ] 11.1 Create work list component
    - Query all works from contract
    - Display work cards with creator, timestamp, license fee
    - Implement pagination for large lists
    - _Requirements: 3.1, 3.2_
  
  - [ ] 11.2 Fetch and display work metadata
    - Retrieve metadata from Supabase using work ID
    - Display title, description, image
    - Handle missing or invalid metadata
    - _Requirements: 3.3_
  
  - [ ] 11.3 Create work detail page
    - Display full work information
    - Show derivative work count
    - List all derivatives
    - Show creation tree visualization
    - _Requirements: 3.4, 8.3, 8.4_
  
  - [ ] 11.4 Add filtering and search functionality
    - Implement filter by creator address
    - Add filter by registration date
    - Create search interface
    - _Requirements: 3.5_

- [ ] 12. Implement authorization request flow
  - [ ] 12.1 Create authorization request component
    - Display license fee for selected work
    - Show authorization button
    - Call requestAuthorization with payment
    - Handle transaction confirmation
    - _Requirements: 5.1, 5.2, 5.4_
  
  - [ ] 12.2 Add authorization status display
    - Check if user has authorization for a work
    - Display authorization badge
    - Show authorization date
    - _Requirements: 8.2, 8.5_
  
  - [ ] 12.3 Implement user authorization list
    - Query all works user is authorized for
    - Display as list or grid
    - Link to work details
    - _Requirements: 8.1, 8.2_

- [ ] 13. Implement tipping functionality
  - [ ] 13.1 Create tip component
    - Add tip button to work detail page
    - Build tip amount input modal
    - Call tipCreator contract function
    - Display confirmation message
    - _Requirements: 4.1, 4.4_
  
  - [ ] 13.2 Display tip totals
    - Listen for TipReceived events
    - Aggregate tips per work
    - Display total tips on work card
    - _Requirements: 4.5_

- [ ] 14. Implement balance and withdrawal features
  - [ ] 14.1 Create balance display component
    - Query user's balance from PaymentManager
    - Display accumulated earnings
    - Show balance in ETH with USD conversion
    - _Requirements: 7.3_
  
  - [ ] 14.2 Implement withdrawal functionality
    - Add withdraw button
    - Call withdraw contract function
    - Show transaction confirmation
    - Update balance after withdrawal
    - _Requirements: 7.5_
  
  - [ ] 14.3 Display earnings history
    - Listen for RevenueDistributed events for user
    - Show list of earnings with sources
    - Display timestamps and amounts
    - _Requirements: 7.4_

- [ ] 15. Set up Supabase backend
  - [ ] 15.1 Create Supabase project and database schema
    - Create works table with indexes
    - Create authorizations table
    - Create revenue_distributions table
    - Set up foreign key relationships
    - _Requirements: 9.2_
  
  - [ ] 15.2 Configure Supabase Storage for metadata
    - Create storage bucket for work images
    - Set up public access policies
    - Configure CORS settings
    - _Requirements: 9.2_
  
  - [ ] 15.3 Implement metadata upload API
    - Create API route for uploading work metadata
    - Store metadata JSON in Supabase
    - Return metadata URI
    - _Requirements: 2.1, 6.4_

- [ ] 16. Create event indexing service
  - [ ] 16.1 Write Supabase Edge Function for event listening
    - Set up webhook or polling for contract events
    - Parse WorkRegistered events and insert into works table
    - Parse AuthorizationGranted events and insert into authorizations table
    - Parse RevenueDistributed events and insert into revenue_distributions table
    - _Requirements: 2.4, 5.4, 7.4_
  
  - [ ] 16.2 Implement event synchronization
    - Handle missed events on startup
    - Implement retry logic for failed insertions
    - Add logging for debugging
    - _Requirements: 9.4_

- [ ] 17. Build creation tree visualization
  - [ ] 17.1 Create tree visualization component
    - Use a graph library (e.g., react-flow or d3)
    - Fetch work chain data
    - Render tree structure with nodes for each work
    - Show creator addresses and work IDs
    - _Requirements: 8.3, 8.4_
  
  - [ ] 17.2 Add interactive features to tree
    - Make nodes clickable to view work details
    - Highlight user's works and authorizations
    - Show revenue flow visualization
    - _Requirements: 8.4, 8.5_

- [ ] 18. Implement UI polish and user experience
  - [ ] 18.1 Create responsive layout
    - Design mobile-friendly navigation
    - Ensure all components work on mobile
    - Test on various screen sizes
    - _Requirements: All UI requirements_
  
  - [ ] 18.2 Add loading states and skeletons
    - Show loading indicators during blockchain queries
    - Add skeleton screens for data fetching
    - Implement optimistic UI updates
    - _Requirements: All UI requirements_
  
  - [ ] 18.3 Implement toast notifications
    - Add toast library (e.g., react-hot-toast)
    - Show notifications for transaction status
    - Display success and error messages
    - _Requirements: 2.5, 4.4, 5.4_

- [ ] 19. Deploy and test on Sepolia
  - [ ] 19.1 Deploy smart contracts to Sepolia
    - Run deployment script with Sepolia configuration
    - Verify contracts on Etherscan
    - Save deployed addresses
    - _Requirements: 10.1, 10.2_
  
  - [ ] 19.2 Configure frontend with deployed contract addresses
    - Update environment variables with contract addresses
    - Update RPC URL for Sepolia
    - Test contract interactions
    - _Requirements: 10.3_
  
  - [ ] 19.3 Deploy frontend to Vercel
    - Connect GitHub repository to Vercel
    - Configure environment variables
    - Deploy to production
    - Test deployed application
    - _Requirements: 10.3, 10.4_
  
  - [ ] 19.4 Perform end-to-end testing on testnet
    - Test complete user flows with real transactions
    - Verify all features work as expected
    - Test with multiple user accounts
    - Document any issues
    - _Requirements: All_

- [ ] 20. Create documentation
  - [ ] 20.1 Write README with setup instructions
    - Document project structure
    - Add installation steps
    - Include deployment instructions
    - Add usage examples
    - _Requirements: All_
  
  - [ ] 20.2 Document smart contract interfaces
    - Generate documentation from NatSpec comments
    - Explain contract architecture
    - Document deployment process
    - _Requirements: All contract requirements_
  
  - [ ] 20.3 Create user guide
    - Write guide for connecting wallet
    - Document how to register works
    - Explain authorization process
    - Describe revenue distribution
    - _Requirements: All user-facing requirements_
