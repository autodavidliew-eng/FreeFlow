import type { FreeFlowRole, KeycloakToken } from '@freeflow/auth-contract';

export type AuthenticatedUser = {
  sub: string;
  email?: string;
  name?: string;
  roles: string[];
  freeflowRoles: FreeFlowRole[];
  token: string;
  claims: KeycloakToken;
};
