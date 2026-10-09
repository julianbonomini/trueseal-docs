// The Compatibility Table: which TrueSeal Release, relay and noise versions, protocol versions and Store
// Versions go together (release spec section 5). Both surfaces render it from compatibility.json, which
// the Release Conductor updates (e2e ADR-0002). This module alone knows the file's format and checks it.
import compatibilityJson from './compatibility.json';

/** One row of compatibility.json: a Release Manifest as the Compatibility Table shows it.
 *  Versions are "X.Y.Z". `migrationFloor` is the oldest TrueSeal Release whose Session State this
 *  release migrates (sync ADR-0032). `planned` marks a row that hasn't shipped. */
export interface ReleaseManifest {
  truesealRelease: string;
  relay: string;
  noise: string;
  transportVersion: number;
  endToEndVersion: number;
  sessionStateStoreVersion: number;
  relayStoreVersion: number;
  migrationFloor: string;
  status: 'planned' | 'released';
}

// Each field with its column heading, in display order.
const fields: { key: keyof ReleaseManifest; label: string; kind: 'version' | 'integer' }[] = [
  { key: 'truesealRelease', label: 'TrueSeal Release', kind: 'version' },
  { key: 'relay', label: 'Relay', kind: 'version' },
  { key: 'noise', label: 'Noise', kind: 'version' },
  { key: 'transportVersion', label: 'Transport Version', kind: 'integer' },
  { key: 'endToEndVersion', label: 'End-to-End Version', kind: 'integer' },
  { key: 'sessionStateStoreVersion', label: 'Session State Store Version', kind: 'integer' },
  { key: 'relayStoreVersion', label: 'Relay Store Version', kind: 'integer' },
  { key: 'migrationFloor', label: 'Migration floor', kind: 'version' },
];

/** The column headings, in display order. */
export const compatibilityColumns: readonly string[] = fields.map(field => field.label);

/** The table as pages print it: one row of cells per release, newest TrueSeal Release first, each
 *  cell aligned with compatibilityColumns. A planned release's first cell reads "0.6.0 (planned)".
 *  `data` defaults to compatibility.json. Throws an Error naming the release and field when data
 *  isn't { releases: ReleaseManifest[] }: a missing or unknown key, a version that isn't X.Y.Z, a
 *  protocol or Store Version that isn't a positive integer, a migration floor newer than its release,
 *  or a TrueSeal Release listed twice. The site build fails on it. */
export function compatibilityTable(input: unknown = compatibilityJson): { columns: readonly string[]; rows: string[][] } {
  const releases = (input as { releases?: unknown } | null)?.releases;
  if (!Array.isArray(releases)) throw new Error('Compatibility Table data has no "releases" array');

  const checked = releases.map((release, index) => checkRelease(release, index + 1));
  checked.forEach((release, index) => {
    if (checked.findIndex(other => other.truesealRelease === release.truesealRelease) < index) {
      throw new Error(`${rowName(index + 1, release.truesealRelease)}: truesealRelease "${release.truesealRelease}" is listed twice`);
    }
  });

  const rows = checked
    .sort((a, b) => compareVersions(b.truesealRelease, a.truesealRelease))
    .map(release =>
      fields.map(({ key }) => {
        const cell = String(release[key]);
        return key === 'truesealRelease' && release.status === 'planned' ? `${cell} (planned)` : cell;
      }),
    );
  return { columns: compatibilityColumns, rows };
}

function checkRelease(release: unknown, position: number): ReleaseManifest {
  const record = (typeof release === 'object' && release !== null ? release : {}) as Record<string, unknown>;
  const name = rowName(position, isVersion(record.truesealRelease) ? record.truesealRelease : undefined);
  const fail = (problem: string) => {
    throw new Error(`${name}: ${problem}`);
  };

  const known = [...fields.map(field => field.key), 'status'];
  for (const key of Object.keys(record)) {
    if (!known.includes(key as keyof ReleaseManifest)) fail(`unknown field "${key}"`);
  }
  for (const { key, kind } of fields) {
    const value = record[key];
    if (value === undefined) fail(`${key} is missing`);
    if (kind === 'version' && !isVersion(value)) fail(`${key} ${JSON.stringify(value)} isn't an X.Y.Z version`);
    if (kind === 'integer' && !(Number.isInteger(value) && (value as number) > 0)) {
      fail(`${key} ${JSON.stringify(value)} isn't a positive integer`);
    }
  }
  if (record.status !== 'planned' && record.status !== 'released') {
    fail(`status ${JSON.stringify(record.status)} isn't "planned" or "released"`);
  }

  const manifest = record as unknown as ReleaseManifest;
  if (compareVersions(manifest.migrationFloor, manifest.truesealRelease) > 0) {
    fail(`migrationFloor "${manifest.migrationFloor}" is newer than the release`);
  }
  return manifest;
}

// "release 1 (0.6.0)", or "release 1" when the version itself is bad.
function rowName(position: number, truesealRelease?: string): string {
  return `Compatibility Table release ${position}${truesealRelease ? ` (${truesealRelease})` : ''}`;
}

function isVersion(value: unknown): value is string {
  return typeof value === 'string' && /^\d+\.\d+\.\d+$/.test(value);
}

// Compares part by part as numbers, so 0.10.0 is newer than 0.9.0.
function compareVersions(a: string, b: string): number {
  const [left, right] = [a, b].map(version => version.split('.').map(Number));
  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) return left[i] - right[i];
  }
  return 0;
}
