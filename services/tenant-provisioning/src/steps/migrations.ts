import { spawn } from 'child_process';

const runCommand = (
  command: string,
  args: string[],
  env: Record<string, string | undefined>,
  cwd: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      env: {
        ...process.env,
        ...env,
      },
      stdio: 'inherit',
    });

    child.on('error', (error) => reject(error));
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed: ${command} ${args.join(' ')}`));
    });
  });

export const runTenantMigrations = async (input: {
  databaseUrl: string;
  repoRoot: string;
}): Promise<void> => {
  await runCommand(
    'pnpm',
    ['--filter', '@freeflow/db-postgres', 'db:deploy'],
    { DATABASE_URL: input.databaseUrl },
    input.repoRoot
  );

  await runCommand(
    'pnpm',
    ['--filter', '@freeflow/db-postgres', 'db:seed'],
    { DATABASE_URL: input.databaseUrl },
    input.repoRoot
  );
};
