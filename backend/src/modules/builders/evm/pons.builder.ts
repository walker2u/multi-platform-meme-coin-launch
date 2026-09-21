import { encodeFunctionData, parseEther } from 'viem';
import ponsAbi from '../../../common/constants/abis/ponsV2Factory.json';

export interface PonsTokenParams {
  name: string;
  symbol: string;
  metadataUri: string;
  virtualEthLiquidity?: string;
}

export class PonsBuilder {
  /**
   * Encodes Pons V2 createToken calldata.
   */
  static buildCreateTokenTx(params: PonsTokenParams): {
    calldata: `0x${string}`;
    valueWei: bigint;
  } {
    const liquidityWei = params.virtualEthLiquidity
      ? parseEther(params.virtualEthLiquidity)
      : parseEther('1.0');

    const calldata = encodeFunctionData({
      abi: ponsAbi,
      functionName: 'createToken',
      args: [
        params.name,
        params.symbol,
        params.metadataUri,
        liquidityWei,
      ],
    });

    return {
      calldata,
      valueWei: 0n,
    };
  }
}
