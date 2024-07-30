import { exit } from 'process';

export const JWT_SECRET = process.env.JWT_SECRET;
export const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
export const DIRECTUS_TOKEN = process.env.DIRECTUS_TOKEN;
export const SESSION_LIFE = parseInt(process.env.SESSION_LIFE) | (60 * 60 * 24); // 1 day

function checkVariable(name: string) {
  if (!process.env[name]) {
    console.error(`[ERROR] Missing ${name} env variable`);
    return false;
  }

  return true;
}

/**
 * Ensure all required environment variables are present.
 */
export function validateEnvs() {
  const envs = ['JWT_SECRET', 'ADMIN_TOKEN', 'DIRECTUS_TOKEN'];

  if (!envs.map(checkVariable).every((e) => e)) {
    exit(1);
  }
}
