import React from 'react';
import { Text } from 'ink';
import { z } from 'zod';
import { resolveSkillDir } from '../../core/skill';
import { CLI_VERSION } from '../../core/version';
import { CommandMeta, ParsedArgs, parseCommandFlags } from '../../engine';

const flagsSchema = z.object({}).strict();

export interface SkillDirResult {
  dir: string;
  version: string;
}

function renderSkillDir(result: SkillDirResult) {
  return <Text>{result.dir}</Text>;
}

export class SkillDirCommand {
  static readonly meta: CommandMeta = {
    name: 'skill-dir',
    description: 'Print the directory of the agent skill shipped with this CLI',
    view: renderSkillDir,
  };

  static create(args: ParsedArgs): SkillDirCommand {
    parseCommandFlags(args, flagsSchema);
    return new SkillDirCommand();
  }

  async exec(): Promise<SkillDirResult> {
    return { dir: await resolveSkillDir(), version: CLI_VERSION };
  }
}
