import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';

export interface PumpPortalCreatePayload {
  publicKey: string;
  action: 'create';
  tokenMetadata: {
    name: string;
    symbol: string;
    uri: string;
  };
  mint: string;
  denominatedInSol: 'true' | 'false';
  amount: number;
  slippage: number;
  priorityFee: number;
  pool: 'pump';
}

@Injectable()
export class PumpPortalClient {
  private readonly logger = new Logger(PumpPortalClient.name);
  private readonly apiUrl = process.env.PUMPPORTAL_API_URL || 'https://pumpportal.fun/api/trade-local';

  /**
   * Requests an encoded transaction from PumpPortal trade-local API for token launch.
   */
  async createTokenTransaction(payload: PumpPortalCreatePayload): Promise<Buffer> {
    try {
      this.logger.log(`Requesting PumpPortal create transaction for mint: ${payload.mint}`);
      
      const response = await axios.post(this.apiUrl, payload, {
        responseType: 'arraybuffer',
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      return Buffer.from(response.data);
    } catch (error) {
      this.logger.error('Error fetching trade-local transaction from PumpPortal', error);
      throw new InternalServerErrorException('Failed to generate PumpPortal transaction');
    }
  }
}
