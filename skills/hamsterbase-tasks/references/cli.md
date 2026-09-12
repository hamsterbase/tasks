# HamsterBase Tasks CLI reference

## Invocation and selection

Every command is invoked as `hamsterbase-tasks <command>`.

All commands are top-level commands.

Run `hamsterbase-tasks instances --json` first. Commands other than `instances` use the database currently open in the selected app:

- One running app: `--instance` is optional.
- Several running apps: pass `--instance <id>`.
- No running app: open HamsterBase Tasks before continuing.

`--instance-id` and `--instanceid` are accepted aliases for `--instance`. `--json` is a global output option.

## Item IDs

Every item id may be written bare (`V1StGXR8_Z5j`) or with the `HT#` prefix (`HT#V1StGXR8_Z5j`) that the desktop
app's detail panel copies to the clipboard. The two forms are equivalent everywhere an id is accepted — `--id`,
comma-separated `--id` lists, and the reference inside `--position`.

## Version and skill

```text
skill-dir
--version
```

- `skill-dir` prints the directory of the agent skill that shipped with this CLI; `--json` returns it as
  `{ "dir": "...", "version": "..." }`, where `version` is the CLI's own version. The CLI only reports the
  path — copying the skill anywhere is the caller's job.
- `hamsterbase-tasks --version` prints the same version on its own. A source checkout reports `dev`.

Write commands can require a minimum desktop app version. When the selected app is older than a command needs,
that command fails with an explicit "update HamsterBase Tasks" error instead of misbehaving; the rest keep working.

## Read commands

The list commands hide future and completed or canceled items by default. `--show-future` includes items with a future start date. `--show-completed` includes completed and canceled items.

```text
instances
show [--show-future] [--show-completed] [--instance <id>]
inbox [--show-future] [--show-completed] [--instance <id>]
today [--show-future] [--show-completed] [--instance <id>]
inspect --id <id[,id...]> [--show-future] [--show-completed] [--instance <id>]
view-project --id <project-id> [--show-future] [--show-completed] [--instance <id>]
view-tasks --id <task-id[,task-id...]> [--instance <id>]
download-attachment --id <task-or-project-id> --attachment <attachment-id> --output <path> [--instance <id>]
```

- `show` lists available areas and projects.
- `inbox` lists inbox tasks.
- `today` returns today's tasks and projects as a flat list.
- `inspect` takes an id of any kind and returns whatever it names; the `type` field of the result is `task`,
  `project`, `heading`, or `area`. Use it when an id arrives without a known type — a user-pasted `HT#…`, say —
  instead of guessing between `view-project` and `view-tasks`.
- `view-project` returns project information and its task tree.
- `view-tasks` returns detailed information for one or more tasks.
- `inspect`, `view-tasks`, and `view-project` include an `attachments` array on task/project details: `{ id,
  filename, mimetype, size }`. Deleted attachments are excluded; `size` is in bytes.
- `download-attachment` downloads one attachment belonging to the specified task or project, using the
  selected desktop app's storage configuration. `--output` is a file path in an existing directory and must
  not exist. JSON output is `{ path, filename, mimetype, size }`; `path` is absolute. Open that path with an
  image-viewing tool to read image contents. The command needs an open desktop window supporting protocol v2.
  It does not queue approval, expose storage credentials, or download external links found in notes. The
  desktop app downloads the bytes and transfers them to the CLI over local IPC; each attachment is limited to
  32 MiB.

Prefer `--json` while resolving IDs:

```sh
hamsterbase-tasks show --json
hamsterbase-tasks inspect --id HT#V1StGXR8_Z5j --json
hamsterbase-tasks view-project --id project-uid --json
hamsterbase-tasks view-tasks --id task-uid-1,task-uid-2 --json
```

## Create commands

```text
add-project --title <text> [--parent <area-id>] [--instance <id>]
add-task --title <text> [--position <position>] [--instance <id>]
add-heading --title <text> --position <position> [--instance <id>]
add-items --content <json> [--position <position>] [--instance <id>]
```

Omitting `--parent` creates a root project. Omitting `--position` on `add-task` creates the task in the inbox. Use `add-items` to create several ordered items or a nested task tree in one approval request.

## Update commands

```text
update-task --id <task-id> [fields] [--instance <id>]
update-heading --id <heading-id> [--title <text>] [--position <position>] [--instance <id>]
update-project --id <project-id> [fields] [--instance <id>]
update-area --id <area-id> [fields] [--instance <id>]
```

