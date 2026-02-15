import fs from 'fs/promises';

export const ensureTenantStorage = async (
  rootPath: string,
  tenantName: string
): Promise<void> => {
  const fullPath = `${rootPath}/${tenantName}`;
  await fs.mkdir(fullPath, { recursive: true });
};

export const removeTenantStorage = async (
  rootPath: string,
  tenantName: string
): Promise<void> => {
  const fullPath = `${rootPath}/${tenantName}`;
  await fs.rm(fullPath, { recursive: true, force: true });
};
