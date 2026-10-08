import { expect, test } from 'bun:test';
import { sectionOf, slugOf } from './nav';

test('sectionOf finds the section of an item', () => {
  expect(sectionOf('introduction')?.title).toBe('Getting Started');
  expect(sectionOf('concepts/pairing')?.title).toBe('Concepts');
});

test('sectionOf finds the section of a child item', () => {
  expect(sectionOf('components/trueseal-sync/group-manifest')?.title).toBe('Components');
});

test('sectionOf is undefined for a page outside the sidebar', () => {
  expect(sectionOf('kitchen-sink')).toBeUndefined();
});

test('slugOf strips the docs prefix and a trailing slash', () => {
  expect(slugOf('/docs/concepts/pairing/')).toBe('concepts/pairing');
  expect(slugOf('/docs/introduction')).toBe('introduction');
});
