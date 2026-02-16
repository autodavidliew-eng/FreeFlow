import nock from 'nock';
import fetch from 'node-fetch';
import { NgsiLdClient } from '../src/client';

describe('NgsiLdClient', () => {
  const baseUrl = 'http://scorpio.test';
  const client = new NgsiLdClient({
    baseUrl,
    tenant: 'alpha',
    fetchImpl: fetch as unknown as typeof globalThis.fetch,
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('upserts entities with tenant header and content-type', async () => {
    const entity = {
      id: 'urn:ngsi-ld:SmartMeter:alpha:emeter-001',
      type: 'SmartMeter',
      '@context': ['http://example.com/context.jsonld'],
    };

    const scope = nock(baseUrl, {
      reqheaders: {
        'ngsild-tenant': 'alpha',
        'content-type': 'application/ld+json',
      },
    })
      .post('/ngsi-ld/v1/entities')
      .query({ options: 'update' })
      .reply(204);

    await client.upsertEntity(entity);
    scope.done();
  });

  it('creates subscriptions', async () => {
    const subscription = {
      id: 'urn:ngsi-ld:Subscription:alpha:emeter-001',
      type: 'Subscription',
    };

    const scope = nock(baseUrl, {
      reqheaders: {
        'ngsild-tenant': 'alpha',
        'content-type': 'application/ld+json',
      },
    })
      .post('/ngsi-ld/v1/subscriptions')
      .reply(201, { id: subscription.id });

    const response = await client.createSubscription(subscription);
    expect(response).toEqual({ id: subscription.id });
    scope.done();
  });

  it('deletes subscriptions', async () => {
    const scope = nock(baseUrl, {
      reqheaders: {
        'ngsild-tenant': 'alpha',
      },
    })
      .delete('/ngsi-ld/v1/subscriptions/sub-123')
      .reply(204);

    await client.deleteSubscription('sub-123');
    scope.done();
  });
});
