import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuoteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.QuoteCreateInput) {
    return this.prisma.quote.create({
      data,
      include: {
        user: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.quote.findUnique({
      where: { id },
      include: {
        user: true,
        launchRequest: true,
      },
    });
  }

  async findValidQuote(id: string) {
    return this.prisma.quote.findFirst({
      where: {
        id,
        expiresAt: {
          gt: new Date(),
        },
      },
    });
  }
}
