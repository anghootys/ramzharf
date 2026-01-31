import { Pool } from "pg";

let pool: Pool;

export const connectDatabase = async (): Promise<void> => {
    try {
        pool = new Pool({
            host: process.env.DB_HOST || "localhost",
            port: Number(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME || "note_db",
            user: process.env.DB_USER || "postgres",
            password: process.env.DB_PASSWORD || "postgres",
        });

        await pool.query("SELECT NOW()");
        console.info("PostgreSQL connected successfully");

        await initializeSchema();
    } catch (error) {
        console.error("Failed to connect to PostgreSQL:", error);
        process.exit(1);
    }
};

const initializeSchema = async (): Promise<void> => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS notes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id VARCHAR(255) NOT NULL,
            encrypted_content TEXT NOT NULL,
            salt VARCHAR(255) NOT NULL,
            expires_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
        CREATE INDEX IF NOT EXISTS idx_notes_expires_at ON notes(expires_at);
    `;

    await pool.query(createTableQuery);
    console.info("Database schema initialized");
};

export const getPool = (): Pool => {
    if (!pool) {
        throw new Error("Database not initialized");
    }
    return pool;
};

export const disconnectDatabase = async (): Promise<void> => {
    if (pool) {
        await pool.end();
        console.info("PostgreSQL disconnected");
    }
};

