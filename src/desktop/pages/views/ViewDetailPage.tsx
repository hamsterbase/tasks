import { getTodayTimestampInUtc } from '@/base/common/getTodayTimestampInUtc';
import { viewPageTitleInputId } from '@/components/edit/inputId';
import { FilterIcon, ViewIcon } from '@/components/icons';
import { TaskList } from '@/components/taskList/taskList';
import { compileTaskRule } from '@/core/filter/taskRuleCompiler';
import { getView } from '@/core/state/views/getView';
import { getViewItems, matchRuleIds } from '@/core/state/views/getViewItems';
import { EntityHeader } from '@/desktop/components/common/EntityHeader';
import { DesktopPage } from '@/desktop/components/DesktopPage';
import { TagFilterBar } from '@/desktop/components/filter/TagFilterBar';
import { useTagFilter } from '@/desktop/components/filter/useTagFilter';
import { ListContainer } from '@/desktop/components/listContainer/ListContainer';
import { TaskListItem } from '@/desktop/components/todo/TaskListItem';
import { TodayGroupHeader } from '@/desktop/components/todo/TodayGroupHeader';
import { useDesktopTaskDisplaySettings } from '@/desktop/hooks/useDesktopTaskDisplaySettings';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IEditService } from '@/services/edit/common/editService';
import { IListService } from '@/services/list/common/listService';
import { ITodoService, VIEW_SCHEMA_VERSION } from '@/services/todo/common/todoService';
import { TestIds } from '@/testIds';
import { DndContext } from '@dnd-kit/core';
import type { TreeID } from 'loro-crdt';
import React, { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useParams } from 'react-router';
import { RuleDocs } from './RuleDocs';

function isSameTags(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((tag, index) => tag === b[index]);
}

