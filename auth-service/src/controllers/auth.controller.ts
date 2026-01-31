import type { Request, Response } from "express";
import i18next from "../locales/index.js";
import { User } from "../models/user.model.js";
import {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
} from "../utils/jwt.util.js";
import { syncUserProfile } from "../utils/user-sync.util.js";

export const register = async (req: Request, res: Response) => {
    const t = i18next(req.headers["accept-language"]);

    try {
        const { username, password, confirmPassword } = req.body;

        // Validate input
        if (!username || !password || !confirmPassword) {
            return res.status(400).json({
                status: "error",
                message: t("auth.register.fields_required")
            });
        }

        // Validate password match
        if (password !== confirmPassword) {
            return res.status(400).json({
                status: "error",
                message: t("auth.register.password_mismatch"),
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({
                status: "error",
                message: t("auth.register.password_length")
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({
                status: "error",
                message: t("auth.register.username_taken"),
            });
        }

        // Create new user
        const user = await User.create({
            username,
            password,
        });

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user._id.toString(),
            username: user.username,
        });
        const refreshToken = generateRefreshToken({
            userId: user._id.toString(),
            username: user.username,
        });

        // Save refresh token to database
        user.refreshToken = refreshToken;
        await user.save();

        // Sync user profile with user-service
        await syncUserProfile(user._id.toString(), user.username);

        res.status(201).json({
            status: "success",
            message: t("auth.register.success"),
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error("Register error:", error);
        res.status(400).json({
            status: "error",
            message: t("auth.register.failed"),
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const login = async (req: Request, res: Response) => {
    const t = i18next(req.headers["accept-language"]);

    try {
        const { username, password } = req.body;

        // Validate input
        if (!username || !password) {
            return res.status(400).json({
                status: "error",
                message: t("auth.login.fields_required"),
            });
        }

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: t("auth.login.failed"),
            });
        }

        // Check if account is locked
        if (user.isLocked()) {
            return res.status(423).json({
                status: "error",
                message: t("auth.login.account_locked"),
            });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            // Increment login attempts
            const maxAttempts = Number(process.env.MAX_LOGIN_ATTEMPTS) || 5;
            const lockTime = Number(process.env.LOCK_TIME) || 30; // minutes

            user.loginAttempts += 1;

            if (user.loginAttempts >= maxAttempts) {
                user.lockUntil = Date.now() + lockTime * 60 * 1000;
            }

            await user.save();

            return res.status(401).json({
                status: "error",
                message: t("auth.login.failed"),
            });
        }

        // Reset login attempts on successful login
        if (user.loginAttempts > 0 || user.lockUntil) {
            user.loginAttempts = 0;
            user.lockUntil = null as any;
        }

        // Generate tokens
        const accessToken = generateAccessToken({
            userId: user._id.toString(),
            username: user.username,
        });
        const refreshToken = generateRefreshToken({
            userId: user._id.toString(),
            username: user.username,
        });

        // Save refresh token
        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            status: "success",
            message: t("auth.login.success"),
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                },
                accessToken,
                refreshToken,
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(400).json({
            status: "error",
            message: t("auth.login.failed"),
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const refresh = async (req: Request, res: Response) => {
    const t = i18next(req.headers["accept-language"]);

    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                status: "error",
                message: "Refresh token is required",
            });
        }

        // Verify refresh token
        const decoded = verifyRefreshToken(refreshToken);

        // Find user and verify refresh token
        const user = await User.findById(decoded.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({
                status: "error",
                message: "Invalid refresh token",
            });
        }

        // Generate new tokens
        const newAccessToken = generateAccessToken({
            userId: user._id.toString(),
            username: user.username,
        });
        const newRefreshToken = generateRefreshToken({
            userId: user._id.toString(),
            username: user.username,
        });

        // Update refresh token in database
        user.refreshToken = newRefreshToken;
        await user.save();

        res.status(200).json({
            status: "success",
            message: t("auth.refresh.success"),
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
            },
        });
    } catch (error) {
        console.error("Refresh error:", error);
        res.status(401).json({
            status: "error",
            message: t("auth.refresh.failed"),
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const logout = async (req: Request, res: Response) => {
    const t = i18next(req.headers["accept-language"]);

    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                status: "error",
                message: "Refresh token is required",
            });
        }

        // Find user and clear refresh token
        const user = await User.findOne({ refreshToken });
        if (user) {
            user.refreshToken = null as any;
            await user.save();
        }

        res.status(200).json({
            status: "success",
            message: t("auth.logout.success"),
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(400).json({
            status: "error",
            message: t("auth.logout.failed"),
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};

export const verify = async (req: Request, res: Response) => {
    const t = i18next(req.headers["accept-language"]);

    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: "error",
                message: "Authorization header is required",
            });
        }

        const token = authHeader.substring(7);

        // Verify access token
        const decoded = verifyAccessToken(token);

        // Find user
        const user = await User.findById(decoded.userId).select("-password -refreshToken");
        if (!user) {
            return res.status(401).json({
                status: "error",
                message: t("auth.token_verify.failed"),
            });
        }

        res.status(200).json({
            status: "success",
            message: t("auth.token_verify.success"),
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                },
            },
        });
    } catch (error) {
        console.error("Verify error:", error);
        res.status(401).json({
            status: "error",
            message: t("auth.token_verify.failed"),
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
