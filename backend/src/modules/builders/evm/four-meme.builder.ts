import { encodeFunctionData, parseEther } from 'viem';
import fourMemeAbi from '../../../common/constants/abis/fourMemeFactory.json';

export interface FourMemeTokenParams {
  name: string;
  symbol: string;
  description: string;
  metadataUri: string;
  devBuyBnbAmount?: string;
}

export class FourMemeBuilder {
  /**
   * Encodes Four.meme createToken calldata and returns target value in wei.
   */
  static buildCreateTokenTx(params: FourMemeTokenParams): {
    calldata: `0x${string}`;
    valueWei: bigint;
  } {
    const devBuyWei = params.devBuyBnbAmount
      ? parseEther(params.devBuyBnbAmount)
      : 0n;

    const calldata = encodeFunctionData({
      abi: fourMemeAbi,
      functionName: 'createToken',
      args: [
        params.name,
        params.symbol,
        params.description,
        params.metadataUri,
        devBuyWei,
      ],
    });

    return {
      calldata,
      valueWei: devBuyWei,
    };
  }
}
