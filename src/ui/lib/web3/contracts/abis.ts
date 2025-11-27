// 智能合约 ABI (JSON 格式)
export const CreationManagerABI = [
  {
    type: 'function',
    name: 'authorizationManager',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }]
  },
  {
    type: 'function',
    name: 'paymentManager',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }]
  },
  {
    type: 'function',
    name: 'registerOriginalWork',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'licenseFee', type: 'uint256' },
      { name: 'derivativeAllowed', type: 'bool' },
      { name: 'metadataURI', type: 'string' }
    ],
    outputs: [{ name: 'workId', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'registerDerivativeWork',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'parentId', type: 'uint256' },
      { name: 'licenseFee', type: 'uint256' },
      { name: 'derivativeAllowed', type: 'bool' },
      { name: 'metadataURI', type: 'string' }
    ],
    outputs: [{ name: 'workId', type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'getWork',
    stateMutability: 'view',
    inputs: [{ name: 'workId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'id', type: 'uint256' },
          { name: 'creator', type: 'address' },
          { name: 'parentId', type: 'uint256' },
          { name: 'licenseFee', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'derivativeAllowed', type: 'bool' },
          { name: 'exists', type: 'bool' }
        ]
      }
    ]
  },
  {
    type: 'function',
    name: 'getWorksByCreator',
    stateMutability: 'view',
    inputs: [{ name: 'creator', type: 'address' }],
    outputs: [{ type: 'uint256[]' }]
  },
  {
    type: 'function',
    name: 'getDerivatives',
    stateMutability: 'view',
    inputs: [{ name: 'parentId', type: 'uint256' }],
    outputs: [{ type: 'uint256[]' }]
  },
  {
    type: 'function',
    name: 'getAncestorChain',
    stateMutability: 'view',
    inputs: [{ name: 'workId', type: 'uint256' }],
    outputs: [{ type: 'address[]' }]
  },
  {
    type: 'function',
    name: 'nextWorkId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  },
  {
    type: 'event',
    name: 'WorkRegistered',
    inputs: [
      { name: 'workId', type: 'uint256', indexed: true },
      { name: 'creator', type: 'address', indexed: true },
      { name: 'licenseFee', type: 'uint256', indexed: false },
      { name: 'derivativeAllowed', type: 'bool', indexed: false },
      { name: 'metadataURI', type: 'string', indexed: false },
      { name: 'timestamp', type: 'uint256', indexed: false }
    ]
  }
] as const;

export const PaymentManagerABI = [
  {
    type: 'function',
    name: 'processPayment',
    stateMutability: 'payable',
    inputs: [{ name: 'workId', type: 'uint256' }],
    outputs: []
  },
  {
    type: 'function',
    name: 'tipCreator',
    stateMutability: 'payable',
    inputs: [{ name: 'creator', type: 'address' }],
    outputs: []
  },
  {
    type: 'function',
    name: 'distributeRevenue',
    stateMutability: 'payable',
    inputs: [
      { name: 'workId', type: 'uint256' },
      { name: 'directCreator', type: 'address' },
      { name: 'ancestors', type: 'address[]' }
    ],
    outputs: []
  },
  {
    type: 'function',
    name: 'withdraw',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    type: 'function',
    name: 'withdrawPlatformFees',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    type: 'function',
    name: 'getBalance',
    stateMutability: 'view',
    inputs: [{ name: 'creator', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'getCreatorRevenue',
    stateMutability: 'view',
    inputs: [{ name: 'creator', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'balances',
    stateMutability: 'view',
    inputs: [{ name: 'creator', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    type: 'function',
    name: 'creationManager',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }]
  },
  {
    type: 'function',
    name: 'authorizationManager',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }]
  },
  {
    type: 'function',
    name: 'platformWallet',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }]
  }
] as const;

export const AuthorizationManagerABI = [
  {
    type: 'function',
    name: 'creationManager',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }]
  },
  {
    type: 'function',
    name: 'paymentManager',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }]
  },
  {
    type: 'function',
    name: 'requestAuthorization',
    stateMutability: 'payable',
    inputs: [{ name: 'workId', type: 'uint256' }],
    outputs: []
  },
  {
    type: 'function',
    name: 'hasAuthorization',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'workId', type: 'uint256' }
    ],
    outputs: [{ type: 'bool' }]
  },
  {
    type: 'function',
    name: 'getAuthorizationTimestamp',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'workId', type: 'uint256' }
    ],
    outputs: [{ type: 'uint256' }]
  }
] as const;
