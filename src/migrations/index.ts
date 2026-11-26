import * as migration_20261126_160553_initial from './20261126_160553_initial';
import * as migration_20261126_175741_specialists from './20261126_175741_specialists';

export const migrations = [
  {
    up: migration_20261126_160553_initial.up,
    down: migration_20261126_160553_initial.down,
    name: '20261126_160553_initial',
  },
  {
    up: migration_20261126_175741_specialists.up,
    down: migration_20261126_175741_specialists.down,
    name: '20261126_175741_specialists'
  },
];
