import { AreaIcon, TagIcon } from '@/components/icons';
import { AreaDetailState } from '@/core/state/type';
import { styles } from '@/mobile/theme';
import classNames from 'classnames';
import Textarea from 'rc-textarea';
import React, { useEffect, useState } from 'react';
import { AttrStyles } from '@/mobile/components/attr/AttrContainer';
import { AttrTags } from '@/mobile/components/attr/AttrTags';

const areaInfoAttrStyles: AttrStyles = {
  row: styles.projectInfoAttrRow,
  iconContainer: styles.projectInfoAttrIconContainer,
  content: styles.projectInfoAttrContent,
  labelTitleColor: 'text-t2',
};

interface AreaMetaProps {
  areaDetail: AreaDetailState;
  onUpdateTitle: (title: string) => void;
  onEditTag: () => void;
}

const AreaMeta: React.FC<AreaMetaProps> = ({ areaDetail, onUpdateTitle, onEditTag }) => {
  const [title, setTitle] = useState(areaDetail?.title);
  useEffect(() => {
    setTitle(areaDetail?.title);
  }, [areaDetail?.title]);

  const areaTags = areaDetail.tags || [];

  return (
    <div className={classNames(styles.screenEdgePadding, styles.projectInfoSection)}>
      <div className={styles.projectInfoRoot}>
        <div className={styles.projectInfoLogoContainer}>
          <AreaIcon className={styles.areaMetaIcon} />
        </div>
        <div className={styles.projectInfoContent}>
          <Textarea
            className={styles.projectInfoTitle}
            autoSize={{ minRows: 1 }}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => onUpdateTitle(title ?? '')}
            style={{ border: 'none', padding: 0 }}
          />
          {areaTags.length > 0 && (
            <AttrTags
              icon={<TagIcon className={styles.projectInfoMetaIcon} strokeWidth={1.5} />}
              placeholder=""
              tags={areaTags}
              onClick={onEditTag}
              attrStyles={areaInfoAttrStyles}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AreaMeta;
