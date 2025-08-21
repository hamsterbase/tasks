import { OverlayContainer } from '@/desktop/components/Overlay/OverlayContainer';
import { TaskStatusBox } from '@/desktop/components/todo/TaskStatusBox';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';
import { TagEditorOverlayController } from './TagEditorOverlayController';

export const TagEditorOverlay: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: TagEditorOverlayController | null = workbenchOverlayService.getOverlay(
    OverlayEnum.desktopTagEditor
  );
  useWatchEvent(controller?.onStatusChange);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const focusedItemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (controller) {
      inputRef.current?.focus();
    }
  }, [controller]);

  useEffect(() => {
    if (controller && controller.focusedIndex >= 0 && focusedItemRef.current && scrollContainerRef.current) {
      focusedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [controller?.focusedIndex, controller]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    controller?.updateSearchText(e.target.value);
  };

  const handleTagClick = (tag: string) => {
    if (!controller) return;
    if (controller.selectedTags.includes(tag)) {
      controller.removeTag(tag);
    } else {
      controller.addTag(tag);
    }
  };

  if (!controller) return null;

  const position = controller.getPosition();

  return (
    <OverlayContainer
      zIndex={controller.zIndex}
      onDispose={() => controller.dispose()}
      left={position.x}
      top={position.y}
      className={desktopStyles.TagEditorOverlayContainer}
    >
      <div className={desktopStyles.TagEditorOverlayInputWrapper}>
        <input
          ref={inputRef}
          type="text"
          value={controller.searchText}
          onChange={handleInputChange}
          onBlur={() => {
            // controller.dispose();
          }}
          placeholder={localize('tag_editor.input_placeholder', 'Add or search tags...')}
          className={desktopStyles.TagEditorOverlayInput}
        />
      </div>
      {controller.searchText && !controller.selectedTags.includes(controller.searchText) && (
        <button
          onMouseDown={(e) => {
            e.preventDefault();
          }}
          className={classNames(
            desktopStyles.TagEditorOverlayCreateButton,
            controller.focusedIndex === -1 && desktopStyles.TagEditorOverlayCreateButtonActive
          )}
          onClick={() => handleTagClick(controller.searchText)}
        >
          <span className={desktopStyles.TagEditorOverlayCreateButtonIcon}>+</span>
          {localize('desktop.tag_editor.create_new_tag', 'Create tag "{0}"', controller.searchText)}
        </button>
      )}
      {controller.displayTags.length > 0 && (
        <div ref={scrollContainerRef} className={desktopStyles.TagEditorOverlayScrollContainer}>
          {controller.displayTags.map((tag, index) => {
            const isSelected = controller.selectedTags.includes(tag);
            const isFocused = controller.focusedIndex === index;
            return (
              <div
                key={tag}
                ref={isFocused ? focusedItemRef : undefined}
                className={classNames(
                  desktopStyles.TagEditorOverlayTagItem,
                  isFocused && desktopStyles.TagEditorOverlayTagItemActive
                )}
                onMouseDown={(e) => {
                  e.preventDefault();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTagClick(tag);
                }}
              >
                <div
                  className={classNames(
                    desktopStyles.TagEditorOverlayTagCheckbox,
                    isSelected
                      ? desktopStyles.TagEditorOverlayTagCheckboxSelected
                      : desktopStyles.TagEditorOverlayTagCheckboxUnselected
                  )}
                >
                  <TaskStatusBox status={isSelected ? 'completed' : 'pending'} />
                </div>
                <span>{tag}</span>
              </div>
            );
          })}
        </div>
      )}
    </OverlayContainer>
  );
};
