export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
}

export interface QuoteRequestParams {
  walletAddress: string;
  targetChain: string;
  targetPlatform: string;
  devBuyAmount?: string;
}

export interface QuoteData {
  quoteId: string;
  targetChain: string;
  targetPlatform: string;
  currency: string;
  baseFee: string;
  estimatedGasFee: string;
  devBuyAmount: string;
  markupAmount: string;
  totalRequired: string;
  expiresAt: string;
}

export interface UploadMetadataResponse {
  ipfsHash: string;
  metadataUri: string;
  gatewayUrl: string;
}

export interface LaunchCreatePayload {
  walletAddress: string;
  userSolanaAddress?: string;
  quoteId: string;
  targetChain: string;
  targetPlatform: string;
  tokenName: string;
  tokenSymbol: string;
  metadataUri: string;
  devBuyAmount?: string;
  intentSignature: `0x${string}`;
  maxSpendAmount: string;
  nonce: string;
  deadline: string;
}

export interface LaunchResponseData {
  launchId: string;
  status: string;
  targetChain: string;
  targetPlatform: string;
  tokenName: string;
  tokenSymbol: string;
  metadataUri: string;
  contractAddress?: string;
  txHash?: string;
  dexPoolAddress?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}
