import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, LaunchStatus, RelayerStatus } from '@prisma/client';

@Injectable()
export class LaunchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.LaunchRequestCreateInput) {
    return this.prisma.launchRequest.create({
      data,
      include: {
        user: true,
        quote: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.launchRequest.findUnique({
      where: { id },
      include: {
        user: true,
        quote: true,
        deployedToken: true,
        relayerTxs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async updateStatus(id: string, status: LaunchStatus, errorMessage?: string) {
    return this.prisma.launchRequest.update({
      where: { id },
      data: {
        status,
        errorMessage: errorMessage ?? null,
      },
    });
  }

  async createDeployedToken(data: Prisma.DeployedTokenUncheckedCreateInput) {
    return this.prisma.deployedToken.create({
      data,
    });
  }

  async createRelayerTx(data: Prisma.RelayerTxUncheckedCreateInput) {
    return this.prisma.relayerTx.create({
      data,
    });
  }

  async updateRelayerTx(id: string, status: RelayerStatus, txHash?: string, errorReason?: string) {
    return this.prisma.relayerTx.update({
      where: { id },
      data: {
        status,
        txHash: txHash ?? undefined,
        errorReason: errorReason ?? null,
        minedAt: status === RelayerStatus.MINED ? new Date() : undefined,
      },
    });
  }
}
