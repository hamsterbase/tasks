import { TaskObjectSchema } from '@/core/type';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { ITodoService } from '@/services/todo/common/todoService';
import { TestIds } from '@/testIds';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router';
import { CommandPaletteController } from './CommandPaletteController';
import { SearchResultItem } from './SearchResultItem';
import { getNavigationPath } from '@/core/route/getNavigationPath';

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
    // 排除 projectHeading
    if (item.type === 'projectHeading') {
      continue;
    }

    // 状态过滤：排除已完成和已取消的项目和任务
    if (item.type === 'project' || item.type === 'task') {
      if (item.status === 'completed' || item.status === 'canceled') {
        continue;
      }
    }

    // 搜索匹配
    if (item.title.toLowerCase().includes(lowerQuery)) {
      results.push({ item, matchedField: 'title' });
    } else if ('notes' in item && item.notes && item.notes.toLowerCase().includes(lowerQuery)) {
      results.push({ item, matchedField: 'notes' });
    }
  }

  // 按类型排序：area → project → task
  const typeOrder: Record<string, number> = { area: 1, project: 2, task: 3 };
  results.sort((a, b) => {
    const orderA = typeOrder[a.item.type] || 999;
    const orderB = typeOrder[b.item.type] || 999;
    return orderA - orderB;
  });

  return results;
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

      const navigationPath = getNavigationPath(item, todoService.modelState.taskObjectMap);
      if (navigationPath) {
        navigate(navigationPath.path, { state: navigationPath.state });
        return;
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
                  <SearchResultItem
                    item={result.item}
                    isSelected={isSelected}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleResultClick(result.item);
                    }}
                  />
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
