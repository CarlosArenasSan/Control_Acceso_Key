"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwtExpiresInSeconds = exports.getJwtExpiresInMs = exports.getJwtExpiresIn = void 0;
const DEFAULT_JWT_EXPIRES_IN = '8h';
const UNIT_TO_MS = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
};
const getJwtExpiresIn = () => process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN;
exports.getJwtExpiresIn = getJwtExpiresIn;
const getJwtExpiresInMs = () => {
    const value = (0, exports.getJwtExpiresIn)();
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
exports.getJwtExpiresInMs = getJwtExpiresInMs;
const getJwtExpiresInSeconds = () => Math.floor((0, exports.getJwtExpiresInMs)() / 1000);
exports.getJwtExpiresInSeconds = getJwtExpiresInSeconds;
//# sourceMappingURL=env-duration.js.map