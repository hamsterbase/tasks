import React from 'react';
import classNames from 'classnames';
import { styles } from '../../theme';
import { AttrContainer, AttrStyles } from './AttrContainer';

interface AttrTagsProps {
  icon: React.ReactNode;
  placeholder: string;
  tags: string[];
  onClick?: () => void;
  testId?: string;
  attrStyles?: AttrStyles;
  tagClassName?: string;
}

export const AttrTags: React.FC<AttrTagsProps> = ({
  icon,
  placeholder,
  tags,
  onClick,
  testId,
  attrStyles,
  tagClassName,
}) => {
  return (
    <AttrContainer icon={icon} onClick={onClick} testId={testId} attrStyles={attrStyles}>
      {tags.length > 0 ? (
        <div className={styles.createTaskTagsContainer}>
          {tags.map((tag) => (
            <span key={tag} className={classNames(styles.createTaskTag, tagClassName)}>
              {tag}
            </span>
          ))}
        </div>
      ) : (
        <span className={styles.createTaskAttrPlaceholder}>{placeholder}</span>
      )}
    </AttrContainer>
  );
};
