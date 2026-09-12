import { CliApprovalExplanation } from './CliApprovalExplanation';
import { AreaIcon, ChevronRightIcon, HeadingIcon, HomeIcon, InboxIcon, RightArrowIcon } from '@/components/icons';
import { ProjectIcon } from '@/desktop/components/todo/ProjectIcon';
import { TaskIcon } from '@/desktop/components/todo/TaskIcon';
import { localize } from '@/nls';
import {
  CliApprovalEntityRef,
  CliApprovalEntityType,
  CliApprovalFieldChangeView,
  CliApprovalLocationView,
  CliApprovalOpEntry,
  CliApprovalOpView,
  CliApprovalTreeNodeView,
} from '@/services/cliApproval/common/cliApprovalModel';
import { TestIds } from '@/testIds';
import classNames from 'classnames';
import React from 'react';

/** same shapes as the main lists: tasks are square, projects are round */
const EntityTypeIcon: React.FC<{ type: CliApprovalEntityType | 'heading'; size?: 'xs' | 'sm' }> = ({
  type,
  size = 'xs',
}) => {
  const lucideSize = size === 'sm' ? 'size-3.5' : 'size-3';
  switch (type) {
    case 'task':
      return <TaskIcon status="created" size={size} className="shrink-0" />;
    case 'project':
      return <ProjectIcon size={size} className="shrink-0" />;
    case 'area':
      return <AreaIcon className={`${lucideSize} shrink-0`} />;
    default:
      return <HeadingIcon className={`${lucideSize} shrink-0`} />;
  }
};

/** an inline area / project / heading / task reference: type icon + name */
const EntityName: React.FC<{
  entity: CliApprovalEntityRef;
  muted?: boolean;
  removed?: boolean;
  showIcon?: boolean;
  size?: 'xs' | 'sm';
}> = ({ entity, muted, removed, showIcon = true, size = 'xs' }) => (
  <span
    className={classNames(
      'inline-flex min-w-0 items-center',
      size === 'sm' ? 'gap-1.5 text-sm leading-6' : 'gap-1 text-xs'
    )}
  >
    {showIcon && (
      <span className={classNames('flex h-6 shrink-0 items-center', removed ? 'text-accent-danger' : 'text-t3')}>
        <EntityTypeIcon type={entity.type} size={size} />
      </span>
    )}
    <span
      className={classNames(
        'truncate',
        removed ? 'text-accent-danger' : muted ? 'text-t2' : 'font-medium text-t1',
        !entity.title && 'text-t3 italic'
      )}
    >
      {entity.title || localize('cliApproval.value.untitled', 'Untitled')}
    </span>
  </span>
);

const PLACEHOLDER = '\u0000';

/** localized anchor phrase with the sibling reference inlined at the {0} slot */
const AnchorPhrase: React.FC<{ template: string; item: CliApprovalEntityRef }> = ({ template, item }) => {
  const [prefix, suffix] = template.split(PLACEHOLDER);
  return (
    <>
      {prefix && prefix.trim() && <span className="shrink-0 text-xs text-t3">{prefix.trim()}</span>}
      <EntityName entity={item} muted />
      {suffix && suffix.trim() && <span className="shrink-0 text-xs text-t3">{suffix.trim()}</span>}
    </>
  );
};

/** container path (Area › Project › Heading) plus the sibling anchor, as plain text */
const LocationPath: React.FC<{ location: CliApprovalLocationView }> = ({ location }) => {
  const anchor = location.anchor;
  return (
    <span className="inline-flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5">
      {location.path.length === 0 ? (
        <span className="inline-flex items-center gap-1 text-xs text-t2">
          {location.root === 'inbox' ? (
            <InboxIcon className="size-3 shrink-0 text-t3" />
          ) : (
            <HomeIcon className="size-3 shrink-0 text-t3" />
          )}
          {location.rootLabel}
        </span>
      ) : (
        location.path.map((entity, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRightIcon className="size-3 shrink-0 text-t3" />}
            <EntityName entity={entity} muted />
          </React.Fragment>
        ))
      )}
      {(anchor?.relation === 'after' || anchor?.relation === 'before') && (
        <AnchorPhrase
          template={
            anchor.relation === 'after'
              ? localize('cliApproval.anchor.after', 'after {0}', PLACEHOLDER)
              : localize('cliApproval.anchor.before', 'before {0}', PLACEHOLDER)
          }
          item={anchor.item}
        />
      )}
    </span>
  );
};

const DetailRow: React.FC<{ label: string; block?: boolean; children: React.ReactNode }> = ({
  label,
  block,
  children,
}) => (
  <div className="contents">
    <span className="text-xs leading-5 text-t3">{label}</span>
    <div
      className={classNames(
        'flex min-w-0 gap-x-2 text-xs leading-5',
        block ? 'items-start' : 'flex-wrap items-center gap-y-0.5'
      )}
    >
      {children}
    </div>
  </div>
);

const FieldChangeRow: React.FC<{ change: CliApprovalFieldChangeView }> = ({ change }) => (
  <DetailRow label={change.label}>
    {change.from !== null && (
      <>
        <span className="break-all text-t3 line-through decoration-t3">{change.from}</span>
        <RightArrowIcon className="size-3 shrink-0 text-t3" />
      </>
    )}
    <span className={classNames('break-all whitespace-pre-wrap text-t1', change.from !== null && 'font-medium')}>
      {change.to}
    </span>
  </DetailRow>
);

