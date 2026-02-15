import { redirect } from 'next/navigation';

import { PageContainer } from '../../../components/layout/PageContainer';
import { ProfileTabs } from '../../../components/profile/ProfileTabs';
import { decodeJwtPayload, type JwtPayload } from '../../../lib/auth/jwt';
import { readSession } from '../../../lib/auth/session';
import { getCurrentUser } from '../../../lib/auth/user';

const resolveTenantLabel = (payload: JwtPayload | null) => {
  if (!payload) {
    return undefined;
  }

  const tenantClaim = payload['tenant'];
  if (tenantClaim && typeof tenantClaim === 'object') {
    const tenantObj = tenantClaim as Record<string, unknown>;
    const tenantName = tenantObj.name;
    const tenantRealm = tenantObj.realm;
    const tenantId = tenantObj.id;

    if (typeof tenantName === 'string' && tenantName.trim()) {
      return tenantName;
    }
    if (typeof tenantRealm === 'string' && tenantRealm.trim()) {
      return tenantRealm;
    }
    if (typeof tenantId === 'string' && tenantId.trim()) {
      return tenantId;
    }
  }

  const realm = payload['realm'];
  if (typeof realm === 'string' && realm.trim()) {
    return realm;
  }

  const realmName = payload['realmName'];
  if (typeof realmName === 'string' && realmName.trim()) {
    return realmName;
  }

  const tenantName = payload['tenantName'];
  if (typeof tenantName === 'string' && tenantName.trim()) {
    return tenantName;
  }

  const issuer = payload['iss'];
  if (typeof issuer === 'string') {
    const match = issuer.match(/\/realms\/([^/]+)/);
    if (match && match[1]) {
      return match[1];
    }
  }

  return undefined;
};

export default async function ProfilePage() {
  const session = await readSession();

  if (!session) {
    redirect('/auth/login');
  }

  const user = await getCurrentUser();
  const payload = decodeJwtPayload(session.accessToken);
  const tenant = resolveTenantLabel(payload);

  return (
    <PageContainer
      title="Account Details"
      subtitle="Review your profile information and security status."
    >
      <ProfileTabs
        name={user?.name ?? user?.preferredUsername}
        email={user?.email}
        roles={user?.roles ?? []}
        tenant={tenant}
        expiresAt={
          session.expiresAt
            ? new Date(session.expiresAt * 1000).toISOString()
            : undefined
        }
      />
    </PageContainer>
  );
}
