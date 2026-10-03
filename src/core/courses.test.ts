import { describe, it, expect } from 'vitest';
import { COURSE_LIST, getCourse, getNextCourse, isModuleUnlocked, progressMessage } from './courses';
import { MODULE_ORDER, type ModuleId } from './store/gameStore';

describe('COURSE_LIST', () => {
  it('lists every module exactly once, in MODULE_ORDER', () => {
    expect(COURSE_LIST.map((c) => c.id)).toEqual(MODULE_ORDER);
  });

  it('gives every course a unique route that matches its id', () => {
    const paths = COURSE_LIST.map((c) => c.path);
    expect(new Set(paths).size).toBe(paths.length);
    for (const course of COURSE_LIST) expect(course.path).toBe(`/module/${course.id}`);
  });

  it('looks courses up by id', () => {
    expect(getCourse('energy').title).toMatch(/Energy/);
  });
});

describe('isModuleUnlocked', () => {
  it('always opens the first module', () => {
    expect(isModuleUnlocked(MODULE_ORDER[0], [])).toBe(true);
  });

  it('keeps later modules locked until the previous one is complete', () => {
    expect(isModuleUnlocked('projectile', [])).toBe(false);
    expect(isModuleUnlocked('projectile', ['kinematics'])).toBe(true);
    expect(isModuleUnlocked('incline', ['kinematics'])).toBe(false);
  });

  it('never re-locks a module the student has already finished', () => {
    // e.g. a student who finished Collisions before Energy was added in front of it
    const legacy: ModuleId[] = ['kinematics', 'projectile', 'incline', 'collision'];
    expect(isModuleUnlocked('collision', legacy)).toBe(true);
    expect(isModuleUnlocked('energy', legacy)).toBe(true);
  });
});

describe('getNextCourse', () => {
  it('starts at the first module', () => {
    expect(getNextCourse([])?.id).toBe(MODULE_ORDER[0]);
  });

  it('returns the first unfinished module even when a later one is already done', () => {
    expect(getNextCourse(['kinematics', 'projectile', 'incline', 'collision'])?.id).toBe('energy');
  });

  it('returns null once everything is complete', () => {
    expect(getNextCourse([...MODULE_ORDER])).toBeNull();
  });
});

describe('progressMessage', () => {
  it('invites a brand-new student to begin', () => {
    expect(progressMessage([])).toMatch(/first module/i);
  });

  it('names the next module and how many remain', () => {
    const message = progressMessage(['kinematics', 'projectile']);
    expect(message).toContain(`2 of ${MODULE_ORDER.length}`);
    expect(message).toContain(`${MODULE_ORDER.length - 2} to go`);
    expect(message).toContain(getCourse('incline').title);
  });

  it('says "just one to go" when a single module is left', () => {
    expect(progressMessage(MODULE_ORDER.slice(0, -1))).toMatch(/just one to go/i);
  });

  it('congratulates a student who has finished everything', () => {
    expect(progressMessage([...MODULE_ORDER])).toMatch(/completed every module/i);
  });
});
