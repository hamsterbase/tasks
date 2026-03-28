import React from 'react';
import { styles } from '../../theme';
import { AttrContainer, AttrStyles } from './AttrContainer';

interface AttrTagsProps {
  icon: React.ReactNode;
  placeholder: string;
  tags: string[];
  onClick?: () => void;
  testId?: string;
  attrStyles?: AttrStyles;
}

export const AttrTags: React.FC<AttrTagsProps> = ({ icon, placeholder, tags, onClick, testId, attrStyles }) => {
  return (
    <AttrContainer icon={icon} onClick={onClick} testId={testId} attrStyles={attrStyles}>
      {tags.length > 0 ? (
        <div className={styles.createTaskTagsContainer}>
          {tags.map((tag) => (
            <span key={tag} className={styles.createTaskTag}>
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
