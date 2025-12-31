import { AreaIcon } from '@/components/icons';
import { TaskList } from '@/components/taskList/taskList.ts';
import { TaskObjectSchema } from '@/core/type';
import { getProject } from '@/core/state/getProject';
import { getTaskInfo } from '@/core/state/getTaskInfo';
import { DesktopProjectListItem } from '@/desktop/components/todo/DesktopProjectListItem';
import { TaskListItem } from '@/desktop/components/todo/TaskListItem';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { ITodoService } from '@/services/todo/common/todoService';
import { TestIds } from '@/testIds';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { CommandPaletteController } from './CommandPaletteController';

interface SearchResult {
  item: TaskObjectSchema;
  matchedField: 'title' | 'notes';
}

function searchItems(items: TaskObjectSchema[], query: string): SearchResult[] {
  if (!query.trim()) {
    return [];
  }

  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const item of items) {
    if (item.type === 'projectHeading') {
      continue;
    }

    if (item.title.toLowerCase().includes(lowerQuery)) {
      results.push({ item, matchedField: 'title' });
    } else if ('notes' in item && item.notes && item.notes.toLowerCase().includes(lowerQuery)) {
      results.push({ item, matchedField: 'notes' });
    }
  }

  return results.slice(0, 20);
}

interface CommandPaletteContentProps {
  controller: CommandPaletteController;
}

const CommandPaletteContent: React.FC<CommandPaletteContentProps> = ({ controller }) => {
  const todoService = useService(ITodoService);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  useWatchEvent(controller.onStatusChange);
  useWatchEvent(todoService.onStateChange);

  const searchResults = useMemo(() => {
    return searchItems(todoService.modelState.taskList, controller.searchQuery);
  }, [todoService.modelState.taskList, controller.searchQuery]);

  // Create a dummy task list for TaskListItem - it only needs to provide basic interface
  const dummyTaskList = useMemo(() => new TaskList('search', [], [], null, null), []);

  useEffect(() => {
    controller.setResultsCount(searchResults.length);
  }, [controller, searchResults.length]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (resultsContainerRef.current && controller.selectedIndex >= 0) {
      const selectedElement = resultsContainerRef.current.querySelector(
        `[data-index="${controller.selectedIndex}"]`
      ) as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [controller.selectedIndex]);

  const handleResultClick = useCallback(
    (item: TaskObjectSchema) => {
      controller.close();

      switch (item.type) {
        case 'area':
          navigate(`/desktop/area/${item.uid}`);
          break;
        case 'project':
          navigate(`/desktop/project/${item.uid}`);
          break;
        case 'task': {
          const parentId = item.parentId;
          if (parentId) {
            const parent = todoService.modelState.taskObjectMap.get(parentId);
            if (parent) {
              if (parent.type === 'project' || parent.type === 'projectHeading') {
                const projectId = parent.type === 'projectHeading' ? parent.parentId : parent.id;
                const project = todoService.modelState.taskObjectMap.get(projectId);
                if (project && project.type === 'project') {
                  navigate(`/desktop/project/${project.uid}`, {
                    state: { highlightTaskId: item.id },
                  });
                }
              } else if (parent.type === 'area') {
                navigate(`/desktop/area/${parent.uid}`, {
                  state: { highlightTaskId: item.id },
                });
              }
            }
          } else {
            navigate('/desktop/inbox', {
              state: { highlightTaskId: item.id },
            });
          }
          break;
        }
      }
    },
    [controller, navigate, todoService.modelState.taskObjectMap]
  );

  useEffect(() => {
    const disposable = controller.onConfirmSelection(() => {
      const selectedResult = searchResults[controller.selectedIndex];
      if (selectedResult) {
        handleResultClick(selectedResult.item);
      }
    });
    return () => disposable.dispose();
  }, [controller, searchResults, handleResultClick]);

  const handleInputBlur = useCallback(() => {
    controller.close();
  }, [controller]);

  const handleBackdropClick = useCallback(() => {
    controller.close();
  }, [controller]);

  const handleContainerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      controller.setSearchQuery(e.target.value);
    },
    [controller]
  );

  return (
    <div
      className={desktopStyles.CommandPaletteOverlayBackdrop}
      style={{ zIndex: controller.zIndex }}
      onClick={handleBackdropClick}
      data-test-id={TestIds.CommandPalette.Backdrop}
    >
      <div className={desktopStyles.CommandPaletteOverlayBackgroundMask} />
      <div
        className={desktopStyles.CommandPaletteOverlayContainer}
        onClick={handleContainerClick}
        data-test-id={TestIds.CommandPalette.Overlay}
      >
        <div
          className={`${desktopStyles.CommandPaletteInputContainer} ${controller.searchQuery ? 'border-b border-line-regular' : ''}`}
        >
          <input
            ref={inputRef}
            type="text"
            className={desktopStyles.CommandPaletteInput}
            placeholder={localize('search.placeholder', 'Search tasks, projects, areas...')}
            value={controller.searchQuery}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            data-test-id={TestIds.CommandPalette.Input}
          />
        </div>
        {controller.searchQuery && (
          <div
            ref={resultsContainerRef}
            className={desktopStyles.CommandPaletteResultsContainer}
            data-test-id={TestIds.CommandPalette.ResultsContainer}
          >
            {searchResults.length === 0 && (
              <div className={desktopStyles.CommandPaletteResultsEmpty} data-test-id={TestIds.CommandPalette.NoResults}>
                {localize('search.no_results', 'No results found')}
              </div>
            )}
            {searchResults.map((result, index) => {
              const isSelected = index === controller.selectedIndex;

              return (
                <div
                  key={result.item.id}
                  data-index={index}
                  data-test-id={TestIds.CommandPalette.ResultItem}
                  data-result-type={result.item.type}
                  data-selected={isSelected}
                >
                  {result.item.type === 'area' && (
                    <Link
                      to={`/desktop/area/${result.item.uid}`}
                      className={`${desktopStyles.CommandPaletteResultItem} ${isSelected ? desktopStyles.CommandPaletteResultItemSelected : ''}`}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleResultClick(result.item);
                      }}
                    >
                      <div className={desktopStyles.CommandPaletteResultItemIcon}>
                        <AreaIcon />
                      </div>
                      <span className={desktopStyles.CommandPaletteResultItemTitle}>
                        {result.item.title || localize('area.untitled', 'New Area')}
                      </span>
                    </Link>
                  )}
                  {result.item.type === 'project' && (
                    <div
                      className={isSelected ? desktopStyles.CommandPaletteResultItemSelected : ''}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleResultClick(result.item);
                      }}
                    >
                      <DesktopProjectListItem
                        project={getProject(todoService.modelState, result.item.id)}
                        disableDrag={true}
                      />
                    </div>
                  )}
                  {result.item.type === 'task' && (
                    <div
                      className={isSelected ? desktopStyles.CommandPaletteResultItemSelected : ''}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleResultClick(result.item);
                      }}
                    >
                      <TaskListItem
                        task={getTaskInfo(todoService.modelState, result.item.id)}
                        taskList={dummyTaskList}
                        willDisappear={false}
                        disableDrag={true}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export const CommandPaletteOverlay: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: CommandPaletteController | null = workbenchOverlayService.getOverlay(OverlayEnum.commandPalette);
  useWatchEvent(controller?.onStatusChange);

  if (!controller) return null;

  return <CommandPaletteContent controller={controller} />;
};
