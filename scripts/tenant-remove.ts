import { TenantRemovalService } from '../services/tenant-provisioning/src/tenant-removal.service';

const [tenantId, modeArg, ...rest] = process.argv.slice(2);

if (!tenantId) {
  console.error(
    'Usage: ts-node scripts/tenant-remove.ts <tenant-id> [soft|hard] [--force]'
  );
  process.exit(1);
}

const mode = modeArg === 'hard' ? 'hard' : 'soft';
const force = rest.includes('--force');

const service = new TenantRemovalService();

service
  .removeTenant(tenantId, mode, force)
  .then((tenant) => {
    console.log(`Tenant removal completed: ${tenant.name}`);
  })
  .catch((error) => {
    console.error('Tenant removal failed:', error);
    process.exit(1);
  });
