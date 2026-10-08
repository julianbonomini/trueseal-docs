// The Seal Demo Island: drag Mum's dot, watch each update cross the relay as a sealed packet,
// then land on Your phone. Owns the throttling and transit timers; sealDemo.ts owns the crypto.
import { useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';
// sealDemo.ts and SealDemo.tsx differ only in case, so every import names its extension:
// on a case-insensitive disk an extensionless path can resolve to the wrong one.
import {
  addToRelayLog,
  createSealer,
  formatLocation,
  nudge,
  pointIn,
  START_POINT,
  type Point,
  type RelayEntry,
  type Sealer,
} from './sealDemo.ts';
import './SealDemo.css';

// At most one packet per interval while dragging, so the relay column stays readable.
const SEND_INTERVAL_MS = 500;
// How long a packet sits in the relay column before Your phone opens it.
const TRANSIT_MS = 600;

function MapGrid() {
  const id = useId();
  return (
    <svg className="seal-demo__grid" aria-hidden="true">
      <defs>
        <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth={1} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

export default function SealDemo() {
  const [mum, setMum] = useState<Point>(START_POINT);
  const [relayLog, setRelayLog] = useState<RelayEntry[]>([]);
  const [received, setReceived] = useState<Point | null>(null);

  // Nothing touches crypto before the effect runs, so the first render matches the server render.
  const sealerRef = useRef<Promise<Sealer> | null>(null);
  const lastSentRef = useRef(0);
  const trailingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const deliveryTimersRef = useRef(new Set<ReturnType<typeof setTimeout>>());
  const latestRef = useRef<Point>(START_POINT);
  const nextIdRef = useRef(1);

  async function send(point: Point) {
    lastSentRef.current = Date.now();
    const sealer = await sealerRef.current!;
    const packet = await sealer.seal(point);
    setRelayLog(log => addToRelayLog(log, packet, nextIdRef.current++));
    const timer = setTimeout(async () => {
      deliveryTimersRef.current.delete(timer);
      setReceived(await sealer.open(packet));
    }, TRANSIT_MS);
    deliveryTimersRef.current.add(timer);
  }

  function move(point: Point) {
    setMum(point);
    latestRef.current = point;
    clearTimeout(trailingTimerRef.current);
    const wait = lastSentRef.current + SEND_INTERVAL_MS - Date.now();
    if (wait <= 0) {
      send(point);
    } else {
      trailingTimerRef.current = setTimeout(() => send(latestRef.current), wait);
    }
  }

  useEffect(() => {
    sealerRef.current = createSealer();
    send(START_POINT);
    const deliveryTimers = deliveryTimersRef.current;
    return () => {
      clearTimeout(trailingTimerRef.current);
      deliveryTimers.forEach(clearTimeout);
    };
  }, []);

  function moveToPointer(e: PointerEvent<HTMLDivElement>) {
    move(pointIn(e.currentTarget.getBoundingClientRect(), e.clientX, e.clientY));
  }

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    const next = nudge(mum, e.key, e.shiftKey);
    if (next === null) return;
    e.preventDefault();
    move(next);
  }

  return (
    <figure className="seal-demo">
      <div className="seal-demo__pane">
        <p className="seal-demo__title">Mum's phone</p>
        <div
          className="seal-demo__map seal-demo__map--source"
          onPointerDown={e => {
            e.currentTarget.setPointerCapture(e.pointerId);
            moveToPointer(e);
          }}
          onPointerMove={e => {
            if (e.currentTarget.hasPointerCapture(e.pointerId)) moveToPointer(e);
          }}
        >
          <MapGrid />
          <button
            type="button"
            className="seal-demo__dot seal-demo__dot--source"
            style={{ left: `${mum.x * 100}%`, top: `${mum.y * 100}%` }}
            aria-label="Mum's location. Use the arrow keys to move it."
            onKeyDown={onKeyDown}
          />
        </div>
        <p className="seal-demo__coords">{formatLocation(mum)}</p>
      </div>
      <div className="seal-demo__pane seal-demo__pane--relay">
        <p className="seal-demo__title">The relay</p>
        <ol className="seal-demo__log">
          {relayLog.length === 0 ? (
            <li className="seal-demo__empty">Sealed packets appear here.</li>
          ) : (
            relayLog.map(entry => (
              <li key={entry.id} className="seal-demo__packet">
                <span className="seal-demo__mark" aria-hidden="true" />
                <span>sealed</span>
                <span>{entry.size} B</span>
                <span>{entry.time}</span>
              </li>
            ))
          )}
        </ol>
      </div>
      <div className="seal-demo__pane">
        <p className="seal-demo__title">Your phone</p>
        <div className="seal-demo__map">
          <MapGrid />
          {received && (
            <span
              className="seal-demo__dot seal-demo__dot--received"
              style={{ left: `${received.x * 100}%`, top: `${received.y * 100}%` }}
              aria-hidden="true"
            />
          )}
        </div>
        <p className="seal-demo__coords">{received ? `Mum is at ${formatLocation(received)}` : 'Waiting for Mum'}</p>
      </div>
      <figcaption className="seal-demo__caption">
        Drag Mum's dot, or focus it and press the arrow keys. Each update is encrypted in this page before it leaves
        her phone. The relay column shows what the relay holds: a sealed packet, its size and the time. Nothing in this
        demo leaves your browser.
      </figcaption>
    </figure>
  );
}
