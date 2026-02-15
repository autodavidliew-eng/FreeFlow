import { listTenantsByNamePrefix } from '../services/tenant-provisioning/src/master-db';
import { TenantRemovalService } from '../services/tenant-provisioning/src/tenant-removal.service';

const args = process.argv.slice(2);
const prefixIndex = args.indexOf('--prefix');
const prefix = prefixIndex >= 0 ? args[prefixIndex + 1] : undefined;

if (!prefix) {
  console.error(
    'Usage: ts-node scripts/cleanup-tenants.ts --prefix <namePrefix> [--include-active]'
  );
  process.exit(1);
}

const includeActive = args.includes('--include-active');

const service = new TenantRemovalService();

const run = async (): Promise<void> => {
  const tenants = await listTenantsByNamePrefix(prefix);
  const targets = includeActive
    ? tenants
    : tenants.filter((tenant) => tenant.status !== 'active');

  if (targets.length === 0) {
    console.log('No tenants matched cleanup criteria.');
    return;
  }

  console.log(`Removing ${targets.length} tenant(s) with prefix '${prefix}'.`);

  for (const tenant of targets) {
    console.log(`Removing tenant ${tenant.name} (${tenant.id})...`);
    await service.removeTenant(tenant.id, 'hard', true);
  }

  console.log('Cleanup complete.');
};

run().catch((error) => {
  console.error('Cleanup failed:', error);
  process.exit(1);
});
