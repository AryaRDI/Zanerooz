import * as migration_20251231_174116 from './20251231_174116';
import * as migration_20260101_141623 from './20260101_141623';
import * as migration_20260101_180319 from './20260101_180319';
import * as migration_20260101_184315 from './20260101_184315';
import * as migration_20260101_233923 from './20260101_233923';
import * as migration_20260215_160014_add_ir_country from './20260215_160014_add_ir_country';

export const migrations = [
  {
    up: migration_20251231_174116.up,
    down: migration_20251231_174116.down,
    name: '20251231_174116',
  },
  {
    up: migration_20260101_141623.up,
    down: migration_20260101_141623.down,
    name: '20260101_141623',
  },
  {
    up: migration_20260101_180319.up,
    down: migration_20260101_180319.down,
    name: '20260101_180319',
  },
  {
    up: migration_20260101_184315.up,
    down: migration_20260101_184315.down,
    name: '20260101_184315',
  },
  {
    up: migration_20260101_233923.up,
    down: migration_20260101_233923.down,
    name: '20260101_233923',
  },
  {
    up: migration_20260215_160014_add_ir_country.up,
    down: migration_20260215_160014_add_ir_country.down,
    name: '20260215_160014_add_ir_country'
  },
];
