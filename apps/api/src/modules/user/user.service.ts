import type { AuthenticatedUser } from '@freeflow/auth';
import { Injectable } from '@nestjs/common';
import type { UserProfileDto } from './dto/user-profile.dto';

@Injectable()
export class UserService {
  toUserProfile(user: AuthenticatedUser): UserProfileDto {
    return {
      id: user.sub,
      email: user.email,
      name: user.name,
      roles: user.roles,
      freeflowRoles: user.freeflowRoles,
    };
  }
}
