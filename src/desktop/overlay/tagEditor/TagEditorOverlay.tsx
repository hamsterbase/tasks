import { CheckIcon, PlusIcon } from '@/components/icons';
import { OverlayContainer } from '@/desktop/components/Overlay/OverlayContainer';
import { desktopStyles } from '@/desktop/theme/main';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { TestIds } from '@/testIds';
import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';
import { calculateElementWidth } from '../datePicker/constant';
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
      left={position.x - calculateElementWidth(desktopStyles.TagEditorOverlayContainer)}
      top={position.y}
      className={desktopStyles.TagEditorOverlayContainer}
      dataTestId={TestIds.TagEditor.Overlay}
      filter={{
        value: controller.searchText,
        placeholder: localize('tag_editor.input_placeholder', 'Add or search tags...'),
        onChange: (value) => controller.updateSearchText(value),
        autoFocus: true,
        disposeWhenBlur: true,
      }}
    >
      {
        <div ref={scrollContainerRef} className={desktopStyles.TagEditorOverlayScrollContainer}>
          {controller.showCreateButton && (
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
              <PlusIcon className={desktopStyles.TagEditorOverlayCreateButtonIcon} />
              {localize('desktop.tag_editor.create_new_tag', 'Create "{0}"', controller.searchText)}
            </button>
          )}
          {controller.totalTags === 0 && !controller.showCreateButton && (
            <div className={desktopStyles.TagEditorOverlayEmptyHint}>
              {localize('tag_editor.empty_hint', 'No matching tags')}
            </div>
          )}
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
                onMouseEnter={() => controller.updateFocusedIndex(index)}
                onClick={(e) => {
                  e.stopPropagation();
                  handleTagClick(tag);
                }}
              >
                <span className={desktopStyles.TagEditorOverlayTagLabel}>{tag}</span>
                {isSelected && <CheckIcon className={desktopStyles.TagEditorOverlayTagCheck} />}
              </div>
            );
          })}
        </div>
      }
    </OverlayContainer>
  );
};
