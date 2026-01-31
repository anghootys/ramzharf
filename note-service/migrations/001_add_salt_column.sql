-- Migration: Add salt column for password-based encryption
-- Date: 2026-01-31
-- Purpose: Support PBKDF2 key derivation for client-side encryption

-- Add salt column with temporary default for existing records
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS salt VARCHAR(255) NOT NULL DEFAULT '';

-- Remove default since all new records must provide salt
ALTER TABLE notes
ALTER COLUMN salt DROP DEFAULT;

-- Note: Existing records (if any) will have empty salt and cannot be decrypted
-- This is acceptable since the salt column was added as part of the initial implementation

