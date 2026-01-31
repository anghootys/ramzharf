import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  // Generate random key (for testing)
  async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Derive key from password (PBKDF2)
  async deriveKeyFromPassword(password: string, salt?: Uint8Array): Promise<{ key: CryptoKey, salt: Uint8Array }> {
    // Generate or use provided salt
    const keySalt = salt || crypto.getRandomValues(new Uint8Array(16));

    // Import password as key material
    const encoder = new TextEncoder();
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits', 'deriveKey']
    );

    // Derive AES-GCM key from password
    // Pass Uint8Array directly - it's a valid BufferSource
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: keySalt as unknown as BufferSource,
        iterations: 100000, // High iteration count for security
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    return { key: derivedKey, salt: keySalt };
  }

  async exportKey(key: CryptoKey): Promise<string> {
    const exported = await crypto.subtle.exportKey('raw', key);
    return this.arrayBufferToBase64(exported);
  }

  async importKey(keyData: string): Promise<CryptoKey> {
    const keyBuffer = this.base64ToArrayBuffer(keyData);
    return await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt with password
  async encryptWithPassword(content: string, password: string): Promise<{ encrypted: string, salt: string }> {
    const { key, salt } = await this.deriveKeyFromPassword(password);
    const encrypted = await this.encrypt(content, key);

    return {
      encrypted,
      salt: this.arrayBufferToBase64(new Uint8Array(salt).buffer as ArrayBuffer)
    };
  }

  // Decrypt with password
  async decryptWithPassword(encryptedContent: string, password: string, saltBase64: string): Promise<string> {
    const salt = new Uint8Array(this.base64ToArrayBuffer(saltBase64));
    const { key } = await this.deriveKeyFromPassword(password, salt);
    return await this.decrypt(encryptedContent, key);
  }

  async encrypt(content: string, key: CryptoKey): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);

    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);

    return this.arrayBufferToBase64(combined.buffer);
  }

  async decrypt(encryptedContent: string, key: CryptoKey): Promise<string> {
    const combined = this.base64ToArrayBuffer(encryptedContent);
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  storeKey(key: string): void {
    sessionStorage.setItem('encryption_key', key);
  }

  getStoredKey(): string | null {
    return sessionStorage.getItem('encryption_key');
  }

  clearKey(): void {
    sessionStorage.removeItem('encryption_key');
  }
}


