import React from 'react';
import { styles } from '../theme';
import { PageHeader, PageHeaderProps } from './PageHeader';
import classNames from 'classnames';
import { DndContext, DndContextProps } from '@dnd-kit/core';
import { useDragSensors } from '@/hooks/useDragSensors';
import { SortableContext, SortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { LastPlacement } from './dnd/lastPlacement';
import { DragOverlayItemProps, OverlayItem } from './dnd/DragOverlayItem';
import { FAB } from './FAB';

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
  onFabClick?: () => void;
  disableSticky?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = (props: PageLayoutProps) => {
  const sensors = useDragSensors();

  const childrenContainerPadding = classNames(styles.pageContentPaddingX, styles.pageContentPaddingY);

  let children = (
    <React.Fragment>
      <div className={childrenContainerPadding}>{props.children}</div>
      {props.onFabClick && <FAB onClick={props.onFabClick} />}
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
            {props.onFabClick && <FAB onClick={props.onFabClick} />}
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
          {props.onFabClick && <FAB onClick={props.onFabClick} />}
        </DndContext>
      );
    }
  }

  return (
    <div
      className={classNames(styles.pageBackground, styles.pageLayoutRoot, {
        [styles.pageLayoutSafeTop]: !props.header,
      })}
      id="page-content"
    >
      {props.header && <div className={classNames(styles.pageLayoutHeaderPlaceholder, styles.headerBackground)} />}
      {props.header && (
        <div
          className={classNames(styles.pageLayoutHeaderContainer, styles.headerBackground, {
            [styles.pageLayoutSticky]: !props.disableSticky,
          })}
        >
          <PageHeader
            id={props.header.id}
            title={props.header.title}
            renderIcon={props.header.renderIcon}
            icon={props.header.icon}
            actions={props.header.actions}
            showBack={props.header.showBack}
            headerPlaceholder={props.header.headerPlaceholder}
            onSave={props.header.onSave}
          />
        </div>
      )}
      {props.meta && <div className={styles.pageLayoutMetaSpacing}>{props.meta}</div>}
      <div className={styles.pageLayoutSafeBottom}>{children}</div>
      <div className={styles.pageLayoutKeyboardSpacer}></div>
    </div>
  );
};
