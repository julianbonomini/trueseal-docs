// Serves /.well-known/agent-skills/index.json (docs ADR-0005 "Distribution"): the three TrueSeal
// workflow skills with sha256 digests of every file, from a pinned trueseal-skills ref. The body is
// the committed, generated src/config/agent-skills-index.json — the build needs no network, and the
// sync script's --check mode verifies the file against its pin.
import type { APIRoute } from 'astro';
import index from '../../../config/agent-skills-index.json';

export const GET: APIRoute = () =>
  new Response(JSON.stringify(index, null, 2) + '\n', {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
