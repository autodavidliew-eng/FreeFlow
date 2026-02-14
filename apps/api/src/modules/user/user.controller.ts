import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser, JwtAuthGuard, type AuthenticatedUser } from '@freeflow/auth';
import type { UserProfileDto } from './dto/user-profile.dto';
import { UserService } from './user.service';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user?: AuthenticatedUser): UserProfileDto | null {
    if (!user) {
      return null;
    }

    return this.userService.toUserProfile(user);
  }
}
