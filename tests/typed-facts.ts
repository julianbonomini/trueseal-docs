// The patterns of a Shared Fact value typed by hand, shared by the content and API reference checks.

// Values that belong to Shared Facts. Byte widths such as `32 bytes` and the Noise 65,535 ceiling are not Shared Facts.
export const typedFacts = [
  /61[,.\s]?440/,
  /\b60 KiB\b/,
  /\b1 MiB\b/,
  /1,?048,?576/,
  /\b770[01]\b/,
  /trueseal:\/\//,
  /\b(Transport|End-to-End|Store) Version \d/,
  /\b32[- ]member/,
  /\babout 100\b/,
  /\b(30|60) days\b/,
  /\b10,000\b/,
  /\b256 MiB\b/,
];
// The Agent Docs state no duration at all by hand; the Human Docs still describe intervals that are not Shared Facts.
export const typedDuration = /\b\d+\s?(ms|s|seconds?|minutes?|min|hours?|days?)\b/;
