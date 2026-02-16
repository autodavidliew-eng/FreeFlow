/* eslint-disable no-console */

const SCORPIO_URL = process.env.SCORPIO_URL || 'http://localhost:9090';
const TENANT = process.env.TENANT || 'alpha';

function getArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index !== -1 && process.argv[index + 1]) {
    return process.argv[index + 1];
  }
  return undefined;
}

const subscriptionId =
  process.env.SUBSCRIPTION_ID ||
  getArg('id') ||
  'urn:ngsi-ld:Subscription:alpha:emeter-001';

async function main() {
  const response = await fetch(
    `${SCORPIO_URL}/ngsi-ld/v1/subscriptions/${encodeURIComponent(subscriptionId)}`,
    {
      method: 'DELETE',
      headers: {
        'NGSILD-Tenant': TENANT,
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to delete subscription: ${response.status} ${text}`);
  }

  console.log(`Subscription deleted: ${subscriptionId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
