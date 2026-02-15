import { prisma } from '@freeflow/db-master';
import { TenantProvisioningService } from '@freeflow/tenant-provisioning';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import type {
  TenantCreateRequestDto,
  TenantDto,
  TenantListResponseDto,
  TenantStatusDto,
} from './dto/tenant.dto';

const TENANT_NAME_PATTERN = /^[a-z0-9]{3,30}$/;

type TenantRecord = {
  id: string;
  name: string;
  realmName: string;
  postgresDb: string;
  mongoDb: string;
  qdrantCollection: string;
  status: string;
  createdAt: Date | string;
  updatedAt: Date | string;
};

const toTenantDto = (tenant: TenantRecord): TenantDto => ({
  id: tenant.id,
  name: tenant.name,
  realmName: tenant.realmName,
  postgresDb: tenant.postgresDb,
  mongoDb: tenant.mongoDb,
  qdrantCollection: tenant.qdrantCollection,
  status: tenant.status as TenantStatusDto,
  createdAt: new Date(tenant.createdAt).toISOString(),
  updatedAt: new Date(tenant.updatedAt).toISOString(),
});

@Injectable()
export class TenantRegistryService {
  private provisioningService?: TenantProvisioningService;

  async createTenant(payload: TenantCreateRequestDto): Promise<TenantDto> {
    const rawName = payload?.name?.trim();

    if (!rawName) {
      throw new BadRequestException('Tenant name is required.');
    }

    const tenantKey = rawName.toLowerCase();

    if (!TENANT_NAME_PATTERN.test(tenantKey)) {
      throw new BadRequestException(
        'Tenant name must be 3-30 lowercase letters or digits with no spaces.'
      );
    }

    try {
      const provisioningService = this.getProvisioningService();
      const result = await provisioningService.provisionTenant(tenantKey);

      return toTenantDto(result.tenant as TenantRecord);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Tenant provisioning failed.';
      throw new InternalServerErrorException(message);
    }
  }

  async listTenants(): Promise<TenantListResponseDto> {
    const tenants = await prisma.$queryRaw<TenantRecord[]>`
      SELECT
        "id",
        "name",
        "realmName",
        "postgresDb",
        "mongoDb",
        "qdrantCollection",
        "status",
        "createdAt",
        "updatedAt"
      FROM "Tenant"
      ORDER BY "createdAt" DESC;
    `;

    return {
      items: tenants.map(toTenantDto),
      total: tenants.length,
    };
  }

  async deleteTenant(id: string): Promise<TenantDto> {
    const tenantRows = await prisma.$queryRaw<TenantRecord[]>`
      DELETE FROM "Tenant"
      WHERE "id" = ${id}
      RETURNING
        "id",
        "name",
        "realmName",
        "postgresDb",
        "mongoDb",
        "qdrantCollection",
        "status",
        "createdAt",
        "updatedAt";
    `;

    const tenant = tenantRows[0];

    if (!tenant) {
      throw new NotFoundException('Tenant not found.');
    }

    return toTenantDto(tenant);
  }

  private getProvisioningService(): TenantProvisioningService {
    if (!this.provisioningService) {
      this.provisioningService = new TenantProvisioningService();
    }

    return this.provisioningService;
  }
}
