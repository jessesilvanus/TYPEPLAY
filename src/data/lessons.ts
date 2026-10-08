/**
 * TYPEPLAY — Lessons Data
 * ==========================================================================
 * The 9 structured touch-typing lessons that form the core learning path.
 * Lessons are progressive, building from home row to full sentences.
 */

import type { Lesson } from '../types/learning';

export const LESSONS: Lesson[] = [
  {
    id: 'home-row',
    number: 1,
    title: 'Home Row — ASDF JKL;',
    description: 'Learn the home row positions where your fingers always return. Focus on accuracy over speed.',
    difficulty: 'beginner',
    keys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';', ' '],
    fingerTargets: [
      'left-pinky', 'left-ring', 'left-middle', 'left-index',
      'right-index', 'right-middle', 'right-ring', 'right-pinky'
    ],
    practiceText: 'asdf jkl; asdf jkl; fads jalk fads jalk asdf jkl; ads jkl; sad fads jalk lksj kads jf fads jkl; asdf jkl;',
    minimumAccuracy: 90,
  },
  {
    id: 'left-hand',
    number: 2,
    title: 'Left Hand Reach',
    description: 'Expanding your left hand to the top and bottom rows. Keep your fingers curved.',
    difficulty: 'beginner',
    keys: ['q', 'w', 'e', 'r', 't', 'z', 'x', 'c', 'v', 'b'],
    fingerTargets: ['left-pinky', 'left-ring', 'left-middle', 'left-index'],
    practiceText: 'qaz wsx edc rfv tgb qaz wsx edc rfv tgb red car vase bed cat red car vase bed cat qaz wsx edc rfv tgb',
    minimumAccuracy: 85,
    prerequisite: 'home-row',
  },
  {
    id: 'right-hand',
    number: 3,
    title: 'Right Hand Reach',
    description: 'Expanding your right hand to the top and bottom rows. Maintain a light touch.',
    difficulty: 'beginner',
    keys: ['y', 'u', 'i', 'o', 'p', 'h', 'n', 'm', ',', '.', '/'],
    fingerTargets: ['right-index', 'right-middle', 'right-ring', 'right-pinky'],
    practiceText: 'yhn ujm ik, ol. p;/ yhn ujm ik, ol. p;/ him you oil mop moon him you oil mop moon yhn ujm ik, ol. p;/',
    minimumAccuracy: 85,
    prerequisite: 'left-hand',
  },
  {
    id: 'top-row',
    number: 4,
    title: 'Top Row Mastery',
    description: 'Combining home row and top row keys. Look at the screen, not your hands.',
    difficulty: 'beginner',
    keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    fingerTargets: [
      'left-pinky', 'left-ring', 'left-middle', 'left-index',
      'right-index', 'right-middle', 'right-ring', 'right-pinky'
    ],
    practiceText: 'qwerty uiop qwerty uiop typewriter power quiet trip route typewriter power quiet trip route qwerty uiop',
    minimumAccuracy: 80,
    prerequisite: 'right-hand',
  },
  {
    id: 'bottom-row',
    number: 5,
    title: 'Bottom Row Mastery',
    description: 'Mastering the bottom row keys. The reaching motion should be fluid and precise.',
    difficulty: 'beginner',
    keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'],
    fingerTargets: [
      'left-pinky', 'left-ring', 'left-middle', 'left-index',
      'right-index', 'right-middle', 'right-ring', 'right-pinky'
    ],
    practiceText: 'zxcvbnm,./ zxcvbnm,./ zebra box cat van boat night moon zebra box cat van boat night moon zxcvbnm,./',
    minimumAccuracy: 80,
    prerequisite: 'top-row',
  },
  {
    id: 'combinations',
    number: 6,
    title: 'Common Combinations',
    description: 'Practicing common letter pairings (bigrams) to build muscle memory for common words.',
    difficulty: 'intermediate',
    keys: ['t', 'h', 'e', 'a', 'n', 'd', 'i', 's', 'r', 'o'],
    fingerTargets: [
      'left-pinky', 'left-ring', 'left-middle', 'left-index',
      'right-index', 'right-middle', 'right-ring', 'right-pinky'
    ],
    practiceText: 'th he in er an re nd at on es th he in er an re nd at on es the and that this there then than these',
    minimumAccuracy: 85,
    prerequisite: 'bottom-row',
  },
  {
    id: 'common-words',
    number: 7,
    title: 'Essential Words',
    description: 'Typing the most common words in English. Focus on the flow of your movements.',
    difficulty: 'intermediate',
    keys: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'],
    fingerTargets: [
      'left-pinky', 'left-ring', 'left-middle', 'left-index',
      'right-index', 'right-middle', 'right-ring', 'right-pinky'
    ],
    practiceText: 'the be to of and a in that have i it for not on with he as you do at this but his by from they we say',
    minimumAccuracy: 85,
    prerequisite: 'combinations',
  },
  {
    id: 'sentences',
    number: 8,
    title: 'Sentence Flow',
    description: 'Applying everything you have learned to complete sentences. Use proper capitalization.',
    difficulty: 'advanced',
    keys: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'Shift', '.'],
    fingerTargets: [
      'left-pinky', 'left-ring', 'left-middle', 'left-index',
      'right-index', 'right-middle', 'right-ring', 'right-pinky'
    ],
    practiceText: 'The quick brown fox jumps over the lazy dog. Bright stars shine in the dark night sky. Always focus on accuracy.',
    minimumAccuracy: 80,
    prerequisite: 'common-words',
  },
  {
    id: 'speed-practice',
    number: 9,
    title: 'Speed & Consistency',
    description: 'Full paragraph practice to build rhythm and speed while maintaining high technique.',
    difficulty: 'advanced',
    keys: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 'Shift', '.', ',', '!'],
    fingerTargets: [
      'left-pinky', 'left-ring', 'left-middle', 'left-index',
      'right-index', 'right-middle', 'right-ring', 'right-pinky'
    ],
    practiceText: 'Touch typing is a skill that lasts a lifetime. By focusing on technique first, you build a foundation for incredible speed and precision. Keep practicing every day!',
    minimumAccuracy: 75,
    prerequisite: 'sentences',
  },
];

/**
 * Get a lesson by its ID.
 */
export function getLesson(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

/**
 * Get the next lesson in sequence.
 */
export function getNextLesson(currentId: string): Lesson | null {
  const currentIndex = LESSONS.findIndex((l) => l.id === currentId);
  if (currentIndex === -1 || currentIndex === LESSONS.length - 1) return null;
  return LESSONS[currentIndex + 1];
}