const DEFAULT_JWT_EXPIRES_IN = '8h';

const UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export const getJwtExpiresIn = (): string =>
  process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN;

export const getJwtExpiresInMs = (): number => {
  const value = getJwtExpiresIn();
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(value);

  if (match) {
    const [, amount, unit] = match;
    return Number(amount) * UNIT_TO_MS[unit];
  }

  const numeric = Number(value);

  if (!Number.isNaN(numeric)) {
    return numeric * 1000;
  }

  throw new Error(`JWT_EXPIRES_IN inválido: ${value}`);
};

export const getJwtExpiresInSeconds = (): number =>
  Math.floor(getJwtExpiresInMs() / 1000);
