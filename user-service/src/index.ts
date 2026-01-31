require("dotenv").config();
import type {Request, Response} from "express";

const express = require("express");
const { connectDatabase, disconnectDatabase } = require("./config/database");
const userRoutes = require("./routes/user.routes").default;
const helmet = require('helmet');
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN?.split(",") || "*",
    credentials: true
}));

app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({limit: "10mb", extended: true}));

app.use(compression());

if (process.env.NODE_ENV === "development") {
    app.use(morgan("combined", { }));
}

app.use(userRoutes);

app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({
        status: "healthy",
        service: "user-service",
        timestamp: new Date().toISOString()
    })
});

app.use((err: any, req: Request, res: Response) => {
    res.status(500).json({
        status: "error",
        error: err
    })
});

async function startServer() {
    try {
        await connectDatabase();

        app.listen(PORT, () => {
            console.info(`user-service started on port ${PORT}`);
        })
    } catch (e) {
        console.error(`Failed to start user-service: ${e}`);
        process.exit(1);
    }
}

process.on("SIGTERM", async () => {
    await disconnectDatabase();
    process.exit(0);
})

process.on("SIGINT", async () => {
    await disconnectDatabase();
    process.exit(0);
});

startServer().then(() => null);

module.exports = app;
