import TextArea from 'rc-textarea';
import React from 'react';
import { styles } from '../../theme';
import { AttrContainer } from './AttrContainer';

interface AttrTextAreaProps {
  icon: React.ReactNode;
  content: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export const AttrTextArea: React.FC<AttrTextAreaProps> = ({ icon, content, onChange, placeholder }) => {
  return (
    <AttrContainer icon={icon}>
      <TextArea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoSize={{ minRows: 2 }}
        className={styles.createTaskNotesTextarea}
        style={{ border: 'none', padding: 0 }}
      />
    </AttrContainer>
  );
};
