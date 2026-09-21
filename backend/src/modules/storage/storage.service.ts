import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import { TokenMetadataDto, UploadMetadataResponseDto } from './dto/metadata.dto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly pinataJwt = process.env.PINATA_JWT;
  private readonly pinataGateway = process.env.PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs';

  /**
   * Pins JSON metadata to IPFS via Pinata.
   */
  async pinJsonMetadata(metadata: TokenMetadataDto): Promise<UploadMetadataResponseDto> {
    try {
      if (!this.pinataJwt) {
        this.logger.warn('PINATA_JWT not configured, simulating IPFS pin for development');
        const mockHash = `QmFakeIpfsHash${Date.now().toString(16)}`;
        return {
          ipfsHash: mockHash,
          metadataUri: `ipfs://${mockHash}`,
          gatewayUrl: `${this.pinataGateway}/${mockHash}`,
        };
      }

      const payload = {
        pinataOptions: {
          cidVersion: 1,
        },
        pinataMetadata: {
          name: `${metadata.symbol}-metadata.json`,
        },
        pinataContent: {
          name: metadata.name,
          symbol: metadata.symbol,
          description: metadata.description,
          image: metadata.image,
          attributes: [],
          properties: {
            files: [{ uri: metadata.image, type: 'image/png' }],
            category: 'image',
          },
          extensions: {
            twitter: metadata.twitter,
            telegram: metadata.telegram,
            website: metadata.website,
          },
        },
      };

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.pinataJwt}`,
          },
        },
      );

      const ipfsHash = response.data.IpfsHash;
      return {
        ipfsHash,
        metadataUri: `ipfs://${ipfsHash}`,
        gatewayUrl: `${this.pinataGateway}/${ipfsHash}`,
      };
    } catch (error) {
      this.logger.error('Failed to pin JSON metadata to Pinata', error);
      throw new InternalServerErrorException('Failed to upload metadata to IPFS');
    }
  }

  /**
   * Pins raw buffer file (e.g. token icon/banner) to IPFS.
   */
  async pinFileToIpfs(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    if (!this.pinataJwt) {
      const mockHash = `QmFakeImageHash${Date.now().toString(16)}`;
      return `ipfs://${mockHash}`;
    }

    try {
      const FormData = (await import('form-data')).default;
      const data = new FormData();
      data.append('file', fileBuffer, { filename: fileName, contentType: mimeType });

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        data,
        {
          maxBodyLength: Infinity,
          headers: {
            ...data.getHeaders(),
            Authorization: `Bearer ${this.pinataJwt}`,
          },
        },
      );

      return `ipfs://${response.data.IpfsHash}`;
    } catch (error) {
      this.logger.error('Failed to pin file to Pinata', error);
      throw new InternalServerErrorException('Failed to upload image file to IPFS');
    }
  }
}
