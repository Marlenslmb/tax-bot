import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../shared/prisma.service.js';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async validate(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const ok = await argon2.verify(user.password, password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.validate(email, password);
    return this.signTokens(user.id, user.role);
  }

  async register(email: string, password: string, fullName: string) {
    const hash = await argon2.hash(password);
    const user = await this.prisma.user.create({
      data: { email, password: hash, fullName }
    });
    return this.signTokens(user.id, user.role);
  }

  private async signTokens(sub: string, role: string) {
    const payload = { sub, role };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_TTL || '15m',
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.REFRESH_TTL || '7d',
    });
    return { accessToken, refreshToken };
  }
}
