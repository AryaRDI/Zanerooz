import * as migration_20251231_174116 from './20251231_174116';
import * as migration_20260101_141623 from './20260101_141623';

export const migrations = [
  {
    up: migration_20251231_174116.up,
    down: migration_20251231_174116.down,
    name: '20251231_174116',
  },
  {
    up: migration_20260101_141623.up,
    down: migration_20260101_141623.down,
    name: '20260101_141623'
  },
];
