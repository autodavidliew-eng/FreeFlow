import { JwtAuthGuard } from '@freeflow/auth';
import { PermissionGuard, RequirePermission } from '@freeflow/rbac';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import { TenantCreateRequestDto } from './dto/tenant.dto';
import type { TenantDto, TenantListResponseDto } from './dto/tenant.dto';
import { TenantRegistryService } from './tenant-registry.service';

@Controller('tenants')
@UseGuards(JwtAuthGuard, PermissionGuard)
@RequirePermission('system:*')
export class TenantsController {
  constructor(private readonly tenantRegistry: TenantRegistryService) {}

  @Post()
  createTenant(@Body() payload: TenantCreateRequestDto): Promise<TenantDto> {
    return this.tenantRegistry.createTenant(payload);
  }

  @Get()
  listTenants(): Promise<TenantListResponseDto> {
    return this.tenantRegistry.listTenants();
  }

  @Delete(':id')
  deleteTenant(
    @Param('id') id: string,
    @Query('mode') mode?: 'soft' | 'hard',
    @Query('force') force?: string
  ): Promise<TenantDto> {
    const resolvedMode = mode === 'hard' ? 'hard' : 'soft';
    const resolvedForce = force === 'true' || force === '1';

    return this.tenantRegistry.removeTenant(id, resolvedMode, resolvedForce);
  }
}
