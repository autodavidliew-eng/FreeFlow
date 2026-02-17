import { JwtAuthGuard } from '@freeflow/auth';
import { PermissionGuard, RequirePermission } from '@freeflow/rbac';
import { Body, Controller, Get, Param, Put, UseGuards } from '@nestjs/common';

import { RoleAccessUpdateDto } from './dto/role-access.dto';
import type {
  RoleAccessSnapshotDto,
  RoleAccessUpdateResponseDto,
} from './dto/role-access.dto';
import { RoleAccessService } from './role-access.service';

@Controller('access-control')
export class AccessController {
  constructor(private readonly roleAccess: RoleAccessService) {}

  @Get('roles')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('settings:*')
  getRoleAccess(): Promise<RoleAccessSnapshotDto> {
    return this.roleAccess.getRoleAccessSnapshot();
  }

  @Put('roles/:role')
  @UseGuards(JwtAuthGuard, PermissionGuard)
  @RequirePermission('settings:*')
  updateRoleAccess(
    @Param('role') role: string,
    @Body() payload: RoleAccessUpdateDto
  ): Promise<RoleAccessUpdateResponseDto> {
    return this.roleAccess.updateRoleAccess(role, payload);
  }
}
