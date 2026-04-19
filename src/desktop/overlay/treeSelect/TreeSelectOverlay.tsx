import { AreaIcon, ArrowUpToLineIcon, ChevronRightIcon, InboxIcon } from '@/components/icons';
import { getAllProject } from '@/core/state/getAllProject';
import { OverlayContainer } from '@/desktop/components/Overlay/OverlayContainer';
import { ProjectIcon } from '@/desktop/components/todo/ProjectIcon';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { ITodoService } from '@/services/todo/common/todoService';
import { ItemStatus } from '@/core/type';
import { TestIds } from '@/testIds';
import classNames from 'classnames';
import { TreeID } from 'loro-crdt';
import React, { useEffect, useRef, useState } from 'react';
import { TreeSelectController } from './TreeSelectController';
import { calculateElementWidth } from '../datePicker/constant';
import { getSelectionState, type SelectionState } from './getSelectionState';

interface TreeSelectContentProps {
  controller: TreeSelectController;
}

type OverlayVariant = 'task' | 'project' | 'heading';

interface OverlayProject {
  id: TreeID;
  title: string;
  path: string;
  progress: number;
  status: ItemStatus;
}

interface OverlayArea {
  id: TreeID;
  title: string;
  projects: OverlayProject[];
}

function getVariant(controller: TreeSelectController, todoService: ITodoService): OverlayVariant {
  const currentItem = controller.currentItemId
    ? todoService.modelState.taskObjectMap.get(controller.currentItemId)
    : null;
  if (currentItem?.type === 'project') return 'project';
  if (currentItem?.type === 'projectHeading') return 'heading';
  return 'task';
}

function getOverlayAreas(todoService: ITodoService, searchText: string): OverlayArea[] {
  const { filteredAreas } = getAllProject(todoService.modelState, searchText);
  return filteredAreas.map((area) => ({
    id: area.id,
    title: area.title || localize('area.untitled', 'New Area'),
    projects: area.projectList.map((project) => ({
      id: project.id,
      title: project.title || localize('project.untitled', 'New Project'),
      path: project.areaTitle
        ? `${project.areaTitle} / ${project.title || localize('project.untitled', 'New Project')}`
        : project.title,
      progress: project.progress,
      status: project.status,
    })),
  }));
}

function getInitialExpandedIds(areas: OverlayArea[], selection: SelectionState) {
  const expanded = new Set<string>();
  if (selection.currentAreaId) {
    expanded.add(selection.currentAreaId);
  }
  if (expanded.size === 0 && areas.length > 0) {
    expanded.add(areas[0]!.id);
  }
  return expanded;
}

