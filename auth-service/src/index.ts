import "dotenv/config";
import type {Request, Response} from "express";
import type {Server} from "node:http";
import routes from "./routes/auth.routes.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";

import express from "express";
import helmet from 'helmet';
import cors from "cors";
import morgan from "morgan";
import compression from "compression";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN?.split(",") || "*",
    credentials: true
}));

app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({limit: "10mb", extended: true}));

app.use(compression());

if (process.env.NODE_ENV === "development") {
    app.use(morgan("combined", {}));
}

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        status: "healthy",
        service: "auth-service",
        timestamp: new Date().toISOString()
    })
});

app.use(routes);

// 404 handler (must be after all routes)
app.use((req: Request, res: Response) => {
    res.status(404).json({
        status: "error",
        message: "Not Found",
        path: req.originalUrl
    });
});

let server: Server | undefined;

async function startServer() {
    try {
        // Connect to database first
        await connectDatabase();

        server = app.listen(PORT, () => {
            console.info(`auth-service started on port ${PORT}`);
        });

        server.on("error", (err) => {
            console.error("HTTP server error:", err);
        });
    } catch (e) {
        console.error(`Failed to start Auth-Service: ${e}`);
        process.exit(1);
    }
}

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught exception:", err);
    process.exit(1);
});

process.on("SIGTERM", async () => {
    console.info("SIGTERM received, shutting down gracefully...");
    await disconnectDatabase();
    server?.close(() => process.exit(0));
});

process.on("SIGINT", async () => {
    console.info("SIGINT received, shutting down gracefully...");
    await disconnectDatabase();
    server?.close(() => process.exit(0));
});

startServer().then(() => null);

export default app;
