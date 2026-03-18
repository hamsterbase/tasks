import React from 'react';
import { styles } from '../../theme';
import { AttrContainer } from './AttrContainer';

interface AttrTagsProps {
  icon: React.ReactNode;
  placeholder: string;
  tags: string[];
  onClick?: () => void;
  testId?: string;
}

export const AttrTags: React.FC<AttrTagsProps> = ({ icon, placeholder, tags, onClick, testId }) => {
  return (
    <AttrContainer icon={icon} onClick={onClick} testId={testId}>
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
