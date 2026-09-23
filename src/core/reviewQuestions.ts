import type { ModuleId } from './store/gameStore';
import type { ExplainQuestion } from './store/sessionStore';
import { KINEMATICS_EXPLAIN_QUESTIONS } from '../modules/kinematics/KinematicsModule';
import { PROJECTILE_EXPLAIN_QUESTIONS } from '../modules/projectile/ProjectileModule';
import { INCLINE_EXPLAIN_QUESTIONS } from '../modules/incline/InclineModule';
import { COLLISION_EXPLAIN_QUESTIONS } from '../modules/collision/CollisionModule';

export interface ReviewQuestion extends ExplainQuestion {
  moduleId: ModuleId;
  moduleTitle: string;
}

const MODULE_TITLES: Record<ModuleId, string> = {
  kinematics: 'Kinematics',
  projectile: 'Projectile Motion',
  incline: 'Incline & Forces',
  collision: 'Collisions',
};

function tag(moduleId: ModuleId, questions: ExplainQuestion[]): ReviewQuestion[] {
  return questions.map((q) => ({ ...q, moduleId, moduleTitle: MODULE_TITLES[moduleId] }));
}

/** Every Explain-phase question across all 4 modules, tagged with which
 *  module it belongs to — the pool the spaced-repetition review draws from. */
export const ALL_EXPLAIN_QUESTIONS: ReviewQuestion[] = [
  ...tag('kinematics', KINEMATICS_EXPLAIN_QUESTIONS),
  ...tag('projectile', PROJECTILE_EXPLAIN_QUESTIONS),
  ...tag('incline', INCLINE_EXPLAIN_QUESTIONS),
  ...tag('collision', COLLISION_EXPLAIN_QUESTIONS),
];

export function findReviewQuestion(moduleId: ModuleId, questionId: string): ReviewQuestion | undefined {
  return ALL_EXPLAIN_QUESTIONS.find((q) => q.moduleId === moduleId && q.id === questionId);
}