const TreeSelectContent: React.FC<TreeSelectContentProps> = ({ controller }) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const [searchText, setSearchText] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const variant = getVariant(controller, todoService);
  const selection = getSelectionState(controller, todoService);
  const { currentAreaId, currentProjectId } = selection;
  const areas = getOverlayAreas(todoService, searchText);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => getInitialExpandedIds(areas, selection));
  const isSearching = searchText.trim().length > 0;

  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setExpandedIds(
      getInitialExpandedIds(areas, {
        currentAreaId,
        currentProjectId,
      })
    );
  }, [areas, currentAreaId, currentProjectId, variant]);

  const handleConfirmSelection = (id: TreeID | null) => {
    controller.confirmSelection(id);
  };

  const toggleArea = (id: TreeID) => {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const searchResults = areas.flatMap((area) => {
    const areaMatch = area.title.toLowerCase().includes(searchText.trim().toLowerCase())
      ? [
          {
            id: area.id,
            type: 'area' as const,
            label: area.title,
            selected: area.id === selection.currentAreaId,
          },
        ]
      : [];
    const projectMatches = area.projects
      .filter((project) => {
        const query = searchText.trim().toLowerCase();
        return project.title.toLowerCase().includes(query) || project.path.toLowerCase().includes(query);
      })
      .map((project) => ({
        id: project.id,
        type: 'project' as const,
        label: project.path,
        selected: project.id === selection.currentProjectId,
        project,
      }));

    return [...areaMatch, ...projectMatches];
  });

  return (
    <OverlayContainer
      zIndex={controller.zIndex}
      onDispose={() => controller.dispose()}
      left={
        controller.x -
        calculateElementWidth(
          variant === 'project'
            ? desktopStyles.TreeSelectOverlayAreaPickerContainer
            : desktopStyles.TreeSelectOverlayMoveTargetContainer
        )
      }
      top={controller.y}
      className={
        variant === 'project'
          ? desktopStyles.TreeSelectOverlayAreaPickerContainer
          : desktopStyles.TreeSelectOverlayMoveTargetContainer
      }
      dataTestId={TestIds.TreeSelect.Overlay}
    >
      <div className={desktopStyles.TreeSelectOverlayContent} ref={overlayRef} tabIndex={0}>
        {variant !== 'project' && (
          <div className={desktopStyles.TreeSelectOverlayInputWrap}>
            <input
              className={desktopStyles.TreeSelectOverlayInput}
              type="text"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder={localize('task_attr.search_project', 'Search projects')}
              autoFocus
            />
          </div>
        )}

        <div
          className={
            variant === 'project' ? desktopStyles.TreeSelectOverlayAreaList : desktopStyles.TreeSelectOverlayList
          }
        >
          {variant === 'task' && (
            <>
              <button className={desktopStyles.TreeSelectOverlayAction} onClick={() => handleConfirmSelection(null)}>
                <span className={desktopStyles.TreeSelectOverlayActionIcon}>
                  <InboxIcon className={desktopStyles.TreeSelectOverlayItemIcon} />
                </span>
                <span className={desktopStyles.TreeSelectOverlayProjectLabel}>
                  {localize('task_attr.move_to_inbox', 'Move to Inbox')}
                </span>
              </button>
              {areas.length > 0 && <div className={desktopStyles.TreeSelectOverlayDivider} />}
            </>
          )}

          {variant === 'project' && selection.currentAreaId && (
            <>
              <button
                className={desktopStyles.TreeSelectOverlayAreaAction}
                onClick={() => handleConfirmSelection(null)}
              >
                <span className={desktopStyles.TreeSelectOverlayActionIcon}>
                  <ArrowUpToLineIcon className={desktopStyles.TreeSelectOverlayItemIcon} />
                </span>
                <span className={desktopStyles.TreeSelectOverlayAreaItemLabel}>
                  {localize('project_area_selector.move_to_root', 'Move to root')}
                </span>
              </button>
              {areas.length > 0 && <div className={desktopStyles.TreeSelectOverlayDivider} />}
            </>
          )}

          {variant === 'project' ? (
            areas.length === 0 ? (
              <div className={desktopStyles.TreeSelectOverlayEmpty}>{localize('task_attr.no_areas', 'No areas')}</div>
            ) : (
              areas.map((area) => (
                <button
                  key={area.id}
                  className={classNames(desktopStyles.TreeSelectOverlayAreaItem, {
                    [desktopStyles.TreeSelectOverlayAreaItemSelected]: area.id === selection.currentAreaId,
                  })}
                  onClick={() => handleConfirmSelection(area.id)}
                >
                  <span className={desktopStyles.TreeSelectOverlayAreaItemIcon}>
                    <AreaIcon className={desktopStyles.TreeSelectOverlayItemIcon} />
                  </span>
                  <span className={desktopStyles.TreeSelectOverlayAreaItemLabel}>{area.title}</span>
                </button>
              ))
            )
          ) : isSearching ? (
            searchResults.length === 0 ? (
              <div className={desktopStyles.TreeSelectOverlayEmpty}>
                {localize('task_attr.no_matching_location', 'No matching locations')}
              </div>
            ) : (
              searchResults.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  className={classNames(desktopStyles.TreeSelectOverlaySearchRow, {
                    [desktopStyles.TreeSelectOverlayProjectRowSelected]: result.selected,
                  })}
                  onClick={() => handleConfirmSelection(result.id)}
                >
                  <span className={desktopStyles.TreeSelectOverlayProjectIcon}>
                    {result.type === 'area' ? (
                      <AreaIcon className={desktopStyles.TreeSelectOverlayItemIcon} />
                    ) : (
                      <ProjectIcon
                        progress={result.project?.progress ?? 0}
                        status={result.project?.status ?? 'created'}
                        size="sm"
                      />
                    )}
                  </span>
                  <span className={desktopStyles.TreeSelectOverlaySearchLabel}>{result.label}</span>
                </button>
              ))
            )
          ) : areas.length === 0 ? (
            <div className={desktopStyles.TreeSelectOverlayEmpty}>
              {localize('task_attr.no_location', 'No locations')}
            </div>
          ) : (
            areas.map((area) => {
              const isExpanded = expandedIds.has(area.id);
              const areaRowProps =
                variant === 'task'
                  ? { onClick: () => handleConfirmSelection(area.id) }
                  : { onClick: () => toggleArea(area.id) };

              return (
                <React.Fragment key={area.id}>
                  <div
                    className={classNames(desktopStyles.TreeSelectOverlayAreaRow, {
                      [desktopStyles.TreeSelectOverlayAreaRowSelectable]: true,
                      [desktopStyles.TreeSelectOverlayAreaRowSelected]:
                        area.id === selection.currentAreaId && selection.currentProjectId === null,
                    })}
                    {...areaRowProps}
                  >
                    <button
                      type="button"
                      className={desktopStyles.TreeSelectOverlayChevronButton}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleArea(area.id);
                      }}
                    >
                      <ChevronRightIcon
                        className={classNames(desktopStyles.TreeSelectOverlayChevron, {
                          [desktopStyles.TreeSelectOverlayChevronExpanded]: isExpanded,
                        })}
                      />
                    </button>
                    <span className={desktopStyles.TreeSelectOverlayAreaIcon}>
                      <AreaIcon className={desktopStyles.TreeSelectOverlayItemIcon} />
                    </span>
                    <span className={desktopStyles.TreeSelectOverlayAreaLabel}>{area.title}</span>
                  </div>
                  {isExpanded &&
                    area.projects.map((project) => (
                      <button
                        key={project.id}
                        className={classNames(desktopStyles.TreeSelectOverlayProjectRow, {
                          [desktopStyles.TreeSelectOverlayProjectRowSelected]:
                            project.id === selection.currentProjectId,
                        })}
                        onClick={() => handleConfirmSelection(project.id)}
                      >
                        <span className={desktopStyles.TreeSelectOverlayProjectIcon}>
                          <ProjectIcon progress={project.progress} status={project.status} size="sm" />
                        </span>
                        <span className={desktopStyles.TreeSelectOverlayProjectLabel}>{project.title}</span>
                      </button>
                    ))}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>
    </OverlayContainer>
  );
};

export const TreeSelectOverlay: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: TreeSelectController | null = workbenchOverlayService.getOverlay(OverlayEnum.treeSelect);
  if (!controller) return null;

  return <TreeSelectContent controller={controller} />;
};
