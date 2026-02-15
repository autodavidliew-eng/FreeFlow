import { prisma } from '@freeflow/db-master';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { Request } from 'express';

import type { TenantStatusDto } from './dto/tenant.dto';
import type { TenantContext } from './tenant-context';

const TENANT_NAME_PATTERN = /^[a-z0-9]{3,30}$/;
const DEFAULT_TENANT_HEADER = 'x-tenant-id';
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type TenantRecord = {
  id: string;
  name: string;
  realmName: string;
  postgresDb: string;
  mongoDb: string;
  qdrantCollection: string;
  status: string;
};

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function normalizeHeaderName(name: string): string {
  return name.trim().toLowerCase();
}

function getHeaderValue(
  headers: Request['headers'],
  name: string
): string | null {
  const raw = headers[name];
  if (!raw) {
    return null;
  }

  if (Array.isArray(raw)) {
    const entry = raw.find((value) => value && value.trim().length > 0);
    return entry ? entry.trim() : null;
  }

  const value = raw.trim();
  return value.length > 0 ? value : null;
}

function extractBearerToken(request: Request): string | null {
  const header = request.headers.authorization;
  if (!header) {
    return null;
  }

  if (Array.isArray(header)) {
    const entry = header.find((value) => value.startsWith('Bearer '));
    return entry ? entry.slice(7).trim() : null;
  }

  if (!header.startsWith('Bearer ')) {
    return null;
  }

  return header.slice(7).trim();
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  const payload = parts[1];

  try {
    return JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf-8')
    ) as Record<string, unknown>;
  } catch {
    try {
      const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
      return JSON.parse(
        Buffer.from(normalized, 'base64').toString('utf-8')
      ) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

function extractRealmFromIssuer(issuer: string): string | null {
  const marker = '/realms/';
  const index = issuer.lastIndexOf(marker);
  if (index === -1) {
    return null;
  }

  const remainder = issuer.slice(index + marker.length);
  const [realm] = remainder.split('/');
  return realm || null;
}

function extractHost(headers: Request['headers']): string | null {
  const forwarded = headers['x-forwarded-host'];
  const hostHeader = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const directHost = Array.isArray(headers.host)
    ? headers.host[0]
    : headers.host;
  const raw = hostHeader ?? directHost;
  if (!raw) {
    return null;
  }

  return raw.split(',')[0].trim();
}

@Injectable()
export class TenantResolverService {
  private readonly headerName: string;
  private readonly headerEnabled: boolean;
  private readonly baseDomain?: string;

  constructor() {
    this.headerName = normalizeHeaderName(
      process.env.TENANT_HEADER_NAME ?? DEFAULT_TENANT_HEADER
    );

    const headerToggle = process.env.TENANT_HEADER_ENABLED;
    this.headerEnabled =
      headerToggle === undefined
        ? true
        : !['false', '0', 'no'].includes(headerToggle.toLowerCase());

    const baseDomain = process.env.TENANT_BASE_DOMAIN?.trim().toLowerCase();
    this.baseDomain =
      baseDomain && baseDomain.length > 0 ? baseDomain : undefined;
  }

  async resolveTenant(request: Request): Promise<TenantContext> {
    const headerValue = this.headerEnabled
      ? getHeaderValue(request.headers, this.headerName)
      : null;
    const subdomainValue = this.extractSubdomain(request);
    const realmValue = this.extractRealmFromRequest(request);

    if (!headerValue && !subdomainValue && !realmValue) {
      throw new BadRequestException('Missing tenant identifier.');
    }

    const resolved: TenantRecord[] = [];

    if (headerValue) {
      const tenant = await this.resolveByHeader(headerValue);
      if (!tenant) {
        throw new NotFoundException('Tenant not found for header identifier.');
      }
      resolved.push(tenant);
    }

    if (subdomainValue) {
      const tenant = await this.resolveBySubdomain(subdomainValue);
      if (!tenant) {
        throw new NotFoundException('Tenant not found for subdomain.');
      }
      resolved.push(tenant);
    }

    if (realmValue) {
      const tenant = await this.resolveByRealm(realmValue);
      if (!tenant) {
        throw new NotFoundException('Tenant not found for realm issuer.');
      }
      resolved.push(tenant);
    }

    if (resolved.length === 0) {
      throw new NotFoundException('Tenant not found.');
    }

    const [firstTenant] = resolved;
    const mismatch = resolved.find((tenant) => tenant.id !== firstTenant.id);
    if (mismatch) {
      throw new BadRequestException('Conflicting tenant identifiers provided.');
    }

    this.ensureTenantActive(firstTenant);
    return this.toTenantContext(firstTenant);
  }

  private async resolveByHeader(value: string): Promise<TenantRecord | null> {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    if (isUuid(trimmed)) {
      return this.findTenantById(trimmed);
    }

    const name = trimmed.toLowerCase();
    this.ensureValidTenantName(name, 'header');
    return this.findTenantByName(name);
  }

  private async resolveBySubdomain(
    value: string
  ): Promise<TenantRecord | null> {
    const name = value.trim().toLowerCase();
    if (!name) {
      return null;
    }

    this.ensureValidTenantName(name, 'subdomain');
    return this.findTenantByName(name);
  }

  private async resolveByRealm(value: string): Promise<TenantRecord | null> {
    const realmName = value.trim();
    if (!realmName) {
      return null;
    }

    return this.findTenantByRealm(realmName);
  }

  private extractSubdomain(request: Request): string | null {
    if (!this.baseDomain) {
      return null;
    }

    const host = extractHost(request.headers);
    if (!host) {
      return null;
    }

    const hostname = host.split(':')[0]?.toLowerCase();
    if (!hostname || !hostname.endsWith(this.baseDomain)) {
      return null;
    }

    const prefix = hostname.slice(0, hostname.length - this.baseDomain.length);
    if (!prefix || prefix === '.') {
      return null;
    }

    const subdomain = prefix.endsWith('.') ? prefix.slice(0, -1) : prefix;
    if (!subdomain || subdomain.includes('.')) {
      return null;
    }

    return subdomain;
  }

  private extractRealmFromRequest(request: Request): string | null {
    const token = extractBearerToken(request);
    if (!token) {
      return null;
    }

    const payload = decodeJwtPayload(token);
    const issuer = payload?.iss;
    if (typeof issuer !== 'string') {
      return null;
    }

    return extractRealmFromIssuer(issuer);
  }

  private ensureValidTenantName(name: string, source: string) {
    if (!TENANT_NAME_PATTERN.test(name)) {
      throw new BadRequestException(
        `Invalid tenant ${source} identifier format.`
      );
    }
  }

  private ensureTenantActive(tenant: TenantRecord) {
    const status = tenant.status as TenantStatusDto;
    if (status === 'active') {
      return;
    }

    if (status === 'deleted') {
      throw new NotFoundException('Tenant is deleted.');
    }

    throw new ForbiddenException(`Tenant is ${status}.`);
  }

  private toTenantContext(tenant: TenantRecord): TenantContext {
    return {
      id: tenant.id,
      name: tenant.name,
      realmName: tenant.realmName,
      postgresDb: tenant.postgresDb,
      mongoDb: tenant.mongoDb,
      qdrantCollection: tenant.qdrantCollection,
      status: tenant.status as TenantStatusDto,
    };
  }

  private async findTenantById(id: string): Promise<TenantRecord | null> {
    const rows = await prisma.$queryRaw<TenantRecord[]>`
      SELECT
        "id",
        "name",
        "realmName",
        "postgresDb",
        "mongoDb",
        "qdrantCollection",
        "status"
      FROM "Tenant"
      WHERE "id" = ${id}
      LIMIT 1;
    `;

    return rows[0] ?? null;
  }

  private async findTenantByName(name: string): Promise<TenantRecord | null> {
    const rows = await prisma.$queryRaw<TenantRecord[]>`
      SELECT
        "id",
        "name",
        "realmName",
        "postgresDb",
        "mongoDb",
        "qdrantCollection",
        "status"
      FROM "Tenant"
      WHERE "name" = ${name}
      LIMIT 1;
    `;

    return rows[0] ?? null;
  }

  private async findTenantByRealm(
    realmName: string
  ): Promise<TenantRecord | null> {
    const rows = await prisma.$queryRaw<TenantRecord[]>`
      SELECT
        "id",
        "name",
        "realmName",
        "postgresDb",
        "mongoDb",
        "qdrantCollection",
        "status"
      FROM "Tenant"
      WHERE "realmName" = ${realmName}
      LIMIT 1;
    `;

    return rows[0] ?? null;
  }
}
