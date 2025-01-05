// src/data/index.ts
import * as level1 from './level1';
import * as level2 from './level2';
import * as level3 from './level3';
import * as level4 from './level4';

export const levelData = {
  1: level1,
  2: level2,
  3: level3,
  4: level4,
};

export type LevelNumber = 1 | 2 | 3 | 4;
