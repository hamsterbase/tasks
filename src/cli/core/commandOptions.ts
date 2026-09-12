import { ItemStatus } from '../../core/type';
import { CliOption } from '../engine';

export const INSTANCE_OPTION: CliOption = {
  name: 'instance',
  aliases: ['instance-id', 'instanceid'],
  arg: '<id>',
  description: 'Running app instance (required when several apps are open)',
};

export const ID_OPTION: CliOption = {
  name: 'id',
  arg: '<id>',
  description: 'Stable item id; use commas for commands that accept several ids',
  required: true,
};

export const TITLE_OPTION: CliOption = {
  name: 'title',
  arg: '<text>',
  description: 'Title',
  required: true,
};

export const POSITION_OPTION: CliOption = {
  name: 'position',
  arg: '<position:id>',
  description: 'firstElement, afterElement, or beforeElement position',
};

export const START_DATE_OPTION: CliOption = {
  name: 'start-date',
  aliases: ['start', 'startdate'],
  arg: '<YYYY-MM-DD|today|none>',
  description: 'Start date; "none" clears it',
};

export const DUE_DATE_OPTION: CliOption = {
  name: 'due-date',
  aliases: ['due', 'duedate'],
  arg: '<YYYY-MM-DD|today|none>',
  description: 'Due date; "none" clears it',
};

export const TAGS_OPTION: CliOption = {
  name: 'tags',
  arg: '<a,b|none>',
  description: 'Replace tags; "none" clears them',
};

export const FILTER_OPTIONS: CliOption[] = [
  INSTANCE_OPTION,
  { name: 'show-future', description: 'Include items whose start date is in the future' },
  { name: 'show-completed', description: 'Include completed and canceled items' },
];

export function parseStatusFlag(value: string): ItemStatus {
  if (value === 'complete' || value === 'completed') {
    return 'completed';
  }
  if (value === 'canceled' || value === 'cancelled') {
    return 'canceled';
  }
  if (value === 'created') {
    return 'created';
  }
  throw new Error('--status must be complete, canceled, or created');
}

export const EXPLANATION_OPTIONS: CliOption[] = [
  {
    name: 'explanation',
    arg: '<text>',
    description: 'Explanation shown with the approval request',
    minProtocolVersion: 3,
  },
  {
    name: 'explanation-images',
    arg: '<json>',
    description: 'JSON array of local image paths',
    minProtocolVersion: 3,
  },
];
