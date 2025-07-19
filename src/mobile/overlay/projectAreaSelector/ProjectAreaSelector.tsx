import { AreaIcon } from '@/components/icons';
import { getAllProject } from '@/core/state/getAllProject';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { ActionSheet } from '@/mobile/components/ActionSheet';
import { ProjectStatusBox } from '@/components/icons/ProjectStatusBox.tsx';
import { styles } from '@/mobile/theme';
import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { ITodoService } from '@/services/todo/common/todoService';
import classNames from 'classnames';
import React, { useState } from 'react';
import { ProjectAreaSelectorController } from './ProjectAreaSelectorController';
import { TreeID } from 'loro-crdt';

const ProjectAreaSelectorImpl: React.FC<{ controller: ProjectAreaSelectorController }> = ({ controller }) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const [searchText, setSearchText] = useState('');
  const { filteredProjects, filteredAreas } = getAllProject(todoService.modelState, searchText);
  const handleConfirmSelection = (id: TreeID) => {
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
          {filteredProjects.length > 0 && (
            <div className={styles.projectAreaSelectorContentGap}>
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  className={styles.projectAreaSelectorItem}
                  onClick={() => handleConfirmSelection(project.id)}
                >
                  <div className={styles.projectAreaSelectorItemIcon}>
                    <ProjectStatusBox progress={project.progress} status={project.status} color="t3" />
                  </div>
                  {project.title}
                </button>
              ))}
            </div>
          )}
          {filteredAreas.map((area) => (
            <div key={area.id} className={classNames(styles.projectAreaSelectorContentGap, {})}>
              <div
                className={classNames(styles.projectAreaSelectorItem, {
                  'opacity-50': !controller.allowMoveToArea,
                })}
                onClick={() => {
                  if (controller.allowMoveToArea) {
                    handleConfirmSelection(area.id);
                  }
                }}
              >
                <div className={styles.projectAreaSelectorItemIcon}>
                  <AreaIcon />
                </div>
                {area.title}
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
                        <ProjectStatusBox progress={project.progress} status={project.status} color="t3" />
                      </div>
                      {project.title}
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
