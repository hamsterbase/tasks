import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { DeleteIcon, MenuIcon, TaskDisplaySettingsIcon, ViewIcon } from '@/components/icons';
import { compileTaskRule } from '@/core/filter/taskRuleCompiler';
import { getView } from '@/core/state/views/getView';
import { getViewItems, matchRuleIds } from '@/core/state/views/getViewItems';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { useBack } from '@/hooks/useBack';
import { TaskItem } from '@/mobile/components/todo/TaskItem';
import { useDialog } from '@/mobile/overlay/dialog/useDialog';
import { PopupActionItem } from '@/mobile/overlay/popupAction/PopupActionController';
import { usePopupAction } from '@/mobile/overlay/popupAction/usePopupAction';
import { localize } from '@/nls';
import { ITodoService, VIEW_SCHEMA_VERSION } from '@/services/todo/common/todoService';
import type { TreeID } from 'loro-crdt';
import classNames from 'classnames';
import React, { useEffect, useMemo } from 'react';
import { useParams } from 'react-router';
import { useMobileTagFilter } from '../components/filter/useMobileTagFilter';
import { PageLayout } from '../components/PageLayout';
import TaskItemWrapper from '../components/taskItem/TaskItemWrapper';
import { useTaskDisplaySettingsMobile } from '../hooks/useTaskDisplaySettings';
import { styles } from '../theme';
import ViewMeta from './view/ViewMeta';

export const ViewPage = () => {
  const { viewUid } = useParams<{ viewUid: string }>();
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const back = useBack();
  const dialog = useDialog();
  const popupAction = usePopupAction();

  const { showFutureTasks, showCompletedTasks, completedAfter, openTaskDisplaySettings } =
    useTaskDisplaySettingsMobile(`view:${viewUid ?? 'unknown'}`);

  const tagFilter = useMobileTagFilter();
  const { observeTags } = tagFilter;

  const view = viewUid ? getView(todoService.modelState, viewUid) : null;
  const ruleIsEmpty = view ? view.rule.trim() === '' : true;
  // A view written by a newer build than this one — we can't faithfully
  // evaluate its rule, so bail out before compiling.
  const unsupportedVersion = !!view && view.schemaVersion > VIEW_SCHEMA_VERSION;
  const ruleCompiled = !ruleIsEmpty && view && !unsupportedVersion ? compileTaskRule(view.rule) : null;
  const hasError = !!ruleCompiled && !ruleCompiled.success;

  // Lock the rule-matched ids at mount and on rule change — editing a task so
  // it no longer matches must not yank it from the list mid-session. Display
  // settings + tag filter still apply live on top of this snapshot.
  const lockedRuleIds = useMemo<TreeID[]>(() => {
    if (!view || ruleIsEmpty || hasError || unsupportedVersion) return [];
    return matchRuleIds(view.rule, todoService.modelState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewUid, view?.rule, hasError, ruleIsEmpty, unsupportedVersion]);

  const today = getTodayTimestampInUtc();
  const viewItems =
    !ruleIsEmpty && !hasError && !unsupportedVersion && view
      ? getViewItems(
          view.rule,
          todoService.modelState,
          today,
          {
            showCompletedTasks,
            showFutureTasks,
            currentDate: today,
            completedAfter,
            recentChangedTaskSet: new Set<TreeID>(todoService.keepAliveElements as TreeID[]),
          },
          tagFilter.value,
          lockedRuleIds
        )
      : { items: [], groups: [], itemIds: [], willDisappearObjectIdSet: new Set<TreeID>(), allTags: [] };

  useEffect(() => {
    observeTags(viewItems.allTags);
  }, [viewItems.allTags, observeTags]);

  const handleDelete = () => {
    if (!viewUid || !view) return;
    dialog({
      title: localize('view.delete.title', 'Delete view'),
      description: localize(
        'view.delete.description',
        'Are you sure you want to delete this view? This cannot be undone.'
      ),
      confirmText: localize('view.menu.delete', 'Delete view'),
      onConfirm: () => {
        if (!getView(todoService.modelState, viewUid)) return;
        todoService.deleteView(viewUid);
        back();
      },
      onCancel: () => {},
    });
  };

  const handleMoreOptions = () => {
    if (!view) return;
    popupAction({
      groups: [
        {
          items: [
            {
              icon: <DeleteIcon />,
              name: localize('view.menu.delete', 'Delete view'),
              danger: true,
              onClick: handleDelete,
            },
          ] as PopupActionItem[],
        },
      ],
    });
  };

  // Keep the centered header title empty — a long view name would slide under
  // the right-side action buttons (absolute layout). The name is shown as an
  // inline-editable heading in the page meta instead, where it can wrap.
  const header = {
    showBack: true,
    id: viewUid ?? 'view',
    title: '',
    renderIcon: (className: string) => <ViewIcon className={className} />,
    actions: [
      tagFilter.headerAction,
      {
        icon: <TaskDisplaySettingsIcon />,
        onClick: openTaskDisplaySettings,
      },
      ...(view
        ? [
            {
              icon: <MenuIcon className={styles.headerActionButtonIcon} strokeWidth={1.5} />,
              onClick: handleMoreOptions,
            },
          ]
        : []),
    ],
  };

  let body: React.ReactNode;
  if (!view) {
    body = <div className={styles.pageEmptyState}>{localize('view.notFound', 'View not found')}</div>;
  } else if (unsupportedVersion) {
    body = (
      <div className={styles.pageEmptyState}>
        {localize(
          'view.unsupported.body',
          'This view was created with a newer version of the app. Please update the app to open it.'
        )}
      </div>
    );
  } else if (ruleIsEmpty || hasError) {
    // The meta already shows the rule editor (with inline error + starters +
    // AI assist), so an extra empty-state message here would be redundant.
    body = null;
  } else if (viewItems.items.length === 0) {
    body = <div className={styles.pageEmptyState}>{localize('view.detail.empty', 'No tasks match this view.')}</div>;
  } else {
    const willDisappearObjectIdSet = viewItems.willDisappearObjectIdSet;
    body = viewItems.groups.map((group) => (
      <div
        key={group.id}
        className={classNames(styles.taskItemGroupBackground, styles.taskItemGroupRound, styles.taskItemGroupSpacing)}
      >
        {group.kind !== 'noParent' && (
          <div className={classNames(styles.taskItemGroupHeader, styles.taskItemPaddingX)}>
            <span className={styles.taskItemGroupTitle}>{group.title}</span>
          </div>
        )}
        <div>
          {group.tasks.map((task) => (
            <TaskItemWrapper key={task.id} willDisappear={willDisappearObjectIdSet.has(task.id)} id={task.id}>
              <TaskItem taskInfo={task} hideProjectTitle />
            </TaskItemWrapper>
          ))}
        </div>
      </div>
    ));
  }

  // Only the editable meta when the view exists and this build understands its
  // schema — otherwise the body shows the not-found / unsupported message alone.
  const meta = view && !unsupportedVersion ? <ViewMeta view={view} /> : undefined;

  return (
    <PageLayout header={header} meta={meta}>
      {tagFilter.filterBar}
      {body}
    </PageLayout>
  );
};
