import { desktopStyles } from '@/desktop/theme/main';
import classNames from 'classnames';
import React from 'react';

interface TaskDetailAttributeRowProps {
  icon: React.ReactNode;
  label: string;
  content: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
  placeholder?: boolean;
  danger?: boolean;
  contentClassName?: string;
  className?: string;
}

export const TaskDetailAttributeRow: React.FC<TaskDetailAttributeRowProps> = ({
  icon,
  label,
  content,
  onClick,
  placeholder = false,
  danger = false,
  contentClassName,
  className,
}) => {
  const iconNode = React.isValidElement<{ className?: string }>(icon)
    ? React.cloneElement(icon, {
        className: classNames(desktopStyles.TaskDetailAttributeIcon, icon.props.className),
      })
    : icon;

  const contentWrapperClassName = classNames(
    desktopStyles.TaskDetailAttributeContent,
    {
      [desktopStyles.TaskDetailAttributeContentPlaceholder]: placeholder,
    },
    contentClassName
  );

  const contentNode = (
    <>
      <div
        className={classNames(desktopStyles.TaskDetailAttributeIconContainer, {
          [desktopStyles.TaskDetailAttributeIconContainerDanger]: danger,
          [desktopStyles.TaskDetailAttributeIconContainerPlaceholder]: placeholder,
        })}
      >
        {iconNode}
      </div>
      <span className={desktopStyles.TaskDetailAttributeLabel}>{label}</span>
      <div className={contentWrapperClassName}>{content}</div>
    </>
  );

  if (onClick) {
    return (
      <div className={classNames(desktopStyles.TaskDetailAttributeRow, className)} onClick={onClick} role="button">
        {contentNode}
      </div>
    );
  }

  return <div className={classNames(desktopStyles.TaskDetailAttributeRow, className)}>{contentNode}</div>;
};
