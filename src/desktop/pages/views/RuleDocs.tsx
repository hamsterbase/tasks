import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { localize } from '@/nls';
import { ITodoService } from '@/services/todo/common/todoService';
import React from 'react';

interface RuleDocsProps {
  viewUid: string;
}

const starters: { label: string; rule: string }[] = [
  { label: 'Not yet started', rule: "item.status === 'created'" },
  { label: 'Completed', rule: "item.status === 'completed'" },
  { label: 'In inbox', rule: "item.parent === 'inbox'" },
  {
    label: 'Anytime',
    rule: "item.status === 'created' && (item.startDate === null || item.startDate <= TODAY)",
  },
  { label: 'Someday', rule: 'item.startDate === SOMEDAY' },
  { label: 'Overdue', rule: 'item.dueDate !== null && item.dueDate < TODAY' },
  { label: 'Due in next 7 days', rule: 'item.dueDate !== null && item.dueDate < TODAY + 7 * DAY' },
  { label: "Tagged 'work'", rule: "item.tags.includes('work')" },
  { label: 'Inside a project', rule: "item.parent === 'project'" },
];

const constants: { name: string; meaning: string }[] = [
  { name: 'TODAY', meaning: "Today's UTC midnight timestamp" },
  { name: 'DAY', meaning: 'Milliseconds in a day (86,400,000)' },
  { name: 'SOMEDAY', meaning: 'Sentinel for "Someday" (Dec 31, 2999 UTC)' },
];

const fields: { name: string; type: string }[] = [
  { name: 'item.title', type: 'string' },
  { name: 'item.notes', type: 'string' },
  { name: 'item.status', type: "'created' | 'completed' | 'canceled'" },
  { name: 'item.tags', type: 'string[]' },
  { name: 'item.startDate', type: 'number | null' },
  { name: 'item.dueDate', type: 'number | null' },
  { name: 'item.completionAt', type: 'number | null' },
  { name: 'item.createdAt', type: 'number' },
  { name: 'item.parent', type: "'inbox' | 'project' | 'area' | 'heading' | 'task'" },
  { name: 'item.projectTitle', type: 'string' },
  { name: 'item.areaTitle', type: 'string' },
];

const operators: { op: string; note: string }[] = [
  { op: '===  !==', note: 'equality' },
  { op: '>   >=   <   <=', note: 'comparison (numeric fields only)' },
  { op: '&&   ||   !', note: 'logical and / or / not' },
  { op: '+  -  *  /', note: 'arithmetic (in numeric RHS, e.g. TODAY + 7 * DAY)' },
  { op: "arr.includes('x')", note: 'array contains' },
  { op: 'field === null', note: 'null check (numeric fields only)' },
];

export const RuleDocs: React.FC<RuleDocsProps> = ({ viewUid }) => {
  const todoService = useService(ITodoService);

  const handleStarterClick = (rule: string) => {
    todoService.updateView(viewUid, { rule });
  };

  return (
    <div className={desktopStyles.RuleDocsContainer}>
      <div className={desktopStyles.RuleDocsIntro}>
        {localize(
          'view.docs.intro',
          'This view has no rule yet. Pick a starter below, or write your own on the right.'
        )}
      </div>

      <section>
        <div className={desktopStyles.RuleDocsSectionHeading}>
          {localize('view.docs.starters', 'Starters')}
        </div>
        <div className={desktopStyles.RuleDocsList}>
          {starters.map((s) => (
            <button
              type="button"
              key={s.rule}
              className={desktopStyles.RuleDocsStarterRow}
              onClick={() => handleStarterClick(s.rule)}
            >
              <span className={desktopStyles.RuleDocsRowLabel}>{s.label}</span>
              <code className={desktopStyles.RuleDocsRowCode}>{s.rule}</code>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className={desktopStyles.RuleDocsSectionHeading}>
          {localize('view.docs.fields', 'Fields')}
        </div>
        <div className={desktopStyles.RuleDocsList}>
          {fields.map((f) => (
            <div key={f.name} className={desktopStyles.RuleDocsRow}>
              <code className={desktopStyles.RuleDocsRowLabel}>{f.name}</code>
              <code className={desktopStyles.RuleDocsRowCode}>{f.type}</code>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className={desktopStyles.RuleDocsSectionHeading}>
          {localize('view.docs.constants', 'Constants')}
        </div>
        <div className={desktopStyles.RuleDocsList}>
          {constants.map((c) => (
            <div key={c.name} className={desktopStyles.RuleDocsRow}>
              <code className={desktopStyles.RuleDocsRowLabel}>{c.name}</code>
              <span className={desktopStyles.RuleDocsRowNote}>{c.meaning}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className={desktopStyles.RuleDocsSectionHeading}>
          {localize('view.docs.operators', 'Operators')}
        </div>
        <div className={desktopStyles.RuleDocsList}>
          {operators.map((o) => (
            <div key={o.op} className={desktopStyles.RuleDocsRow}>
              <code className={desktopStyles.RuleDocsRowLabel}>{o.op}</code>
              <span className={desktopStyles.RuleDocsRowNote}>{o.note}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