const TreeNode: React.FC<{ node: CliApprovalTreeNodeView }> = ({ node }) => {
  return (
    <div className="flex flex-col" data-test-id={TestIds.CliApproval.TreeNode}>
      <div className="flex min-w-0 items-center gap-1.5 py-0.5 text-xs leading-5">
        <span className="flex h-5 shrink-0 items-center text-t3">
          <EntityTypeIcon type={node.type} />
        </span>
        <span className={classNames('truncate text-t1', node.type !== 'task' && 'font-medium')}>{node.title}</span>
      </div>
      {node.fields.length > 0 && (
        <div className="flex flex-col pl-[18px]">
          {node.fields.map((field, index) => (
            <div key={index} className="flex flex-wrap items-center gap-x-2 text-xs leading-5">
              <span className="shrink-0 text-t3">{field.label}</span>
              <span className={classNames('break-all', field.field === 'notes' ? 'text-t2' : 'text-t1')}>
                {field.to}
              </span>
            </div>
          ))}
        </div>
      )}
      {node.children.length > 0 && (
        <div className="ml-[5px] flex flex-col border-l border-line-light pl-3">
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} />
          ))}
        </div>
      )}
    </div>
  );
};

/** icon type of the entry's leading column */
function opIconType(op: CliApprovalOpView): CliApprovalEntityType {
  if (op.entity) {
    return op.entity.type;
  }
  if (op.type.endsWith('-task')) {
    return 'task';
  }
  if (op.type.endsWith('-project')) {
    return 'project';
  }
  if (op.type.endsWith('-heading')) {
    return 'projectHeading';
  }
  if (op.type.endsWith('-area')) {
    return 'area';
  }
  const first = op.tree?.[0];
  if (first) {
    return first.type === 'heading' ? 'projectHeading' : first.type;
  }
  return 'task';
}

/**
 * One approvable entry: a single op of a pending request, laid out as one
 * shared label/value grid so its title and every detail value align.
 */
export const CliApprovalOpRow: React.FC<{
  entry: CliApprovalOpEntry;
  onApprove: () => void;
  onReject: () => void;
}> = ({ entry, onApprove, onReject }) => {
  const op = entry.op;
  const isDelete = op.kind === 'delete';
  const hasDetails = op.changes.length > 0 || op.location !== null || op.move !== null || op.tree !== null;

  return (
    <div
      data-test-id={TestIds.CliApproval.OpRow}
      data-scope-uid={op.scope?.uid}
      className="col-span-2 grid min-w-0 grid-cols-subgrid items-start gap-x-5 gap-y-2.5 py-3 first:pt-2 last:pb-2"
    >
      <span
        className={classNames(
          'shrink-0 text-sm leading-6 whitespace-nowrap',
          isDelete ? 'font-medium text-accent-danger' : 'text-t2'
        )}
      >
        {op.action}
      </span>
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 leading-6">
        {op.entity && <EntityName entity={op.entity} size="sm" removed={isDelete} />}
        {!op.entity && op.unresolvedUid && (
          <span className="inline-flex items-center gap-1.5">
            <span className={isDelete ? 'text-accent-danger' : 'text-t3'}>
              <EntityTypeIcon type={opIconType(op)} size="sm" />
            </span>
            <code className="rounded-sm bg-bg2 px-1.5 text-xs text-t3">{op.unresolvedUid}</code>
          </span>
        )}
      </div>
      {hasDetails && (
        <div className="col-span-2 grid min-w-0 grid-cols-subgrid gap-x-5 gap-y-2.5">
          {op.changes.map((change, index) => (
            <FieldChangeRow key={index} change={change} />
          ))}
          {op.location && (
            <DetailRow label={localize('cliApproval.field.parent', 'Location')}>
              <LocationPath location={op.location} />
            </DetailRow>
          )}
          {op.move && (
            <>
              <DetailRow label={localize('cliApproval.move.from', 'From')}>
                <LocationPath location={op.move.from} />
              </DetailRow>
              <DetailRow label={localize('cliApproval.move.to', 'To')}>
                <LocationPath location={op.move.to} />
              </DetailRow>
            </>
          )}
          {op.tree && (
            <DetailRow label={localize('cliApproval.field.children', 'Children')} block>
              <div className="flex min-w-0 flex-1 flex-col gap-1 rounded-lg bg-bg2 px-3 py-2.5">
                {op.tree.map((node, index) => (
                  <TreeNode key={index} node={node} />
                ))}
              </div>
            </DetailRow>
          )}
        </div>
      )}
      {entry.explanation && <CliApprovalExplanation explanation={entry.explanation} />}
      <div className="col-span-2 mt-0.5 flex items-center justify-start gap-1.5">
        <button
          data-test-id={TestIds.CliApproval.ApproveButton}
          className="cursor-pointer rounded-md bg-brand px-3.5 py-1 text-xs font-medium text-white transition-opacity hover:opacity-90"
          onClick={onApprove}
        >
          {localize('cliApproval.approve', 'Approve')}
        </button>
        <button
          data-test-id={TestIds.CliApproval.RejectButton}
          className="cursor-pointer rounded-md px-2 py-1 text-xs text-t2 transition-colors hover:text-accent-danger"
          onClick={onReject}
        >
          {localize('cliApproval.reject', 'Reject')}
        </button>
      </div>
    </div>
  );
};
