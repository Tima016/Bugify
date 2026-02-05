import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
    sub: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}

/**
 * Decode JWT token and extract payload
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
    try {
        const decoded = jwtDecode<JWTPayload>(token);
        return decoded;
    } catch (error) {
        console.error('Failed to decode JWT:', error);
        return null;
    }
}

/**
 * Extract user role from JWT token
 * @param token - JWT token string
 * @returns User role (RESEARCHER, COMPANY, ADMIN) or null
 */
export function getRoleFromToken(token: string | null): string | null {
    if (!token) return null;

    const decoded = decodeJWT(token);
    return decoded?.role || null;
}

/**
 * Check if JWT token is expired
 * @param token - JWT token string
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string | null): boolean {
    if (!token) return true;

    const decoded = decodeJWT(token);
    if (!decoded) return true;

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
}

/**
 * Extract user ID from JWT token
 * @param token - JWT token string
 * @returns User ID or null
 */
export function getUserIdFromToken(token: string | null): string | null {
    if (!token) return null;

    const decoded = decodeJWT(token);
    return decoded?.sub || null;
}
