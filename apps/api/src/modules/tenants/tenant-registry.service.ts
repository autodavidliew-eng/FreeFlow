import { prisma } from '@freeflow/db-master';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  TenantCreateRequestDto,
  TenantDto,
  TenantListResponseDto,
  TenantStatusDto,
} from './dto/tenant.dto';

const TENANT_NAME_PATTERN = /^[a-z0-9]{3,30}$/;

const buildTenantNames = (tenantName: string) => {
  const base = `freeflow_${tenantName}`;

  return {
    realmName: `freeflow-${tenantName}`,
    postgresDb: base,
    mongoDb: base,
    qdrantCollection: `${base}_vectors`,
  };
};

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

    const names = buildTenantNames(tenantKey);

    const tenantRows = await prisma.$queryRaw<TenantRecord[]>`
      INSERT INTO "Tenant" (
        "name",
        "realmName",
        "postgresDb",
        "mongoDb",
        "qdrantCollection",
        "updatedAt"
      )
      VALUES (
        ${tenantKey},
        ${names.realmName},
        ${names.postgresDb},
        ${names.mongoDb},
        ${names.qdrantCollection},
        NOW()
      )
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
      throw new BadRequestException('Failed to create tenant.');
    }

    return toTenantDto(tenant);
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
}
