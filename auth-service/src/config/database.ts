import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/auth_db";

        await mongoose.connect(mongoUri);

        console.info("✅ MongoDB connected successfully");

        mongoose.connection.on("error", (err) => {
            console.error("MongoDB connection error:", err);
        });

        mongoose.connection.on("disconnected", () => {
            console.warn("MongoDB disconnected");
        });
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
        process.exit(1);
    }
};

export const disconnectDatabase = async (): Promise<void> => {
    try {
        await mongoose.connection.close();
        console.info("MongoDB disconnected");
    } catch (error) {
        console.error("Error disconnecting from MongoDB:", error);
    }
};

