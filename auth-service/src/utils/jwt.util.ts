import jwt from "jsonwebtoken";

export interface TokenPayload {
    userId: string;
    username: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
    const secret = process.env.REFRESH_TOKEN_SECRET;
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

    if (!secret) {
        throw new Error("REFRESH_TOKEN_SECRET is not defined");
    }

    return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): TokenPayload => {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not defined");
    }

    return jwt.verify(token, secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
    const secret = process.env.REFRESH_TOKEN_SECRET;

    if (!secret) {
        throw new Error("REFRESH_TOKEN_SECRET is not defined");
    }

    return jwt.verify(token, secret) as TokenPayload;
};

