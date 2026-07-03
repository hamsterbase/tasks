import {
  AlarmIcon,
  CalendarRangeIcon,
  CheckIcon,
  CircleIcon,
  CodeIcon,
  CopyIcon,
  LaterProjectsIcon,
  NotesIcon,
  TagIcon,
  TodayIcon,
  ViewIcon,
} from '@/components/icons';
import { renderRuleError } from '@/core/filter/renderError';
import { compileTaskRule } from '@/core/filter/taskRuleCompiler';
import { TaskViewSchema } from '@/core/type';
import { useService } from '@/hooks/use-service';
import { AttrContainer, AttrStyles } from '@/mobile/components/attr/AttrContainer';
import { useToast } from '@/mobile/overlay/toast/useToast';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import classNames from 'classnames';
import Textarea from 'rc-textarea';
import React, { useEffect, useMemo, useState } from 'react';

// Shared with the desktop RuleDocs panel — copying the prompt and pasting it
// into ChatGPT/Claude returns a rule the user can drop into the Rule box.
const AI_PROMPT_URL = 'https://tasks.hamsterbase.com/view-rules.txt';

const viewInfoAttrStyles: AttrStyles = {
  row: styles.projectInfoAttrRow,
  iconContainer: styles.projectInfoAttrIconContainer,
  content: styles.projectInfoAttrContent,
  labelTitleColor: 'text-t2',
};

interface Starter {
  label: string;
  rule: string;
  icon: React.ComponentType<{ className?: string }>;
}

const starters: Starter[] = [
  {
    label: localize('view.docs.starter.notCompleted', 'Not completed'),
    rule: "item.status === 'created'",
    icon: CircleIcon,
  },
  {
    label: localize('view.docs.starter.overdue', 'Overdue'),
    rule: 'item.dueDate !== null && item.dueDate < TODAY',
    icon: AlarmIcon,
  },
  {
    label: localize('view.docs.starter.dueIn7Days', 'Due in next 7 days'),
    rule: 'item.dueDate !== null && item.dueDate < TODAY + 7 * DAY',
    icon: CalendarRangeIcon,
  },
  {
    label: localize('view.docs.starter.anytime', 'Anytime'),
    rule: "item.status === 'created' && (item.startDate === null || item.startDate <= TODAY)",
    icon: TodayIcon,
  },
  {
    label: localize('view.docs.starter.someday', 'Someday'),
    rule: 'item.startDate === SOMEDAY',
    icon: LaterProjectsIcon,
  },
  {
    label: localize('view.docs.starter.taggedWork', "Tagged 'work'"),
    rule: "item.tags.includes('work')",
    icon: TagIcon,
  },
];

