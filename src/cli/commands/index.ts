import { DownloadAttachmentCommand } from './download-attachment/DownloadAttachmentCommand';
import { requiredProtocolVersion } from '../engine/command';
import { assertInstanceSupports } from '../core/approval';
import { defineCli } from '../engine';
import { AddHeadingCommand } from './add-heading/AddHeadingCommand';
import { AddItemsCommand } from './add-items/AddItemsCommand';
import { AddProjectCommand } from './add-project/AddProjectCommand';
import { AddTaskCommand } from './add-task/AddTaskCommand';
import { InboxCommand } from './inbox/InboxCommand';
import { InspectCommand } from './inspect/InspectCommand';
import { InstancesCommand } from './instances/InstancesCommand';
import { RemoveAreaCommand } from './remove-area/RemoveAreaCommand';
import { RemoveTaskCommand } from './remove-task/RemoveTaskCommand';
import { RemoveTasksCommand } from './remove-tasks/RemoveTasksCommand';
import { ShowCommand } from './show/ShowCommand';
import { SkillDirCommand } from './skill-dir/SkillDirCommand';
import { TodayCommand } from './today/TodayCommand';
import { UpdateAreaCommand } from './update-area/UpdateAreaCommand';
import { UpdateHeadingCommand } from './update-heading/UpdateHeadingCommand';
import { UpdateProjectCommand } from './update-project/UpdateProjectCommand';
import { UpdateTaskCommand } from './update-task/UpdateTaskCommand';
import { ViewProjectCommand } from './view-project/ViewProjectCommand';
import { ViewTasksCommand } from './view-tasks/ViewTasksCommand';

export const cli = defineCli({
  commands: [
    InstancesCommand,
    ShowCommand,
    InboxCommand,
    TodayCommand,
    InspectCommand,
    ViewProjectCommand,
    ViewTasksCommand,
    DownloadAttachmentCommand,
    AddProjectCommand,
    AddTaskCommand,
    AddHeadingCommand,
    AddItemsCommand,
    UpdateTaskCommand,
    UpdateHeadingCommand,
    UpdateProjectCommand,
    UpdateAreaCommand,
    RemoveTaskCommand,
    RemoveAreaCommand,
    RemoveTasksCommand,
    SkillDirCommand,
  ],
  preflight: async (meta, args) =>
    assertInstanceSupports(requiredProtocolVersion(meta, args), args.flags.instance as string),
});
