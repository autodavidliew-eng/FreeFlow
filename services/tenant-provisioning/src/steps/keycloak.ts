import fs from 'fs/promises';

import type { KeycloakAdminClient } from '@freeflow/keycloak-admin';

export const ensureKeycloakRealm = async (input: {
  client: KeycloakAdminClient;
  realmName: string;
  displayName: string;
  templatePath: string;
}): Promise<void> => {
  const exists = await input.client.realmExists(input.realmName);
  if (exists) {
    return;
  }

  const raw = await fs.readFile(input.templatePath, 'utf8');
  const template = JSON.parse(raw) as Record<string, unknown>;

  template.realm = input.realmName;
  template.displayName = input.displayName;
  template.displayNameHtml = `<div class="kc-logo-text"><span>${input.displayName}</span></div>`;

  if ('id' in template) {
    template.id = input.realmName;
  }

  await input.client.createRealm(template);
};
