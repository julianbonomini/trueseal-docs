// PROTOTYPE (throwaway, trueseal-roadmap#17). Shared copy for the home-page variants.
// The API follows trueseal-sync ADR-0028; the limits follow ADR-0025/0027. The agent-onboarding
// block is a placeholder until trueseal-roadmap#19 decides what ships.

export const snippets = {
  ts: `import { TrueSeal } from '@trueseal/sync'

const ts = await TrueSeal.open(
  'trueseal://9f2c…e41a@relay.example.com',
  './trueseal-state',
)

ts.onMessage(async (msg) => {
  await db.put(msg.id, msg.body)   // ack is sent after this resolves
})

const token = await ts.startPairing() // show as QR on the new device
await ts.send(bytes)                  // encrypted before it leaves`,
  swift: `import TrueSeal

let ts = try await TrueSeal.open(
  relay: "trueseal://9f2c…e41a@relay.example.com",
  storage: .applicationSupport
)

ts.onMessage { msg in
  try await store.save(msg.id, msg.body)
}

let token = try await ts.startPairing()
try await ts.send(data)`,
  kotlin: `import dev.trueseal.TrueSeal

val ts = TrueSeal.open(
  relay = "trueseal://9f2c…e41a@relay.example.com",
  storage = Storage.android(context),
)

ts.onMessage { msg ->
  repo.save(msg.id, msg.body)
}

val token = ts.startPairing()
ts.send(bytes)`,
};

export const installs = {
  ts: 'npm install @trueseal/sync',
  swift: '.package(url: "https://github.com/julianbonomini/trueseal-sync-swift", from: "0.6.0")',
  kotlin: 'implementation("dev.trueseal:sync:0.6.0")',
  relay: 'docker run -v trueseal:/data -p 7700:7700 -p 7701:7701 ghcr.io/julianbonomini/trueseal-relay:0.6',
};

export const agentPrompt =
  'Add end-to-end encrypted device sync to this app with TrueSeal. Read https://trueseal.dev/llms.txt first, then follow the quickstart for this platform.';

// What the relay learns. Honest wording, pending the threat-model decision (trueseal-roadmap#16).
export const relaySees = {
  cannot: [
    'Message contents',
    'Group names, member names, or the membership list',
    'Your users’ accounts. There are none; a device is a keypair.',
    'IP addresses. The relay never reads or stores them.',
  ],
  can: [
    'That a ciphertext of a given size arrived for a device key, and when',
    'Which device keys tend to receive the same fan-out (likely co-members)',
    'How long a blob waited before it was acknowledged',
  ],
};

export const limits = [
  ['Payload per message', '60 KiB'],
  ['Devices per group', '32'],
  ['Delivery', 'At least once, in order per sender'],
  ['Inbox TTL', 'Set by the relay operator'],
  ['Stability', 'Developer Preview (0.x): may break between releases'],
];

export type Tree = { title: string; items: (string | { title: string; items: string[] })[] }[];

// IA proposal A: split by audience.
export const iaAudience: Tree = [
  { title: 'Start', items: ['What is TrueSeal', 'How it works (5 min)', 'Developer Preview status'] },
  { title: 'Build an app', items: [
    { title: 'Quickstart', items: ['Swift', 'Kotlin', 'TypeScript'] },
    'Pair devices', 'Send and receive', 'Members, leaving, removal', 'Destroy Group', 'Errors and delivery issues', 'Limits',
  ] },
  { title: 'Self-host a relay', items: ['Run with Docker', 'Relay address and keypair', 'Quotas and abuse limits', 'Health, logs, shutdown', 'Backups and upgrades'] },
  { title: 'Security', items: ['Threat model', 'What the relay can see', 'Known limitations', 'Reporting a vulnerability'] },
  { title: 'Reference', items: ['SDK API (Swift · Kotlin · TS)', 'Protocol specification', 'Wire format', 'Versioning and compatibility', 'Test vectors', 'Glossary'] },
  { title: 'AI agents', items: ['llms.txt', 'AGENTS.md snippet', 'Skills'] },
];

// IA proposal B: Diátaxis (tutorials / how-to / explanation / reference).
export const iaDiataxis: Tree = [
  { title: 'Tutorials', items: ['Your first synced app (Swift)', 'Your first synced app (Kotlin)', 'Your first synced app (TypeScript)', 'Run your own relay'] },
  { title: 'How-to guides', items: ['Pair a new device', 'Remove a lost device', 'Destroy a group', 'Handle delivery issues', 'Upgrade across preview releases', 'Back up a relay', 'Use TrueSeal with an AI agent'] },
  { title: 'Explanation', items: ['How TrueSeal works', 'Devices, groups and the relay', 'Security and threat model', 'Delivery guarantees', 'Why no accounts'] },
  { title: 'Reference', items: ['SDK API', 'Errors and events', 'Relay configuration', 'Protocol specification', 'Wire format and test vectors', 'Compatibility table', 'Glossary'] },
];

// IA proposal C: one journey-ordered sidebar.
export const iaJourney: Tree = [
  { title: '1 · Start', items: ['Overview', 'Quickstart with an agent', 'Quickstart by hand'] },
  { title: '2 · Integrate', items: ['Open a TrueSeal', 'Pairing', 'Messages', 'Membership', 'Destroy Group', 'Errors'] },
  { title: '3 · Operate', items: ['Self-host the relay', 'Limits and quotas', 'Upgrades and versions'] },
  { title: '4 · Trust', items: ['Threat model', 'Relay visibility', 'Known limitations'] },
  { title: '5 · Specification', items: ['Protocol', 'Wire format', 'Test vectors', 'Compatibility table'] },
];
