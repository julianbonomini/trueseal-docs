import { expect, test } from 'bun:test';
import {
  addToRelayLog,
  createSealer,
  formatLocation,
  nudge,
  pointIn,
  RELAY_LOG_LIMIT,
  START_POINT,
  type Point,
  type RelayEntry,
} from './sealDemo.ts';

function randomPoint(): Point {
  return { x: 0.05 + Math.random() * 0.9, y: 0.05 + Math.random() * 0.9 };
}

test('the seal output never contains the plaintext', async () => {
  const sealer = await createSealer();
  for (let i = 0; i < 100; i++) {
    const p = randomPoint();
    const { bytes } = await sealer.seal(p);
    const decoded = Buffer.from(bytes).toString('latin1');
    for (const plain of [formatLocation(p), p.x.toFixed(4), p.y.toFixed(4), '{"x":']) {
      expect(decoded).not.toContain(plain);
    }
  }
});

test('the size shown equals the ciphertext length, IV and tag included', async () => {
  const sealer = await createSealer();
  const p = randomPoint();
  const packet = await sealer.seal(p);
  expect(packet.size).toBe(packet.bytes.byteLength);
  expect(addToRelayLog([], packet, 1)[0].size).toBe(packet.bytes.byteLength);
  const plaintextLength = new TextEncoder().encode(JSON.stringify(p)).length;
  expect(packet.size).toBe(12 + plaintextLength + 16);
});

test('Your phone gets the point back', async () => {
  const sealer = await createSealer();
  const p = randomPoint();
  expect(await sealer.open(await sealer.seal(p))).toEqual(p);
});

test('each seal uses a fresh IV', async () => {
  const sealer = await createSealer();
  const a = await sealer.seal(START_POINT);
  const b = await sealer.seal(START_POINT);
  expect(Buffer.from(a.bytes).equals(Buffer.from(b.bytes))).toBe(false);
});

test('another key cannot open a packet', async () => {
  const packet = await (await createSealer()).seal(START_POINT);
  const other = await createSealer();
  await expect(other.open(packet)).rejects.toThrow();
});

test('the relay log is bounded, newest first and holds no plaintext', async () => {
  const sealer = await createSealer();
  let log: RelayEntry[] = [];
  const snapshots: RelayEntry[][] = [];
  for (let id = 1; id <= 50; id++) {
    snapshots.push(log);
    log = addToRelayLog(log, await sealer.seal(randomPoint()), id);
  }
  expect(log).toHaveLength(RELAY_LOG_LIMIT);
  expect(log.map(e => e.id)).toEqual([50, 49, 48, 47, 46]);
  for (const entry of log) {
    expect(Object.keys(entry).sort()).toEqual(['id', 'size', 'time']);
    expect(entry.time).toMatch(/^\d\d:\d\d:\d\d$/);
  }
  expect(snapshots[3].map(e => e.id)).toEqual([3, 2, 1]);
});

test('the arrow keys nudge the point and stop at the bounds', () => {
  expect(nudge(START_POINT, 'ArrowRight', false)?.x).toBeCloseTo(START_POINT.x + 0.05);
  expect(nudge(START_POINT, 'ArrowRight', true)?.x).toBeCloseTo(START_POINT.x + 0.2);
  expect(nudge(START_POINT, 'ArrowUp', false)?.y).toBeCloseTo(START_POINT.y - 0.05);
  let p: Point = START_POINT;
  for (let i = 0; i < 30; i++) p = nudge(p, 'ArrowDown', true) ?? p;
  expect(p.y).toBe(0.95);
  for (let i = 0; i < 30; i++) p = nudge(p, 'ArrowLeft', false) ?? p;
  expect(p.x).toBe(0.05);
  expect(nudge(START_POINT, 'a', false)).toBeNull();
});

test('a pointer maps into the rect and clamps to the bounds', () => {
  const rect = { left: 100, top: 50, width: 400, height: 300 };
  expect(pointIn(rect, 300, 200)).toEqual({ x: 0.5, y: 0.5 });
  expect(pointIn(rect, 0, 0)).toEqual({ x: 0.05, y: 0.05 });
  expect(pointIn(rect, 900, 900)).toEqual({ x: 0.95, y: 0.95 });
});
