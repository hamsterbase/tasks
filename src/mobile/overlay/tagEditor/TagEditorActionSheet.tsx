import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';
import { useService } from '../../../hooks/use-service';
import { useWatchEvent } from '../../../hooks/use-watch-event';
import { IWorkbenchOverlayService } from '../../../services/overlay/common/WorkbenchOverlayService';
import { ActionSheet } from '../../components/ActionSheet';
import { styles } from '../../theme';
import { TagEditorActionSheetController } from './TagEditorActionSheetController';

const inputContainerStyles = classNames(
  styles.tagEditorContainerPadding,
  styles.tagEditorContainerRound,
  styles.tagEditorContainerBackground,
  'w-full flex flex-wrap',
  styles.tagEditorSmallGap,
  'items-center',
  styles.tagEditorMinHeightDefault
);

const inputStyles = classNames(
  styles.tagEditorInputTextColor,
  'flex-1 min-w-40 focus:outline-none bg-transparent',
  styles.tagEditorTextSize
);
const selectedTagsStyle = classNames(
  styles.tagEditorTextSize,
  styles.tagEditorSmallGap,
  styles.tagEditorSelectedTagColor,
  'flex items-center'
);

const tagSuggestionStyle = classNames(
  styles.tagEditorSuggestionPadding,
  styles.tagEditorTextSize,
  styles.tagEditorSuggestionRound,
  styles.tagEditorSuggestionBackground,
  styles.tagEditorSuggestionTextColor,
  styles.tagEditorHeightDefault,
  'break-words',
  'w-full',
  'text-left'
);

const createTagButtonStyle = classNames(
  styles.tagEditorSuggestionPadding,
  styles.tagEditorTextSize,
  styles.tagEditorSuggestionRound,
  styles.tagEditorSuggestionBackground,
  styles.tagEditorCreateTagTextColor,
  styles.tagEditorHeightDefault,
  'break-words',
  'w-full',
  'text-left'
);

const useTagInteraction = (controller: TagEditorActionSheetController | null) => {
  const handleTagClick = (tag: string) => {
    if (!controller) return;
    if (controller.selectedTags.includes(tag)) {
      controller.removeTag(tag);
    } else {
      controller.addTag(tag);
    }
  };

  const handleTagTouchStart = (e: React.TouchEvent<HTMLSpanElement> | React.MouseEvent<HTMLSpanElement>) => {
    e.preventDefault();
  };

  const getTagProps = (tag: string) => {
    return {
      onTouchStart: (e: React.TouchEvent<HTMLSpanElement> | React.MouseEvent<HTMLSpanElement>) =>
        handleTagTouchStart(e),
      onMouseDown: (e: React.TouchEvent<HTMLSpanElement> | React.MouseEvent<HTMLSpanElement>) => handleTagTouchStart(e),
      onClick: () => handleTagClick(tag),
    };
  };

  return getTagProps;
};

export const TagEditorActionSheet: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: TagEditorActionSheetController | null = workbenchOverlayService.getOverlay(OverlayEnum.tagEditor);
  useWatchEvent(controller?.onStatusChange);
  const inputRef = useRef<HTMLInputElement>(null);
  const tagProps = useTagInteraction(controller);
  const handleContainerTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleClose = () => {
    controller?.saveTags();
    controller?.dispose();
  };
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!controller) return;
    if (e.key === 'Enter' && controller.searchText) {
      controller.addTag(controller.searchText);
    }
    if (e.key === 'Backspace' && controller.searchText === '') {
      controller.removeTag(controller.selectedTags[controller.selectedTags.length - 1]);
    }
  };

  useEffect(() => {
    if (controller) {
      inputRef.current?.focus();
    }
  }, [controller]);

  if (!controller) return null;

  const tagInputPlaceholder = controller.hasTags
    ? ''
    : localize('tag_editor.input_placeholder', 'Add or search tags...');

  return (
    <ActionSheet zIndex={controller.zIndex} onClose={handleClose}>
      <div className="space-y-4" onTouchStart={handleContainerTouchStart}>
        <div className={inputContainerStyles}>
          {controller.selectedTags.map((tag) => (
            <span className={selectedTagsStyle} {...tagProps(tag)}>
              #{tag}
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={controller.searchText}
            enterKeyHint="done"
            onChange={(e) => controller.updateSearchText(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={tagInputPlaceholder}
            className={inputStyles}
          />
        </div>
        <div
          className={`h-50 overflow-y-scroll flex flex-col ${styles.tagEditorSmallGap}`}
          style={{ marginBottom: 'var(--keyboard-height)' }}
        >
          {controller.searchText && !controller.selectedTags.includes(controller.searchText) && (
            <button className={createTagButtonStyle} {...tagProps(controller.searchText)}>
              {localize('tag_editor.create_new_tag', 'Create tag "#{0}"', controller.searchText)}
            </button>
          )}
          {controller.displayTags.length > 0 && (
            <div className={`flex flex-col ${styles.tagEditorSmallGap}`}>
              {controller.displayTags.map((tag) => (
                <span className={tagSuggestionStyle} key={tag} {...tagProps(tag)}>
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </ActionSheet>
  );
};
