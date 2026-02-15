import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { TenantCreateRequestDto } from './dto/tenant.dto';
import type { TenantDto, TenantListResponseDto } from './dto/tenant.dto';
import { TenantRegistryService } from './tenant-registry.service';

@Controller('tenants')
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
  deleteTenant(@Param('id') id: string): Promise<TenantDto> {
    return this.tenantRegistry.deleteTenant(id);
  }
}
