/**
 * URL-safe symmetric encryption for feedback link parameters (coachCode + clientCode).
 * Prevents plain IDs from being exposed in public feedback URLs while preserving seamless
 * client/coach context resolution.
 */

const SECRET_KEY_STR = "MeraCoachFeedbackSecretKey#2026!"; // 32 bytes
const KEY_BYTES = new Uint8Array(32);
for (let i = 0; i < 32; i++) {
  KEY_BYTES[i] = SECRET_KEY_STR.charCodeAt(i);
}

function rotl(a: number, b: number): number {
  return (a << b) | (a >>> (32 - b));
}

function chachaCrypt(
  input: Uint8Array,
  keyBytes: Uint8Array,
  nonceBytes: Uint8Array,
): Uint8Array {
  const output = new Uint8Array(input.length);
  const state = new Uint32Array(16);
  const block = new Uint8Array(64);
  const block32 = new Uint32Array(block.buffer);

  function qr(a: number, b: number, c: number, d: number) {
    const sa = state[a] ?? 0;
    const sb = state[b] ?? 0;
    const sc = state[c] ?? 0;
    let sd = state[d] ?? 0;

    let na = (sa + sb) | 0;
    sd ^= na;
    sd = rotl(sd, 16);
    let nc = (sc + sd) | 0;
    let nb = sb ^ nc;
    nb = rotl(nb, 12);
    na = (na + nb) | 0;
    sd ^= na;
    sd = rotl(sd, 8);
    nc = (nc + sd) | 0;
    nb ^= nc;
    nb = rotl(nb, 7);

    state[a] = na;
    state[b] = nb;
    state[c] = nc;
    state[d] = sd;
  }

  const key32 = new Uint32Array(keyBytes.buffer, keyBytes.byteOffset, 8);
  const nonce32 = new Uint32Array(nonceBytes.buffer, nonceBytes.byteOffset, 3);

  let counter = 0;
  for (let offset = 0; offset < input.length; offset += 64) {
    state[0] = 0x61707865;
    state[1] = 0x3320646e;
    state[2] = 0x79622d32;
    state[3] = 0x6b206574;
    for (let i = 0; i < 8; i++) {
      state[4 + i] = key32[i] ?? 0;
    }
    state[12] = counter++;
    for (let i = 0; i < 3; i++) {
      state[13 + i] = nonce32[i] ?? 0;
    }

    const orig = new Uint32Array(state);
    for (let i = 0; i < 10; i++) {
      qr(0, 4, 8, 12);
      qr(1, 5, 9, 13);
      qr(2, 6, 10, 14);
      qr(3, 7, 11, 15);
      qr(0, 5, 10, 15);
      qr(1, 6, 11, 12);
      qr(2, 7, 8, 13);
      qr(3, 4, 9, 14);
    }
    for (let i = 0; i < 16; i++) {
      block32[i] = ((state[i] ?? 0) + (orig[i] ?? 0)) | 0;
    }

    const len = Math.min(64, input.length - offset);
    for (let i = 0; i < len; i++) {
      output[offset + i] = (input[offset + i] ?? 0) ^ (block[i] ?? 0);
    }
  }
  return output;
}

function checksum(bytes: Uint8Array): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) {
    hash ^= bytes[i] ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

const B64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function toBase64Url(bytes: Uint8Array): string {
  let res = "";
  let i = 0;
  for (; i + 2 < bytes.length; i += 3) {
    const b0 = bytes[i] ?? 0;
    const b1 = bytes[i + 1] ?? 0;
    const b2 = bytes[i + 2] ?? 0;
    const n = (b0 << 16) | (b1 << 8) | b2;
    res +=
      (B64_CHARS[(n >> 18) & 63] ?? "") +
      (B64_CHARS[(n >> 12) & 63] ?? "") +
      (B64_CHARS[(n >> 6) & 63] ?? "") +
      (B64_CHARS[n & 63] ?? "");
  }
  if (i < bytes.length) {
    const b0 = bytes[i] ?? 0;
    let n = b0 << 16;
    let chars = 2;
    if (i + 1 < bytes.length) {
      const b1 = bytes[i + 1] ?? 0;
      n |= b1 << 8;
      chars = 3;
    }
    res +=
      (B64_CHARS[(n >> 18) & 63] ?? "") + (B64_CHARS[(n >> 12) & 63] ?? "");
    if (chars === 3) {
      res += B64_CHARS[(n >> 6) & 63] ?? "";
    }
  }
  return res;
}

function fromBase64Url(str: string): Uint8Array | null {
  const map: Record<string, number> = {};
  for (let i = 0; i < B64_CHARS.length; i++) {
    const ch = B64_CHARS[i];
    if (ch) map[ch] = i;
  }
  const clean = str.replace(/[^A-Za-z0-9\-_]/g, "");
  if (!clean) return null;
  const out: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (!ch) continue;
    const val = map[ch];
    if (val === undefined) return null;
    buffer = (buffer << 6) | val;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >> bits) & 0xff);
    }
  }
  return new Uint8Array(out);
}

/**
 * Encrypts coachCode and clientCode into a secure, opaque, URL-safe token.
 */
export function encodeFeedbackToken(
  coachCode: string,
  clientCode: string,
): string {
  const trimmedCoach = coachCode.trim();
  const trimmedClient = clientCode.trim();
  if (!trimmedCoach || !trimmedClient) return "";

  const text = `${trimmedCoach}\t${trimmedClient}\t${Date.now()}`;
  const plainBytes = new TextEncoder().encode(text);
  const nonce = new Uint8Array(12);
  for (let i = 0; i < 12; i++) {
    nonce[i] = Math.floor(Math.random() * 256);
  }
  const cipher = chachaCrypt(plainBytes, KEY_BYTES, nonce);
  const payload = new Uint8Array(12 + cipher.length + 4);
  payload.set(nonce, 0);
  payload.set(cipher, 12);
  const tag = checksum(payload.subarray(0, 12 + cipher.length));
  payload[12 + cipher.length] = (tag >> 24) & 0xff;
  payload[12 + cipher.length + 1] = (tag >> 16) & 0xff;
  payload[12 + cipher.length + 2] = (tag >> 8) & 0xff;
  payload[12 + cipher.length + 3] = tag & 0xff;
  return toBase64Url(payload);
}

/**
 * Decrypts a URL-safe token back to `{ coachCode, clientCode }`. Returns null on invalid or tampered tokens.
 */
export function decodeFeedbackToken(
  token: string,
): { coachCode: string; clientCode: string } | null {
  const bytes = fromBase64Url(token.trim());
  if (!bytes || bytes.length < 17) return null;
  const dataLen = bytes.length - 4;
  const expectedTag = checksum(bytes.subarray(0, dataLen));
  const b0 = bytes[dataLen] ?? 0;
  const b1 = bytes[dataLen + 1] ?? 0;
  const b2 = bytes[dataLen + 2] ?? 0;
  const b3 = bytes[dataLen + 3] ?? 0;
  const actualTag = ((b0 << 24) | (b1 << 16) | (b2 << 8) | b3) >>> 0;
  if (expectedTag !== actualTag) return null;

  const nonce = bytes.subarray(0, 12);
  const cipher = bytes.subarray(12, dataLen);
  const plain = chachaCrypt(cipher, KEY_BYTES, nonce);
  const text = new TextDecoder().decode(plain);
  const parts = text.split("\t");
  if (parts.length < 2) return null;
  const coachCode = parts[0]?.trim();
  const clientCode = parts[1]?.trim();
  if (!coachCode || !clientCode) return null;
  return { coachCode, clientCode };
}
