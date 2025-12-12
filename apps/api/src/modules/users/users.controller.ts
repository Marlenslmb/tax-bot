import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  me(@Req() req: any) {
    return this.users.me(req.user?.userId);
  }
}
