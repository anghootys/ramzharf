import { getPool } from "../config/database";

export interface User {
    id: string;
    username: string;
    created_at: Date;
}

export const createUser = async (id: string, username: string): Promise<User> => {
    const pool = getPool();
    const query = `
        INSERT INTO users (id, username)
        VALUES ($1, $2)
        ON CONFLICT (id) DO UPDATE SET username = $2
        RETURNING *
    `;
    const result = await pool.query(query, [id, username]);
    return result.rows[0];
};

export const getUserById = async (id: string): Promise<User | null> => {
    const pool = getPool();
    const query = "SELECT * FROM users WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

