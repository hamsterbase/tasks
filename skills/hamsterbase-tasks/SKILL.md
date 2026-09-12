---
name: hamsterbase-tasks
description: Inspect and manage HamsterBase Tasks through the local flat CLI. Use when the user asks to list running Tasks apps, inspect areas, projects, inbox, today, or task details, or create, update, remove, move, or add task trees through the desktop approval workflow.
version: 0.2.0
---

# HamsterBase Tasks

Use the Tasks CLI against the database currently open in a running HamsterBase Tasks desktop app. Prefer JSON output for inspection and queue all mutations for approval in that app.

## Requirements

- HamsterBase Tasks desktop app installed and running.
- The `hamsterbase-tasks` executable, published as [`@hamsterbase/tasks-cli`](https://www.npmjs.com/package/@hamsterbase/tasks-cli) and requiring Node.js 20 or newer.

If the `hamsterbase-tasks` executable is missing, install it and retry:

```sh
npm install -g @hamsterbase/tasks-cli
```

## Check the CLI version first

This skill ships inside the CLI package and describes exactly the version in its `version` field above. Run
`hamsterbase-tasks skill-dir --json` once before the first command: it returns the installed CLI's `version`
and the `dir` of the skill that shipped with it.

- Versions match: continue.
- CLI is **older** than this skill: stop and ask the user to run `npm install -g @hamsterbase/tasks-cli@latest`.
  Commands described here may not exist in their CLI yet.
- CLI is **newer** than this skill: this copy is stale. Replace this skill's directory with the contents of the
  reported `dir`, then follow the refreshed instructions. The CLI never installs the skill itself.

## Choose the app instance

1. Run `hamsterbase-tasks instances --json`.
2. If exactly one app is running, omit `--instance`.
3. If several apps are running, select the intended one by its returned ID and pass `--instance <id>` to every subsequent command.
4. If no app is running, ask the user to open HamsterBase Tasks.

Every command except `instances` reads from or writes to the database currently open in the selected app instance.

## Inspect before changing

Use `--json` for machine-readable results. Resolve stable IDs with `show`, `inbox`, `today`, `view-project`, or `view-tasks` before issuing a write. When you already hold an ID but not its type — one the user pasted, for instance — run `inspect --id <id>`; it resolves any ID and reports whether it names a task, project, heading, or area. Read commands hide future and completed or canceled items by default; add `--show-future` or `--show-completed` only when those items are relevant.

Read [references/cli.md](references/cli.md) when choosing a command, composing a position, or preparing `add-items` JSON.

## Queue changes

- Run the narrowest write command that expresses the user's request.
- Use `add-items` for several related creates or a nested tree so they require only one desktop approval.
- Treat `--id` values and position references as stable IDs, not display titles.
- A user-supplied `HT#…` string is a HamsterBase Tasks item ID copied from the app's detail panel. Pass it straight
  to `--id` or `--position`; the bare ID without the prefix works too. Run `inspect --id HT#…` first when the write
  you pick depends on whether it names a task, project, heading, or area.
- `remove-tasks` and `view-tasks` take a comma-separated `--id` value; every other command takes exactly one ID. To update several tasks, issue one `update-task` call per task.
- Tell the user that a successful write was queued for desktop approval. Do not claim the database was changed until the request has been approved in the app.
- Re-read the affected item after approval when verification is requested.

Do not edit snapshot or database files directly. A CLI write must target the selected running instance so its open database and approval destination stay matched.

If a command reports that the desktop app is too old for it, the app predates a protocol change the command needs:
tell the user to update HamsterBase Tasks. Every other command keeps working meanwhile.
