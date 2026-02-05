import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayoutDto } from './dto/create-payout.dto';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) { }

  async createPayoutRequest(userId: string, dto: CreatePayoutDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Get User Balance
      const user = await tx.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (user.currentBalance.toNumber() < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // 2. Create Payout Request
      const payoutRequest = await tx.payoutRequest.create({
        data: {
          researcherId: userId,
          amount: dto.amount,
          currency: dto.currency,
          method: dto.method as PaymentMethod,
          destination: dto.destination as any,
          status: 'PENDING',
        },
      });

      // 3. Deduct Balance (Reserve funds)
      await tx.user.update({
        where: { id: userId },
        data: {
          currentBalance: {
            decrement: dto.amount,
          },
        },
      });

      return payoutRequest;
    });
  }

  async getMyPayouts(userId: string) {
    return this.prisma.payoutRequest.findMany({
      where: { researcherId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getBalance(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { currentBalance: true, totalEarnings: true },
    });
    return user;
  }

  async findAllPayoutRequests() {
    return this.prisma.payoutRequest.findMany({
      where: { status: 'PENDING' },
      include: { researcher: { select: { username: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updatePayoutStatus(id: string, status: any) { // using any for simplicity or import PayoutStatus
    return this.prisma.payoutRequest.update({
      where: { id },
      data: { status },
    });
  }
}