const ViewMeta: React.FC<{ view: TaskViewSchema }> = ({ view }) => {
  const todoService = useService(ITodoService);
  const toast = useToast();
  const viewUid = view.uid;

  // Local editing state — commits to the model on blur (not every keystroke),
  // mirroring ProjectMeta. Reset each field when the underlying view changes.
  const [name, setName] = useState(view.name ?? '');
  useEffect(() => {
    setName(view.name ?? '');
  }, [view.name]);

  const [desc, setDesc] = useState(view.desc ?? '');
  useEffect(() => {
    setDesc(view.desc ?? '');
  }, [view.desc]);

  const [rule, setRule] = useState(view.rule ?? '');
  useEffect(() => {
    setRule(view.rule ?? '');
  }, [view.rule]);

  const [copied, setCopied] = useState(false);

  const ruleError = useMemo(() => {
    if (rule.trim() === '') return null;
    const result = compileTaskRule(rule);
    return result.success ? null : renderRuleError(rule, result.error);
  }, [rule]);

  const ruleIsEmpty = rule.trim() === '';

  const commitRule = (value: string) => {
    setRule(value);
    todoService.updateView(viewUid, { rule: value });
  };

  const handleCopyAiPrompt = async () => {
    try {
      const response = await fetch(AI_PROMPT_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
      toast({ message: localize('view.docs.ai.copySuccess', 'AI prompt copied to clipboard') });
    } catch {
      toast({ message: localize('view.docs.ai.copyFailed', 'Failed to fetch AI prompt') });
    }
  };

  return (
    <div className={classNames(styles.screenEdgePadding, 'flex flex-col gap-3')}>
      <div className={styles.projectInfoRoot}>
        <div className={styles.projectInfoLogoContainer}>
          <ViewIcon className={styles.areaMetaIcon} strokeWidth={1.5} />
        </div>
        <div className={styles.projectInfoContent}>
          <Textarea
            className={styles.projectInfoTitle}
            autoSize={{ minRows: 1 }}
            placeholder={localize('view.detail.untitled', 'Untitled view')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => todoService.updateView(viewUid, { name: name.trim() })}
            style={{ border: 'none', padding: 0 }}
          />
          <AttrContainer
            icon={<NotesIcon className={styles.projectInfoMetaIcon} strokeWidth={1.5} />}
            attrStyles={viewInfoAttrStyles}
          >
            <Textarea
              autoSize={{ minRows: 1, maxRows: 4 }}
              placeholder={localize('view.field.descPlaceholder', 'Add description...')}
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              onBlur={() => todoService.updateView(viewUid, { desc })}
              className={styles.createTaskNotesTextarea}
              style={{ border: 'none', padding: 0 }}
            />
          </AttrContainer>

          {/* Rule sits directly under the description as a borderless field,
              matching the notes/description style (icon + text, no nested box). */}
          <AttrContainer
            icon={<CodeIcon className={styles.projectInfoMetaIcon} strokeWidth={1.5} />}
            attrStyles={viewInfoAttrStyles}
          >
            <Textarea
              autoSize={{ minRows: 1, maxRows: 6 }}
              placeholder={localize('view.field.rulePlaceholderMobile', 'Write an expression, or pick a starter below')}
              value={rule}
              onChange={(e) => setRule(e.target.value)}
              onBlur={() => todoService.updateView(viewUid, { rule })}
              className={classNames(styles.createTaskNotesTextarea, 'font-mono')}
              style={{ border: 'none', padding: 0 }}
            />
          </AttrContainer>
          {ruleError && <pre className="text-xs text-accent-danger whitespace-pre-wrap px-0 mt-1">{ruleError}</pre>}
        </div>
      </div>

      {/* Setup helpers — only while the view has no rule, like the desktop docs pane. */}
      {ruleIsEmpty && (
        <div className={styles.formSectionStack}>
          {/* Title is indented to the card-icon line; the content (grid / AI card)
              is full-width, and the AI card's own padding lands its TEXT on that
              same line — so the text aligns with the header, not the card edge. */}
          <div className="flex flex-col gap-2">
            <span className={classNames(styles.areaDetailSectionTitle, styles.areaDetailSectionHeaderIndent)}>
              {localize('view.docs.starters', 'Starters')}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {starters.map((s) => {
                const Icon = s.icon;
                return (
                  <button
                    type="button"
                    key={s.rule}
                    onClick={() => commitRule(s.rule)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg1 text-left text-sm text-t1"
                  >
                    <Icon className="w-4 h-4 shrink-0 text-t3" />
                    <span className="truncate">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <span className={classNames(styles.areaDetailSectionTitle, styles.areaDetailSectionHeaderIndent)}>
              {localize('view.docs.ai.title', 'AI assist')}
            </span>
            <div className="bg-bg1 rounded-2xl p-4 flex flex-col gap-3">
              <p className="text-xs text-t3 leading-5">
                {localize(
                  'view.docs.ai.descMobile',
                  'Copy the prompt below and send it to ChatGPT, Claude, or another AI along with your request (e.g. "show my work tasks for this week"). Paste the rule it returns into the Rule box above.'
                )}
              </p>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={handleCopyAiPrompt}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-bg3 text-sm text-t1"
                >
                  {copied ? <CheckIcon className="w-4 h-4 shrink-0" /> : <CopyIcon className="w-4 h-4 shrink-0" />}
                  <span>
                    {copied
                      ? localize('view.docs.ai.copied', 'Copied')
                      : localize('view.docs.ai.copyButton', 'Copy AI prompt')}
                  </span>
                </button>
                <a href={AI_PROMPT_URL} target="_blank" rel="noopener noreferrer" className="text-sm text-brand">
                  {localize('view.docs.ai.viewSource', 'View source')}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewMeta;
