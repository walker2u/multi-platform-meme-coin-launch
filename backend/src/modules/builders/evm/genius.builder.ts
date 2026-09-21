import { encodeFunctionData, stringToHex, pad } from 'viem';
import geniusAbi from '../../../common/constants/abis/geniusFunFactory.json';

export interface GeniusTokenParams {
  tokenName: string;
  tokenTicker: string;
  ipfsMetadata: string;
  referralCode?: string;
}

export class GeniusBuilder {
  /**
   * Encodes Genius.fun createGeniusToken calldata.
   */
  static buildCreateTokenTx(params: GeniusTokenParams): {
    calldata: `0x${string}`;
    valueWei: bigint;
  } {
    const refCodeHex = params.referralCode
      ? pad(stringToHex(params.referralCode), { size: 32 })
      : pad('0x0', { size: 32 });

    const calldata = encodeFunctionData({
      abi: geniusAbi,
      functionName: 'createGeniusToken',
      args: [
        params.tokenName,
        params.tokenTicker,
        params.ipfsMetadata,
        refCodeHex,
      ],
    });

    return {
      calldata,
      valueWei: 0n,
    };
  }
}
