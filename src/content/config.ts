import { defineCollection, z } from 'astro:content';

const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    order: z.number().optional(),
  }),
});

// Agent Docs need a title and a one-line description on every page: llms.txt lists both.
const agents = defineCollection({
  type: 'content',
  schema: z.object({ title: z.string(), description: z.string() }),
});

export const collections = { docs, agents };
