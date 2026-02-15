import { TenantProvisioningService } from '../services/tenant-provisioning/src/tenant-provisioning.service';

const [tenantName] = process.argv.slice(2);

if (!tenantName) {
  console.error('Usage: ts-node scripts/provision-tenant.ts <tenant-name>');
  process.exit(1);
}

const service = new TenantProvisioningService();

service
  .provisionTenant(tenantName)
  .then((result) => {
    console.log(`Tenant provisioned: ${result.tenant.name}`);
    console.log(`Postgres DB: ${result.tenant.postgresDb}`);
    console.log(`Mongo DB: ${result.tenant.mongoDb}`);
    console.log(`Qdrant Collection: ${result.tenant.qdrantCollection}`);
  })
  .catch((error) => {
    console.error('Provisioning failed:', error);
    process.exit(1);
  });
