/* eslint-disable no-console */

const SCORPIO_URL = process.env.SCORPIO_URL || 'http://localhost:9090';
const TENANT = process.env.TENANT || 'alpha';
const ENTITY_ID =
  process.env.ENTITY_ID || `urn:ngsi-ld:TenantSeed:${TENANT}:bootstrap`;

const payload = {
  id: ENTITY_ID,
  type: 'TenantSeed',
  tenant: { type: 'Property', value: TENANT },
  '@context': {
    TenantSeed: 'https://freeflow.example.com/ontology#TenantSeed',
    tenant: 'https://freeflow.example.com/ontology#tenant',
    Property: 'https://uri.etsi.org/ngsi-ld/Property',
  },
};

async function main() {
  const response = await fetch(`${SCORPIO_URL}/ngsi-ld/v1/entities?options=update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/ld+json',
      'NGSILD-Tenant': TENANT,
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 409) {
    console.log(`Tenant bootstrap already exists for ${TENANT}`);
    return;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Tenant bootstrap failed: ${response.status} ${text}`);
  }

  console.log(`Tenant bootstrap entity upserted for ${TENANT}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
