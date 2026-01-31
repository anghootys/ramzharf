import { getPool } from "../config/database";

export interface Note {
    id: string;
    user_id: string;
    encrypted_content: string;
    salt: string;
    expires_at: Date | null;
    created_at: Date;
}

export const createNote = async (
    userId: string,
    encryptedContent: string,
    salt: string,
    expiresAt: Date | null
): Promise<Note> => {
    const pool = getPool();
    const query = `
        INSERT INTO notes (user_id, encrypted_content, salt, expires_at)
        VALUES ($1, $2, $3, $4)
        RETURNING *
    `;
    const result = await pool.query(query, [userId, encryptedContent, salt, expiresAt]);
    return result.rows[0];
};

export const getNoteById = async (id: string): Promise<Note | null> => {
    const pool = getPool();
    const query = "SELECT * FROM notes WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

export const deleteNoteById = async (id: string, userId: string): Promise<boolean> => {
    const pool = getPool();
    const query = "DELETE FROM notes WHERE id = $1 AND user_id = $2";
    const result = await pool.query(query, [id, userId]);
    return result.rowCount !== null && result.rowCount > 0;
};

export const getUserNotes = async (userId: string): Promise<Note[]> => {
    const pool = getPool();
    const query = `
        SELECT id, user_id, encrypted_content, salt, expires_at, created_at 
        FROM notes 
        WHERE user_id = $1 
        ORDER BY created_at DESC
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
};