At least one update field is required. Every update command takes exactly one ID; to change several tasks, issue one `update-task` call per task.

`update-task` fields:

```text
--title <text>
--notes <text|none>
--start-date <YYYY-MM-DD|today|none>
--due-date <YYYY-MM-DD|today|none>
--tags <tag[,tag...]|none>
--status <complete|canceled|created>
--position <position>
```

`update-project` supports title, notes, start date, due date, tags, and position. `update-heading` supports title and position. `update-area` supports title, tags, and position.

`--start` and `--startdate` alias `--start-date`. `--due` and `--duedate` alias `--due-date`. Use `none` to clear notes, dates, or tags.

## Position syntax

Use one of:

```text
firstElement:<parent-id>
afterElement:<sibling-id>
beforeElement:<sibling-id>
```

`firstElement:root`, `firstElement:inbox`, and bare `firstElement` select the root/inbox position when that item type allows it. The referenced parent or sibling must exist, and the resulting parent must support the item type:

- Tasks: root/inbox, area, project, heading, or another task.
- Headings: project.
- Projects: root or area.
- Areas: root.

Subtask nesting is limited to one level, and a subtask's parent is fixed:

- A task can be **created** under another task, but only if that task is not itself a subtask, and only if the new task brings no children of its own.
- A task can never be **moved** under another task. Create it in place instead.
- A subtask can only be reordered among its siblings; it cannot be moved to a different task, project, heading, or the inbox.

Examples:

```sh
hamsterbase-tasks add-task --title "Draft brief" --position firstElement:project-uid
hamsterbase-tasks update-task --id task-uid --position afterElement:other-task-uid
hamsterbase-tasks add-heading --title "QA" --position beforeElement:heading-uid
```

## Remove commands

```text
remove-task --id <task-id> [--instance <id>]
remove-tasks --id <task-id[,task-id...]> [--instance <id>]
remove-area --id <area-id> [--instance <id>]
```

Removing an area also removes its contents after approval.

## Add ordered or nested items

```text
add-items --content <json> [--position <position>] [--instance <id>]
```

Content may be one item or an ordered, non-empty array. Top-level items may be tasks, headings, or projects. Project and task objects may contain `notes`, `startDate`, `dueDate`, and a string-array `tags`. Dates accept `YYYY-MM-DD` or `today`. A task may be a title string or an object, task objects may contain nested task children, and a heading may contain task children.

The position applies to the first top-level item; later items are inserted after the item created immediately before them. Omitting the position inserts at the root, so a heading requires a project position. Existing project-import JSON remains valid:

```json
{
  "type": "project",
  "title": "Website launch",
  "children": [
    "Write brief",
    {
      "type": "heading",
      "title": "QA",
      "children": [
        {
          "type": "task",
          "title": "Smoke test",
          "tags": ["release"]
        }
      ]
    }
  ]
}
```

Pass compact JSON as one quoted shell argument:

```sh
hamsterbase-tasks add-items --content '{"type":"project","title":"Website launch","children":["Write brief"]}'
hamsterbase-tasks add-items --position firstElement:heading-uid --content '["First task","Second task","Third task"]'
```

## Approval explanations

All create, update, and remove commands accept these optional flags:

```text
--explanation <text>
--explanation-images <json>
```

`--explanation` accepts Markdown, rendered like task notes. Use `[label](https://example.com)` for links.
`--explanation-images` takes a JSON array of local image paths. The CLI reads local files, uses the file extension
for the MIME type, and sends base64 bytes over IPC. Only the filename is retained, not the source path.
Download remote images to local files before passing them to the CLI. Prefer PNG, JPEG, WebP, or GIF. Follow the size and count guidelines in SKILL.md;
the CLI and IPC do not enforce text, image-count, or image-size limits.
Images alone and text alone are both supported. Existing task notes and attachments are not modified.
The explanation applies to the entire request, including all operations in a batch, and is removed with it.

```sh
hamsterbase-tasks update-task --id HT#V1StGXR8_Z5j --status complete --explanation 'Fixed the layout; tests passed. Details: https://example.com/result' --explanation-images '["/tmp/after.png","/tmp/screenshot.png"]'
```

These flags require desktop protocol v3; omitting them preserves each command's existing version requirement.

## Approval semantics

Every create, update, and remove command submits a request to the selected desktop app. A successful CLI response means the request is queued, not that it has already changed the database. The user must approve it in HamsterBase Tasks.
