import { AreaIcon } from '@/components/icons';
import { getFilteredProjectsAndAreas } from '@/core/state/getFilteredProjectsAndAreas';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ActionSheet } from '@/mobile/components/ActionSheet';
import { MobileProjectCheckbox } from '@/mobile/components/icon/MobileProjectCheckbox';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { ITodoService } from '@/services/todo/common/todoService';
import classNames from 'classnames';
import { TreeID } from 'loro-crdt';
import React, { useState } from 'react';
import { ProjectAreaSelectorController } from './ProjectAreaSelectorController';

const ProjectAreaSelectorImpl: React.FC<{ controller: ProjectAreaSelectorController }> = ({ controller }) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const [searchText, setSearchText] = useState('');
  const { filteredProjects, filteredAreas, canMoveToRoot } = getFilteredProjectsAndAreas(
    todoService.modelState,
    searchText,
    controller.currentItemId as TreeID
  );

  const handleConfirmSelection = (id: TreeID | null) => {
    controller.confirmSelection(id);
  };

  return (
    <ActionSheet zIndex={controller.zIndex} onClose={() => controller.dispose()}>
      <div className="space-y-4">
        <div className={styles.projectAreaSelectorInputContainer}>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={localize('project_area_selector.search', 'Search projects and areas...')}
            className={styles.projectAreaSelectorInput}
          />
        </div>

        <div className={styles.projectAreaSelectorContainer}>
          {canMoveToRoot && (
            <div className={styles.projectAreaSelectorContentGap}>
              <button className={styles.projectAreaSelectorItem} onClick={() => handleConfirmSelection(null)}>
                <span>{localize('project_area_selector.move_to_root', 'Move to root')}</span>
              </button>
            </div>
          )}
          {filteredProjects.length > 0 && (
            <div className={styles.projectAreaSelectorContentGap}>
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  className={styles.projectAreaSelectorItem}
                  onClick={() => handleConfirmSelection(project.id)}
                >
                  <div className={styles.projectAreaSelectorItemIcon}>
                    <MobileProjectCheckbox progress={project.progress * 100} status={project.status} />
                  </div>
                  <span className={project.isPlaceholder ? 'text-t3' : ''}>{project.displayTitle}</span>
                </button>
              ))}
            </div>
          )}
          {filteredAreas.map((area) => (
            <div key={area.id} className={classNames(styles.projectAreaSelectorContentGap, {})}>
              <div
                className={classNames(styles.projectAreaSelectorItem, {
                  'opacity-50': area.isDisabled,
                })}
                onClick={() => {
                  if (!area.isDisabled) {
                    handleConfirmSelection(area.id);
                  }
                }}
              >
                <div className={styles.projectAreaSelectorItemIcon}>
                  <AreaIcon />
                </div>
                <span className={area.isPlaceholder ? 'text-t3' : ''}>{area.displayTitle}</span>
              </div>
              {area.projectList.length > 0 && (
                <div
                  className={classNames(styles.projectAreaSelectorSubItemPadding, styles.projectAreaSelectorContentGap)}
                >
                  {area.projectList.map((project) => (
                    <button
                      key={project.id}
                      className={styles.projectAreaSelectorItem}
                      onClick={() => handleConfirmSelection(project.id)}
                    >
                      <div className={styles.projectAreaSelectorItemIcon}>
                        <MobileProjectCheckbox progress={project.progress * 100} status={project.status} />
                      </div>
                      <span className={project.isPlaceholder ? 'text-t3' : ''}>{project.displayTitle}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </ActionSheet>
  );
};

export function ProjectAreaSelector() {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: ProjectAreaSelectorController | null = workbenchOverlayService.getOverlay(
    OverlayEnum.projectAreaSelector
  );
  useWatchEvent(controller?.onStatusChange);
  if (!controller) return null;
  return <ProjectAreaSelectorImpl controller={controller}></ProjectAreaSelectorImpl>;
}
