import { exit } from 'process';

export const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;

function checkVariable(name: string) {
  if (process.env[name] === undefined) {
    console.error(`[ERROR] Missing ${name} env variable`);
    return false;
  }

  return true;
}

/**
 * Ensure all required environment variables are present.
 */
export function validateEnvs() {
  const envs = ['DIRECTUS_TOKEN'];

  if (!envs.map(checkVariable).every((e) => e)) {
    exit(1);
  }
}
