import React from 'react';
import { styles } from '../theme';
import { PageHeader, PageHeaderProps } from './PageHeader';
import classNames from 'classnames';
import { DndContext, DndContextProps } from '@dnd-kit/core';
import { useDragSensors } from '@/hooks/useDragSensors';
import { SortableContext, SortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { LastPlacement } from './dnd/lastPlacement';
import { DragOverlayItemProps, OverlayItem } from './dnd/DragOverlayItem';
import { BottomMenuProps, BottomMenu } from './BottomMenu';

interface PageLayoutDragOption {
  overlayItem?: DragOverlayItemProps;
  // 默认使用 useDragSensors
  sensors?: DndContextProps['sensors'];
  collisionDetection: DndContextProps['collisionDetection'];
  onDragEnd: DndContextProps['onDragEnd'];

  sortable?: {
    items: string[];
    strategy?: SortingStrategy;
    lastPlacement?: boolean;
  };
}

interface PageLayoutProps {
  header?: PageHeaderProps;
  meta?: React.ReactNode;
  children?: React.ReactNode;
  dragOption?: PageLayoutDragOption;
  bottomMenu?: BottomMenuProps;
}

export const PageLayout: React.FC<PageLayoutProps> = (props: PageLayoutProps) => {
  const sensors = useDragSensors();

  const childrenContainerPadding = classNames(styles.pageContentPaddingX, styles.pageContentPaddingY);

  let children = (
    <React.Fragment>
      <div className={childrenContainerPadding}>{props.children}</div>
      {props.bottomMenu && <BottomMenu {...props.bottomMenu} />}
    </React.Fragment>
  );
  if (props.dragOption) {
    if (props.dragOption.sortable) {
      children = (
        <DndContext
          sensors={props.dragOption.sensors ?? sensors}
          collisionDetection={props.dragOption.collisionDetection}
          onDragEnd={props.dragOption.onDragEnd}
        >
          <SortableContext
            items={props.dragOption.sortable.items}
            strategy={props.dragOption.sortable.strategy ?? verticalListSortingStrategy}
          >
            <div className={childrenContainerPadding}>
              {props.dragOption.overlayItem && <OverlayItem {...props.dragOption.overlayItem} />}
              {props.children}
              {props.dragOption.sortable.lastPlacement && <LastPlacement />}
            </div>
            {props.bottomMenu && <BottomMenu {...props.bottomMenu} />}
          </SortableContext>
        </DndContext>
      );
    } else {
      children = (
        <DndContext
          sensors={props.dragOption.sensors ?? sensors}
          collisionDetection={props.dragOption.collisionDetection}
          onDragEnd={props.dragOption.onDragEnd}
        >
          <div className={childrenContainerPadding}>{props.children}</div>
          {props.bottomMenu && <BottomMenu {...props.bottomMenu} />}
        </DndContext>
      );
    }
  }

  return (
    <div
      className={classNames(styles.pageBackground, 'polyfill-min-h-dvh min-h-dvh text-t1', {
        'safe-top': !props.header,
      })}
      id="page-content"
    >
      {props.header && (
        <div className={classNames('sticky top-0 z-100 mb-2 safe-top', styles.headerBackground)}>
          <PageHeader
            id={props.header.id}
            title={props.header.title}
            renderIcon={props.header.renderIcon}
            icon={props.header.icon}
            actions={props.header.actions}
            headerPlaceholder={props.header.headerPlaceholder}
            onSave={props.header.onSave}
            handleClickTaskDisplaySettings={props.header.handleClickTaskDisplaySettings}
          />
        </div>
      )}
      {props.meta && <div className="mb-4">{props.meta}</div>}
      <div className="safe-bottom">{children}</div>
      <div className="h-[var(--keyboard-height)] w-full"></div>
    </div>
  );
};
