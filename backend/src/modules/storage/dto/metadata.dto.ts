import { IsString, IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class TokenMetadataDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsUrl()
  image: string; // IPFS URI or HTTP link to image

  @IsString()
  @IsOptional()
  twitter?: string;

  @IsString()
  @IsOptional()
  telegram?: string;

  @IsString()
  @IsOptional()
  website?: string;
}

export class UploadMetadataResponseDto {
  ipfsHash: string;
  metadataUri: string;
  gatewayUrl: string;
}
