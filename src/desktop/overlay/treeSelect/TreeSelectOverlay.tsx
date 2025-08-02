import { AreaIcon } from '@/components/icons';
import { ProjectStatusBox } from '@/components/icons/ProjectStatusBox';
import { getAllProject } from '@/core/state/getAllProject';
import { useService } from '@/hooks/use-service';
import { useWatchEvent } from '@/hooks/use-watch-event';
import { localize } from '@/nls';
import { OverlayEnum } from '@/services/overlay/common/overlayEnum';
import { IWorkbenchOverlayService } from '@/services/overlay/common/WorkbenchOverlayService';
import { ITodoService } from '@/services/todo/common/todoService';
import classNames from 'classnames';
import { TreeID } from 'loro-crdt';
import React, { useEffect, useRef, useState } from 'react';
import { TreeSelectController } from './TreeSelectController';

interface TreeSelectContentProps {
  controller: TreeSelectController;
}

const TreeSelectContent: React.FC<TreeSelectContentProps> = ({ controller }) => {
  const todoService = useService(ITodoService);
  useWatchEvent(todoService.onStateChange);
  const [searchText, setSearchText] = useState('');
  const overlayRef = useRef<HTMLDivElement>(null);
  const { filteredProjects, filteredAreas } = getAllProject(todoService.modelState, searchText);

  const currentItem = controller.currentItemId
    ? todoService.modelState.taskObjectMap.get(controller.currentItemId)
    : null;

  const isCurrentItemProject = currentItem?.type === 'project';
  const isCurrentItemHeading = currentItem?.type === 'projectHeading';

  useEffect(() => {
    if (overlayRef.current) {
      overlayRef.current.focus();
    }
  }, []);

  const handleConfirmSelection = (id: TreeID) => {
    controller.confirmSelection(id);
  };

  const handleBackdropClick = () => {
    controller.dispose();
  };

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    left: controller.x - 320,
    top: controller.y,
    width: '320px',
    maxHeight: '400px',
    zIndex: 1000,
  };

  const allowMoveToArea = !isCurrentItemHeading;

  return (
    <>
      <div className="fixed inset-0" style={{ zIndex: 999 }} onClick={handleBackdropClick} />

      <div
        ref={overlayRef}
        style={overlayStyle}
        className="bg-bg1 border border-line-light rounded-lg shadow-lg"
        tabIndex={0}
      >
        <div className="p-3 border-b border-line-light">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={localize('project_area_selector.search', 'Search projects and areas...')}
            className="w-full px-3 py-2 bg-bg2 rounded-md outline-none text-sm"
            autoFocus
          />
        </div>

        <div className="max-h-[320px] overflow-y-auto p-2">
          {!isCurrentItemProject && filteredProjects.length > 0 && (
            <div className="mb-2">
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-bg3 rounded-md transition-colors text-left"
                  onClick={() => handleConfirmSelection(project.id)}
                >
                  <ProjectStatusBox
                    progress={project.progress}
                    status={project.status}
                    color="t3"
                    className="size-5 shrink-0"
                  />
                  {project.title ? (
                    <span className="text-sm truncate">{project.title}</span>
                  ) : (
                    <span className="text-sm truncate text-t3">{localize('project.untitled', 'New Project')}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {filteredAreas.map((area) => (
            <div key={area.id} className="mb-2">
              <button
                className={classNames(
                  'w-full flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors text-left',
                  allowMoveToArea ? 'hover:bg-bg3' : 'opacity-50 cursor-not-allowed'
                )}
                disabled={!allowMoveToArea}
                onClick={() => {
                  if (allowMoveToArea) {
                    handleConfirmSelection(area.id);
                  }
                }}
              >
                <AreaIcon className="size-5 shrink-0 text-t3" />
                {area.title ? (
                  <span className="text-sm font-medium truncate">{area.title}</span>
                ) : (
                  <span className="text-sm font-medium truncate text-t3">
                    {localize('project.untitled', 'New Project')}
                  </span>
                )}
              </button>

              {!isCurrentItemProject && area.projectList.length > 0 && (
                <div className="ml-6">
                  {area.projectList.map((project) => (
                    <button
                      key={project.id}
                      className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-bg3 rounded-md transition-colors text-left"
                      onClick={() => handleConfirmSelection(project.id)}
                    >
                      <ProjectStatusBox
                        progress={project.progress}
                        status={project.status}
                        color="t3"
                        className="size-5 shrink-0"
                      />
                      {project.title ? (
                        <span className="text-sm truncate">{project.title}</span>
                      ) : (
                        <span className="text-sm truncate text-t3">{localize('project.untitled', 'New Project')}</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export const TreeSelectOverlay: React.FC = () => {
  const workbenchOverlayService = useService(IWorkbenchOverlayService);
  useWatchEvent(workbenchOverlayService.onOverlayChange);
  const controller: TreeSelectController | null = workbenchOverlayService.getOverlay(OverlayEnum.treeSelect);
  if (!controller) return null;

  return <TreeSelectContent controller={controller} />;
};