export const ViewDetailPage: React.FC = () => {
  const { viewUid } = useParams<{ viewUid: string }>();
  const todoService = useService(ITodoService);
  const listService = useService(IListService);
  const editService = useService(IEditService);
  const location = useLocation();
  useWatchEvent(todoService.onStateChange);
  useWatchEvent(listService.onMainListChange);

  const { showFutureTasks, showCompletedTasks, completedAfter, openTaskDisplaySettings } =
    useDesktopTaskDisplaySettings(`view:${viewUid ?? 'unknown'}`);

  const [allTags, setAllTags] = useState<string[]>([]);
  const tagFilter = useTagFilter(allTags);

  // Don't compile an empty rule — show the docs panel instead of a parse error.
  const view = viewUid ? getView(todoService.modelState, viewUid) : null;
  const ruleIsEmpty = view ? view.rule.trim() === '' : true;
  // The view was written by a newer build than this one — we can't faithfully
  // evaluate it. Bail out before compiling and render an unsupported state.
  const unsupportedVersion = !!view && view.schemaVersion > VIEW_SCHEMA_VERSION;

  // Separate "rule compile error" from "empty rule" so the UI can stay on the
  // docs panel for both, without running the heavy filter for an invalid rule.
  // Skip compilation entirely for an unsupported-version view.
  const ruleCompiled = !ruleIsEmpty && view && !unsupportedVersion ? compileTaskRule(view.rule) : null;
  const hasError = !!ruleCompiled && !ruleCompiled.success;

  // Lock the rule-matched task ids at mount and on rule change. Subsequent
  // edits that make a task no longer match the rule must NOT yank it from the
  // visible list — the user only sees fresh rule evaluation after re-entering
  // the view or changing the rule. Display-settings + tag filters still apply
  // live on top of this snapshot.
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
          tagFilter.currentTag,
          lockedRuleIds
        )
      : { items: [], groups: [], itemIds: [], willDisappearObjectIdSet: new Set<TreeID>(), allTags: [] };

  useEffect(() => {
    setAllTags((prev) => (isSameTags(prev, viewItems.allTags) ? prev : viewItems.allTags));
  }, [viewItems.allTags]);

  const tasks = viewItems.items;
  const itemIdsKey = viewItems.itemIds.join(',');

  useEffect(() => {
    if (!viewUid) return;
    const listName = `View:${viewUid}`;
    if (listService.mainList && listService.mainList.name === listName) {
      listService.mainList.updateItems(viewItems.itemIds);
    } else {
      listService.setMainList(new TaskList(listName, viewItems.itemIds, [], null, null));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listService, viewUid, itemIdsKey]);

  const focusInputState = (location.state as { focusInput?: string } | null)?.focusInput;
  useEffect(() => {
    if (focusInputState && view && !view.name) {
      editService.focusInput(focusInputState);
    }
  }, [focusInputState, editService, view?.name]);

  if (!viewUid || !view) return <Navigate to="/desktop" replace />;

  // Hold rendering of TaskListItem until the IListService.mainList has been
  // swapped to this view's list. Otherwise the first render hands out the
  // previous page's mainList and clicks select into the wrong list.
  const mainListReady = listService.mainList?.name === `View:${viewUid}`;
  const isTagFilterActive = tagFilter.currentTag.type !== 'all';

  return (
    <DesktopPage
      header={
        <EntityHeader
          variant="page"
          editable
          disableNewLine
          inputKey={`view-name:${viewUid}`}
          inputId={viewPageTitleInputId(viewUid)}
          renderIcon={() => <ViewIcon />}
          title={view.name}
          placeholder={localize('view.detail.untitled', 'Untitled view')}
          onSave={(value) => todoService.updateView(viewUid, { name: value })}
          extraActions={[
            {
              icon: <FilterIcon strokeWidth={1.5} />,
              handleClick: tagFilter.clickFilter,
              title: localize('tasks.filterByTag', 'Filter by Tag'),
              testId: TestIds.EntityHeader.FilterToggleButton,
              isActive: tagFilter.isFilterOpen || isTagFilterActive,
            },
          ]}
          internalActions={{
            displaySettings: { onOpen: (right, bottom) => openTaskDisplaySettings(right, bottom) },
          }}
          titleDetail={
            tagFilter.isFilterOpen ? (
              <TagFilterBar tags={tagFilter.tags} selected={tagFilter.currentTag} onSelect={tagFilter.selectTag} />
            ) : null
          }
        />
      }
    >
      {unsupportedVersion && (
        <div className={desktopStyles.ViewUnsupportedContainer}>
          <div className={desktopStyles.ViewUnsupportedTitle}>
            {localize('view.unsupported.title', 'Update the app to view this')}
          </div>
          <div className={desktopStyles.ViewUnsupportedBody}>
            {localize(
              'view.unsupported.body',
              'This view was created with a newer version of the app. Please update the app to open it.'
            )}
          </div>
        </div>
      )}

      {!unsupportedVersion && (ruleIsEmpty || hasError) && <RuleDocs viewUid={viewUid} />}

      {!unsupportedVersion && !ruleIsEmpty && !hasError && tasks.length === 0 && (
        <div className={desktopStyles.ViewDetailEmpty}>
          {localize('view.detail.empty', 'No tasks match this view.')}
        </div>
      )}

      {!unsupportedVersion && !ruleIsEmpty && !hasError && tasks.length > 0 && mainListReady && (
        <DndContext>
          <ListContainer taskList={listService.mainList}>
            {viewItems.groups.map((group) => (
              <React.Fragment key={group.id}>
                {group.kind !== 'noParent' && (
                  <TodayGroupHeader id={group.id} variant={group.kind} title={group.title} />
                )}
                {group.tasks.map((task) => {
                  const willDisappear = viewItems.willDisappearObjectIdSet.has(task.id);
                  return (
                    <TaskListItem
                      key={task.id}
                      task={task}
                      willDisappear={willDisappear}
                      taskList={listService.mainList!}
                      disableDrag
                      hideProjectTitle
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </ListContainer>
        </DndContext>
      )}
    </DesktopPage>
  );
};
