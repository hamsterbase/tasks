import { CloseIcon } from '@/components/icons';
import classNames from 'classnames';
import React from 'react';
import { styles } from '../../theme';
import { AttrContainer } from './AttrContainer';

export interface AttrLabelListItem {
  title: string;
  subtitle?: string;
  titleType?: 'danger';
}

type AttrLabelListBaseProps = {
  icon: React.ReactNode;
  placeholder: string;
  testId?: string;
};

type AttrLabelListInteractiveProps = AttrLabelListBaseProps & {
  type: 'interactive';
  items: AttrLabelListItem[];
  onLabelClick?: (index: number) => void;
  onRemove?: (index: number) => void;
  addButtonLabel: string;
  onAdd: () => void;
};

export type AttrLabelListProps = AttrLabelListInteractiveProps;

const LabelItem: React.FC<{ item: AttrLabelListItem }> = ({ item }) => (
  <p className={styles.createTaskReminderContent}>
    <span
      className={classNames(styles.createTaskReminderTitle, {
        'text-accent-danger': item.titleType === 'danger',
      })}
    >
      {item.title}
    </span>
    {item.subtitle && <span className={styles.createTaskReminderSubtitle}>{item.subtitle}</span>}
  </p>
);

export const AttrLabelList: React.FC<AttrLabelListProps> = (props) => {
  const { icon, items } = props;

  const { onLabelClick, onRemove, addButtonLabel, onAdd } = props;
  return (
    <AttrContainer icon={icon} testId={props.testId}>
      <div className={styles.createTaskSubtaskList}>
        {items.map((item, index) => (
          <div key={index} className={styles.createTaskReminderItem}>
            <button className={styles.createTaskReminderText} onClick={() => onLabelClick?.(index)}>
              <LabelItem item={item} />
            </button>
            {onRemove && (
              <button className={styles.createTaskReminderRemoveBtn} onClick={() => onRemove(index)}>
                <CloseIcon className={styles.createTaskRemoveIcon} strokeWidth={1.5} />
              </button>
            )}
          </div>
        ))}
        {addButtonLabel && (
          <span
            className={styles.createTaskAddButton}
            onClick={onAdd}
            data-testid={props.testId ? `${props.testId}-add` : undefined}
          >
            {addButtonLabel}
          </span>
        )}
      </div>
    </AttrContainer>
  );
};
