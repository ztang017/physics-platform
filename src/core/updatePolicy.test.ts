import { describe, it, expect } from 'vitest';
import { isSafeToRefresh, UPDATE_CHECK_INTERVAL_MS } from './updatePolicy';
import { MODULE_ORDER } from './store/gameStore';

describe('isSafeToRefresh', () => {
  it('allows a reload on the homepage and Courses, where nothing is in progress', () => {
    expect(isSafeToRefresh('/')).toBe(true);
    expect(isSafeToRefresh('/courses')).toBe(true);
  });

  it('never reloads under a student in any module (their prediction and quiz answers live in memory)', () => {
    for (const id of MODULE_ORDER) expect(isSafeToRefresh(`/module/${id}`)).toBe(false);
  });

  it('never reloads on the Contact page, which may hold an unsent message', () => {
    expect(isSafeToRefresh('/contact')).toBe(false);
    expect(isSafeToRefresh('/contact/')).toBe(false);
  });

  it('treats unknown pages as safe', () => {
    expect(isSafeToRefresh('/nope')).toBe(true);
  });

  it('does not mistake a route that merely starts with the same letters for a busy one', () => {
    expect(isSafeToRefresh('/modules-overview')).toBe(true);
    expect(isSafeToRefresh('/contacts')).toBe(true);
  });
});

describe('UPDATE_CHECK_INTERVAL_MS', () => {
  it('checks often enough to matter but not so often as to waste requests', () => {
    expect(UPDATE_CHECK_INTERVAL_MS).toBeGreaterThanOrEqual(60 * 1000);
    expect(UPDATE_CHECK_INTERVAL_MS).toBeLessThanOrEqual(30 * 60 * 1000);
  });
});
