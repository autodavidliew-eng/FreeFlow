/* eslint-disable no-console */

const SCORPIO_URL = process.env.SCORPIO_URL || 'http://localhost:9090';
const TENANT = process.env.TENANT || 'alpha';
const CONTEXT_URL =
  process.env.CONTEXT_URL || 'http://localhost:8090/context/freeflow-energy.jsonld';
const CORE_CONTEXT_URL =
  process.env.CORE_CONTEXT_URL ||
  'http://localhost:8090/context/ngsi-ld-core-context.jsonld';
const CONSUMER_URL = process.env.CONSUMER_URL || 'http://localhost:8092/notify/ngsi-ld';
const METER_ID = process.env.METER_ID || 'emeter-001';
const subscription = {
  id: `urn:ngsi-ld:Subscription:${TENANT}:${METER_ID}`,
  type: 'Subscription',
  entities: [
    {
      type: 'SmartMeterMeasurement',
    },
  ],
  q: `meter==urn:ngsi-ld:SmartMeter:${TENANT}:${METER_ID}`,
  notification: {
    endpoint: {
      uri: CONSUMER_URL,
      accept: 'application/ld+json',
    },
  },
  throttling: 1,
  '@context': [CONTEXT_URL, CORE_CONTEXT_URL],
};

async function main() {
  const response = await fetch(`${SCORPIO_URL}/ngsi-ld/v1/subscriptions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/ld+json',
      'NGSILD-Tenant': TENANT,
    },
    body: JSON.stringify(subscription),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to create subscription: ${response.status} ${text}`);
  }

  const location = response.headers.get('location');
  console.log('Subscription created', location || subscription.id);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
