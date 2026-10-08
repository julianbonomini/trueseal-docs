// The Seal Demo's logic: a point on Mum's map, sealed with an ephemeral AES-GCM key
// in the browser, and the only facts the relay column may show about it.
// A demonstration of what a relay sees, not the TrueSeal protocol.

/** A position on a demo map, as fractions of its width (x) and height (y). */
export interface Point {
  x: number;
  y: number;
}

/** A sealed update. `bytes` is all a relay would hold; `size` is `bytes.byteLength`. */
export interface SealedPacket {
  bytes: Uint8Array<ArrayBuffer>;
  size: number;
  sentAt: Date;
}

/** What the relay column shows about one packet: nothing derived from the plaintext. */
export interface RelayEntry {
  id: number;
  size: number;
  time: string;
}

export interface Sealer {
  /** Encrypts the point with a fresh IV. Never returns the plaintext. */
  seal(point: Point): Promise<SealedPacket>;
  /** Decrypts a packet this sealer made. Rejects for a packet from another sealer or altered bytes. */
  open(packet: SealedPacket): Promise<Point>;
}

/** Where Mum starts, on the server render and on hydration. */
export const START_POINT: Point = { x: 0.42, y: 0.58 };

/** The most rows the relay column keeps. */
export const RELAY_LOG_LIMIT = 5;

const IV_LENGTH = 12;
const MIN = 0.05;
const MAX = 0.95;
const STEP = 0.05;
const LARGE_STEP = 0.2;

/** A sealer with a new non-extractable AES-GCM-256 key. Needs Web Crypto (`crypto.subtle`). */
export async function createSealer(): Promise<Sealer> {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  return {
    async seal(point) {
      const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
      const plaintext = new TextEncoder().encode(JSON.stringify({ x: point.x, y: point.y }));
      const ciphertext = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext));
      const bytes = new Uint8Array(IV_LENGTH + ciphertext.byteLength);
      bytes.set(iv);
      bytes.set(ciphertext, IV_LENGTH);
      return { bytes, size: bytes.byteLength, sentAt: new Date() };
    },
    async open(packet) {
      const iv = packet.bytes.subarray(0, IV_LENGTH);
      const ciphertext = packet.bytes.subarray(IV_LENGTH);
      const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
      const { x, y } = JSON.parse(new TextDecoder().decode(plaintext)) as Point;
      return { x, y };
    },
  };
}

/** The log with `packet` added first, at most RELAY_LOG_LIMIT entries. Does not change `log`. */
export function addToRelayLog(log: readonly RelayEntry[], packet: SealedPacket, id: number): RelayEntry[] {
  const time = [packet.sentAt.getHours(), packet.sentAt.getMinutes(), packet.sentAt.getSeconds()]
    .map(n => String(n).padStart(2, '0'))
    .join(':');
  return [{ id, size: packet.size, time }, ...log].slice(0, RELAY_LOG_LIMIT);
}

function clamp(n: number): number {
  return Math.min(MAX, Math.max(MIN, n));
}

/** The point under (clientX, clientY) in `rect`, kept inside the map's 0.05–0.95 bounds. */
export function pointIn(
  rect: { left: number; top: number; width: number; height: number },
  clientX: number,
  clientY: number,
): Point {
  return { x: clamp((clientX - rect.left) / rect.width), y: clamp((clientY - rect.top) / rect.height) };
}

/** The point after an arrow key (0.05 a step, 0.2 with `large`), kept in bounds; null for any other key. */
export function nudge(point: Point, key: string, large: boolean): Point | null {
  const step = large ? LARGE_STEP : STEP;
  switch (key) {
    case 'ArrowLeft':
      return { x: clamp(point.x - step), y: point.y };
    case 'ArrowRight':
      return { x: clamp(point.x + step), y: point.y };
    case 'ArrowUp':
      return { x: point.x, y: clamp(point.y - step) };
    case 'ArrowDown':
      return { x: point.x, y: clamp(point.y + step) };
    default:
      return null;
  }
}

/** The point as the latitude and longitude the phones show, e.g. "51.5176, -0.1540". */
export function formatLocation(point: Point): string {
  const lat = 51.535 - point.y * 0.03;
  const lng = -0.175 + point.x * 0.05;
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}
