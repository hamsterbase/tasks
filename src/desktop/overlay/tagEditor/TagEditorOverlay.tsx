import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import React, { useEffect, useRef } from 'react';
import { TagEditorOverlayController } from './TagEditorOverlayController';
import classNames from 'classnames';
import { CheckIcon } from '@/components/icons';

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
    <>
      <div className="fixed inset-0" style={{ zIndex: controller.zIndex - 1 }} onClick={() => controller.dispose()} />

      <div
        className="fixed bg-bg1 rounded-lg shadow-xl border border-line-light"
        style={{
          zIndex: controller.zIndex,
          left: position.x,
          top: position.y,
          width: '320px',
          maxHeight: '400px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3">
          {/* Search Input */}
          <div className="mb-3">
            <input
              ref={inputRef}
              type="text"
              value={controller.searchText}
              onChange={handleInputChange}
              onBlur={() => {
                console.log('Input blurred');
                controller.dispose();
              }}
              placeholder={localize('tag_editor.input_placeholder', 'Add or search tags...')}
              className="w-full px-3 py-2 border border-line-light rounded-md outline-none focus:border-brand text-sm"
            />
          </div>
        </div>

        <div className="px-3 pb-3">
          {controller.searchText && !controller.selectedTags.includes(controller.searchText) && (
            <button
              onMouseDown={(e) => {
                e.preventDefault();
              }}
              className={classNames(
                'w-full px-3 py-2 text-left text-sm hover:bg-bg2 transition-colors flex items-center gap-2 rounded mb-1',
                controller.focusedIndex === -1 && 'bg-bg2'
              )}
              onClick={() => handleTagClick(controller.searchText)}
            >
              <span className="text-brand">+</span>
              {localize('desktop.tag_editor.create_new_tag', 'Create tag "{0}"', controller.searchText)}
            </button>
          )}

          {controller.displayTags.length > 0 && (
            <div ref={scrollContainerRef} className="space-y-1 overflow-y-auto" style={{ maxHeight: '280px' }}>
              {controller.displayTags.map((tag, index) => {
                const isSelected = controller.selectedTags.includes(tag);
                const isFocused = controller.focusedIndex === index;
                return (
                  <div
                    key={tag}
                    ref={isFocused ? focusedItemRef : undefined}
                    className={classNames(
                      'flex items-center gap-2 px-3 py-2 text-sm hover:bg-bg2 cursor-pointer transition-colors rounded',
                      isFocused && 'bg-bg2'
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Tag clicked:', tag);
                      handleTagClick(tag);
                    }}
                  >
                    <div
                      className={classNames(
                        'w-4 h-4 border-2 rounded flex items-center justify-center',
                        isSelected ? 'bg-brand border-brand' : 'text-t3'
                      )}
                    >
                      {isSelected && <CheckIcon className="w-3 h-3 text-text-white" />}
                    </div>
                    <span>{tag}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
