import { expect, test } from 'bun:test';
import { docsNav, placeOf, slugOf } from './nav';

test('the sidebar sections follow the Journey, none empty', () => {
  expect(docsNav.map(section => section.title)).toEqual(['Overview', 'Integrate', 'Operate', 'Trust', 'Reference']);
  expect(docsNav.filter(section => section.items.length === 0)).toEqual([]);
});

test('placeOf gives the first page its section and only a next link', () => {
  const place = placeOf('overview/what-trueseal-is');
  expect(place?.section).toBe('Overview');
  expect(place?.prev).toBeUndefined();
  expect(place?.next?.href).toBe('/docs/overview/how-it-works');
});

test('previous and next cross section boundaries', () => {
  expect(placeOf('integrate/sdks')?.prev?.href).toBe('/docs/overview/license');
  expect(placeOf('integrate/delivery-issues')?.next?.href).toBe('/docs/operate/running-a-relay');
});

test('children follow their parent in reading order, in its section', () => {
  expect(placeOf('reference/trueseal-sync')?.next?.href).toBe('/docs/reference/envelopes-and-blobs');
  expect(placeOf('reference/envelopes-and-blobs')?.section).toBe('Reference');
});

test('the last page has no next link', () => {
  expect(placeOf('reference/nk-pattern')?.next).toBeUndefined();
});

test('placeOf is undefined for a page outside the sidebar', () => {
  expect(placeOf('kitchen-sink')).toBeUndefined();
});

test('slugOf strips the docs prefix and a trailing slash', () => {
  expect(slugOf('/docs/integrate/pairing/')).toBe('integrate/pairing');
  expect(slugOf('/docs/overview/introduction')).toBe('overview/introduction');
});
