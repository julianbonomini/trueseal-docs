// Shared Facts: the values both the Human Docs and the Agent Docs state. Pages render them from here and never type them.
// TODO: the agent-docs Goal's Shared Facts Ticket owns this file's final shape and adds every other fact.

const protocolSizeLimitBytes = 61_440;

/** The Protocol Size Limit: the largest `Sync` body `send()` accepts. Operators may only lower it. */
export const protocolSizeLimit: {
  /** The limit in bytes. */
  bytes: number;
  /** The limit as a page prints it: "61,440 bytes (60 KiB)". */
  text: string;
  /** The decision that sets it. */
  source: string;
} = {
  bytes: protocolSizeLimitBytes,
  text: `${protocolSizeLimitBytes.toLocaleString('en-US')} bytes (${protocolSizeLimitBytes / 1024} KiB)`,
  source: 'trueseal-sync ADR-0025',
};

/** A Shared Fact counted in days. */
export interface DaysFact {
  days: number;
  /** As a page prints it: "60 days". */
  text: string;
  /** The decisions that set it. */
  source: string;
}

const daysFact = (days: number, source: string): DaysFact => ({ days, text: `${days} days`, source });

/** The Replay Window: a device rejects a message whose Sender Timestamp is older than this. */
export const replayWindow = daysFact(60, 'trueseal-sync ADR-0031');

/** The relay message lifetime: the default, and the most an Operator may set. */
export const relayTtl = daysFact(30, 'trueseal-relay ADR-0012, trueseal-sync ADR-0034');
