import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}
  async me(userId: string) {
    if (!userId) return { ok: false };
    const u = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true, fullName: true, role: true } });
    return u ?? { ok: false };
  }
}
