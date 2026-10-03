import { describe, it, expect } from 'vitest';
import type { ConceptSection } from '../components/concepts/ConceptNotes';
import { ALL_EXPLAIN_QUESTIONS } from '../core/reviewQuestions';
import { KINEMATICS_CONCEPTS, KINEMATICS_CHALLENGE } from './kinematics/kinematicsConcepts';
import { PROJECTILE_CONCEPTS, PROJECTILE_CHALLENGE } from './projectile/projectileConcepts';
import { INCLINE_CONCEPTS, INCLINE_CHALLENGE } from './incline/inclineConcepts';
import { ENERGY_CONCEPTS, ENERGY_CHALLENGE } from './energy/energyConcepts';
import { COLLISION_CONCEPTS, COLLISION_CHALLENGE } from './collision/collisionConcepts';
import { CIRCULAR_CONCEPTS, CIRCULAR_CHALLENGE } from './circular/circularConcepts';

// These tests protect the "no physics background needed" promise: the notes must stay
// short-sentenced and skimmable, and the quiz text must stay short and well-formed.

const MODULES: { name: string; basics: ConceptSection[]; challenge: ConceptSection[] }[] = [
  { name: 'Kinematics', basics: KINEMATICS_CONCEPTS, challenge: KINEMATICS_CHALLENGE },
  { name: 'Projectile', basics: PROJECTILE_CONCEPTS, challenge: PROJECTILE_CHALLENGE },
  { name: 'Incline', basics: INCLINE_CONCEPTS, challenge: INCLINE_CHALLENGE },
  { name: 'Energy', basics: ENERGY_CONCEPTS, challenge: ENERGY_CHALLENGE },
  { name: 'Collisions', basics: COLLISION_CONCEPTS, challenge: COLLISION_CHALLENGE },
  { name: 'Circular', basics: CIRCULAR_CONCEPTS, challenge: CIRCULAR_CHALLENGE },
];

function syllables(word: string): number {
  let w = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!w) return 0;
  if (w.length <= 3) return 1;
  w = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '').replace(/^y/, '');
  const m = w.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

const sentencesOf = (text: string) => text.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
const wordsOf = (text: string) => text.split(/\s+/).filter(Boolean);

function stats(paragraphs: string[]) {
  let words = 0, sentences = 0, syl = 0, over35 = 0;
  for (const p of paragraphs) {
    for (const s of sentencesOf(p)) {
      const w = wordsOf(s);
      sentences++;
      words += w.length;
      if (w.length > 35) over35++;
      syl += w.reduce((a, x) => a + syllables(x), 0);
    }
  }
  const avgSentence = words / sentences;
  const grade = 0.39 * avgSentence + 11.8 * (syl / words) - 15.59;
  return { avgSentence, grade, over35 };
}

describe.each(MODULES)('$name concept notes', ({ basics, challenge }) => {
  it('is written at a plain reading level (about grade 9 or lower)', () => {
    const { avgSentence, grade, over35 } = stats(basics.flatMap((s) => s.body));
    expect(avgSentence).toBeLessThanOrEqual(20);
    expect(grade).toBeLessThanOrEqual(9);
    expect(over35).toBe(0);
  });

  it('gives every explained section a one-sentence "in plain words" summary', () => {
    for (const section of [...basics, ...challenge]) {
      if (section.body.length === 0) continue; // worked examples and self-checks
      expect(section.summary, `section "${section.id}" needs a summary`).toBeTruthy();
      expect(wordsOf(section.summary!).length, `summary of "${section.id}" is too long`).toBeLessThanOrEqual(40);
    }
  });

  it('keeps paragraphs short enough to read on a phone', () => {
    for (const section of basics) {
      for (const para of section.body) {
        expect(wordsOf(para).length, `a paragraph in "${section.id}" is too long`).toBeLessThanOrEqual(90);
      }
    }
  });

  it('has unique section ids', () => {
    const ids = [...basics, ...challenge].map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Explain questions (all modules)', () => {
  it('has unique ids within each module', () => {
    const keys = ALL_EXPLAIN_QUESTIONS.map((q) => `${q.moduleId}/${q.id}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('gives every question four distinct options and a valid answer', () => {
    for (const q of ALL_EXPLAIN_QUESTIONS) {
      expect(q.options, q.id).toHaveLength(4);
      expect(new Set(q.options).size, `${q.id} has duplicate options`).toBe(4);
      expect(q.correctIndex, q.id).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex, q.id).toBeLessThan(4);
    }
  });

  it('keeps questions, hints and explanations short', () => {
    for (const q of ALL_EXPLAIN_QUESTIONS) {
      expect(wordsOf(q.question).length, `${q.id} question`).toBeLessThanOrEqual(75);
      expect(wordsOf(q.hint).length, `${q.id} hint`).toBeLessThanOrEqual(65);
      expect(wordsOf(q.explanation).length, `${q.id} explanation`).toBeLessThanOrEqual(100);
    }
  });

  it('writes explanations at a plain reading level on average, in every module', () => {
    const modules = [...new Set(ALL_EXPLAIN_QUESTIONS.map((q) => q.moduleId))];
    for (const moduleId of modules) {
      const { grade } = stats(ALL_EXPLAIN_QUESTIONS.filter((q) => q.moduleId === moduleId).map((q) => q.explanation));
      expect(grade, `${moduleId} explanations`).toBeLessThanOrEqual(9);
    }
  });
});
