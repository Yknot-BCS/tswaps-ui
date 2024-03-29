export default async ({ Vue }) => {
  Vue.prototype.$erc20Abi = [
    {
      inputs: [
        { internalType: "string", name: "_symbol", type: "string" },
        { internalType: "string", name: "_name", type: "string" },
        { internalType: "uint8", name: "_decimals", type: "uint8" },
        { internalType: "uint256", name: "__totalSupply", type: "uint256" },
        { internalType: "uint8", name: "_threshold", type: "uint8" },
        { internalType: "uint8", name: "_thisChainId", type: "uint8" },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "tokenOwner",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "spender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "tokens",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        { indexed: false, internalType: "uint64", name: "id", type: "uint64" },
        {
          indexed: false,
          internalType: "address",
          name: "toAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "tokenAddress",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "Claimed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "_from",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "_to",
          type: "address",
        },
      ],
      name: "OwnershipTransferred",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: false, internalType: "string", name: "to", type: "string" },
        {
          indexed: false,
          internalType: "uint256",
          name: "tokens",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "chainId",
          type: "uint256",
        },
      ],
      name: "Teleport",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "from",
          type: "address",
        },
        { indexed: true, internalType: "address", name: "to", type: "address" },
        {
          indexed: false,
          internalType: "uint256",
          name: "tokens",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      inputs: [],
      name: "_totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "acceptOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [
        { internalType: "uint256", name: "remaining", type: "uint256" },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "tokens", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "success", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "tokens", type: "uint256" },
        { internalType: "bytes", name: "data", type: "bytes" },
      ],
      name: "approveAndCall",
      outputs: [{ internalType: "bool", name: "success", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenOwner", type: "address" },
      ],
      name: "balanceOf",
      outputs: [{ internalType: "uint256", name: "balance", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "bytes", name: "sigData", type: "bytes" },
        { internalType: "bytes[]", name: "signatures", type: "bytes[]" },
      ],
      name: "claim",
      outputs: [
        { internalType: "address", name: "toAddress", type: "address" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint64", name: "", type: "uint64" }],
      name: "claimed",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "decimals",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "name",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "newOwner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "bytes32", name: "message", type: "bytes32" },
        { internalType: "bytes", name: "sig", type: "bytes" },
      ],
      name: "recoverSigner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes", name: "sig", type: "bytes" }],
      name: "splitSignature",
      outputs: [
        { internalType: "uint8", name: "", type: "uint8" },
        { internalType: "bytes32", name: "", type: "bytes32" },
        { internalType: "bytes32", name: "", type: "bytes32" },
      ],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [{ internalType: "string", name: "source", type: "string" }],
      name: "stringToBytes32",
      outputs: [{ internalType: "bytes32", name: "result", type: "bytes32" }],
      stateMutability: "pure",
      type: "function",
    },
    {
      inputs: [],
      name: "symbol",
      outputs: [{ internalType: "string", name: "", type: "string" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "string", name: "to", type: "string" },
        { internalType: "uint256", name: "tokens", type: "uint256" },
        { internalType: "uint256", name: "chainid", type: "uint256" },
      ],
      name: "teleport",
      outputs: [{ internalType: "bool", name: "success", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "thisChainId",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "threshold",
      outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "totalSupply",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "tokens", type: "uint256" },
      ],
      name: "transfer",
      outputs: [{ internalType: "bool", name: "success", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "tokenAddress", type: "address" },
        { internalType: "uint256", name: "tokens", type: "uint256" },
      ],
      name: "transferAnyERC20Token",
      outputs: [{ internalType: "bool", name: "success", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "from", type: "address" },
        { internalType: "address", name: "to", type: "address" },
        { internalType: "uint256", name: "tokens", type: "uint256" },
      ],
      name: "transferFrom",
      outputs: [{ internalType: "bool", name: "success", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "_newOwner", type: "address" }],
      name: "transferOwnership",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint8", name: "newChainId", type: "uint8" }],
      name: "updateChainId",
      outputs: [{ internalType: "bool", name: "success", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint8", name: "newThreshold", type: "uint8" }],
      name: "updateThreshold",
      outputs: [{ internalType: "bool", name: "success", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    { stateMutability: "payable", type: "receive" },
  ];

  //   Vue.prototype.$erc20Abi = [
  //     // Read-Only Functions
  //     "function balanceOf(address owner) view returns (uint256)",
  //     "function decimals() view returns (uint8)",
  //     "function symbol() view returns (string)",

  //   ];
};
