import { defineCli } from '../engine';
import { TodayCommand } from './today/TodayCommand';
import { DbLsCommand } from './db/DbLsCommand';
import { DbCurrentCommand } from './db/DbCurrentCommand';
import { DbUseCommand } from './db/DbUseCommand';

/**
 * The whole CLI, declared in one place. Adding a command means adding its
 * class here — routing, help, validation, and JSON mode follow from its meta.
 */
export const cli = defineCli({
  commands: [TodayCommand, DbLsCommand, DbCurrentCommand, DbUseCommand],
});
